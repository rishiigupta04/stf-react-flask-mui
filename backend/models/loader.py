import os
import pickle

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_PATH = os.path.join(ROOT, "phishing_lgbm.pkl")

_model_package = None


def load_model_package():
    """Load and cache the ML package (pickle) if available."""
    global _model_package
    if _model_package is not None:
        return _model_package

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

    with open(MODEL_PATH, "rb") as f:
        _model_package = pickle.load(f)
    return _model_package


def get_model():
    pkg = load_model_package()
    return pkg.get("model"), pkg.get("scaler"), pkg.get("features")


def get_model_info():
    try:
        pkg = load_model_package()
        return {"has_model": True, "features": pkg.get("features", [])}
    except Exception as e:
        return {"has_model": False, "error": str(e)}

