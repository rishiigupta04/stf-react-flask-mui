from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os, sys, traceback
from werkzeug.utils import secure_filename

# Ensure project root is on path so we can import app1/app2
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

app = Flask(__name__)
CORS(app)

# Places to store uploads
USER_FOLDER = os.path.join(ROOT, "User")
os.makedirs(USER_FOLDER, exist_ok=True)

# Lazy import of your existing modules. Import errors will be returned by /health
try:
    from app2 import classify_content
    from app1 import check_website
    _IMPORT_ERROR = None
except Exception as e:
    classify_content = None
    check_website = None
    _IMPORT_ERROR = traceback.format_exc()

# Try to import model loader (optional)
try:
    from backend.models import loader as model_loader
    _LOADER_ERROR = None
except Exception:
    model_loader = None
    _LOADER_ERROR = traceback.format_exc()


@app.route("/health", methods=["GET"])
def health():
    """Simple health check"""
    return jsonify({
        "status": "ok",
        "imports": "ok" if _IMPORT_ERROR is None else "error",
        "import_error": None if _IMPORT_ERROR is None else _IMPORT_ERROR,
        "loader": "ok" if _LOADER_ERROR is None else "error",
        "loader_error": None if _LOADER_ERROR is None else _LOADER_ERROR,
        "user_folder": USER_FOLDER,
    })


@app.route("/model-info", methods=["GET"])
def model_info():
    """Return basic info about the pickled ML package (if available)"""
    if model_loader is None:
        return jsonify({"error": "Model loader not available", "details": _LOADER_ERROR}), 500
    try:
        info = model_loader.get_model_info()
        return jsonify({"success": True, "info": info})
    except Exception as e:
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500


@app.route("/predict", methods=["POST"])
def predict():
    """POST /predict
    JSON body: {"url": "https://..."}
    Returns: JSON result from classify_content
    """
    if _IMPORT_ERROR:
        return jsonify({"error": "Backend import failure", "details": _IMPORT_ERROR}), 500

    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    url = data.get("url") or data.get("text")
    if not url:
        return jsonify({"error": "No url/text provided"}), 400

    try:
        result = classify_content(url)
        return jsonify({"success": True, "result": result})
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": str(e), "traceback": tb}), 500


@app.route("/similarity", methods=["POST"])
def similarity():
    """POST /similarity
    JSON body: {"url": "https://..."}
    Returns: JSON result from check_website
    """
    if _IMPORT_ERROR:
        return jsonify({"error": "Backend import failure", "details": _IMPORT_ERROR}), 500

    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    url = data.get("url")
    if not url:
        return jsonify({"error": "No url provided"}), 400

    try:
        result = check_website(url)
        return jsonify({"success": True, "result": result})
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": str(e), "traceback": tb}), 500


# New endpoint: upload an image file for similarity checking
@app.route("/similarity-upload", methods=["POST"])
def similarity_upload():
    """Accepts multipart/form-data with a file field 'file'. Saves file to User/ and runs check_website on it.
    Returns similarity result JSON.
    """
    if _IMPORT_ERROR:
        return jsonify({"error": "Backend import failure", "details": _IMPORT_ERROR}), 500

    if 'file' not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    save_path = os.path.join(USER_FOLDER, filename)
    try:
        file.save(save_path)
        # call check_website with local file path
        result = check_website(save_path)
        return jsonify({"success": True, "result": result})
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": str(e), "traceback": tb}), 500


@app.route('/static/brands/<path:filename>')
def serve_brand_image(filename):
    brands_dir = os.path.join(ROOT, 'Brands')
    return send_from_directory(brands_dir, filename)

@app.route('/static/user/<path:filename>')
def serve_user_image(filename):
    user_dir = os.path.join(ROOT, 'User')
    return send_from_directory(user_dir, filename)


if __name__ == "__main__":
    # Run Flask app on port 5000
    app.run(host="0.0.0.0", port=5000, debug=True)
