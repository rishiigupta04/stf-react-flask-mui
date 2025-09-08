Backend (Flask) for Spot-the-Fake

Files added/modified:
- app.py - Flask routes: /health, /model-info, /predict, /similarity, /similarity-upload
- models/loader.py - helper to load the existing pickled model (phishing_lgbm.pkl)
- requirements.txt - backend-specific pip dependencies

Quick start (Windows / macOS / Linux):
1. Create and activate a virtualenv (recommended):
   python -m venv .venv
   .\.venv\Scripts\activate    # Windows
   source .venv/bin/activate     # macOS / Linux

2. Install dependencies:
   pip install -r backend/requirements.txt

3. Run the Flask app:
   python backend/app.py

Endpoints:
- GET /health -> basic status and import diagnostics
- GET /model-info -> returns info about the pickled ML package (if available)
- POST /predict -> JSON {"url": "https://..."} returns ML+LLM prediction
- POST /similarity -> JSON {"url": "https://..."} returns similarity result
- POST /similarity-upload -> multipart/form-data file upload (field name 'file') to run image similarity

Notes / gotchas:
- The backend imports your existing app1.py and app2.py to reuse logic. If those files depend on packages not installed (selenium, ollama, tesseract), /health will show import errors.
- Selenium requires Chrome and a compatible chromedriver or Selenium Manager.
- Ollama must be installed and models pulled if you want LLM analysis.
- Tesseract OCR must be installed on the system for OCR functionality.

If you see import errors when hitting /health, install missing dependencies shown in the import_error string.

