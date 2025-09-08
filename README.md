Spot the Fake — SaaS Demo

This workspace contains a prototype ML + LLM-powered phishing and website similarity analyzer with a polished React frontend (MUI) and Flask backend.

What I added
- Frontend: new landing/dashboard structure and components (Navbar, Hero, Features, Dashboard cards).
  - Files created under frontend/src/components/
    - Navbar.jsx, Hero.jsx, Features.jsx
    - Dashboard/PhishingAnalysis.jsx, SimilarityAnalysis.jsx, FinalVerdict.jsx
  - App.jsx refactored to act as landing + live demo page that calls backend endpoints.

- Backend: existing Flask app already exposes /predict and /similarity endpoints. A /similarity-upload endpoint and static image routes exist.

How to run (local development)
1) Backend
   - Ensure Python 3.10+ is installed.
   - (Optional but required for full functionality) Install system deps: Tesseract OCR, Chrome + chromedriver (for Selenium screenshots), and Ollama if using the LLM integration.
   - From project root (where backend/app.py lives):
     - Create and activate a virtualenv (recommended).
     - pip install -r backend/requirements.txt
     - python backend/app.py
   - The backend runs on http://0.0.0.0:5000 by default.

2) Frontend
   - Node 18+ and npm installed.
   - From project root:
     - cd frontend
     - npm install
     - npm run start
   - Frontend dev server runs on http://localhost:3000 by default and calls the backend at http://localhost:5000.

Notes & Caveats
- The LLM integration (ollama) requires a running Ollama server and the model name used in app2.py.
- Selenium screenshotting requires Chrome and a compatible chromedriver in PATH; running headless on some CI/containers may need additional flags.
- Tesseract must be installed and available on PATH for OCR to work (used in app1.py).
- The similarity checks rely on reference images in Brands/ and will save screenshots to User/.
- MUI (Material UI) is used for a polished UI. You can replace components with Tailwind + shadcn/ui if preferred.

Next steps / suggestions
- Add E2E tests for both endpoints and frontend flows.
- Add authentication, rate-limiting, and API key support for SaaS deployment.
- Improve visuals with Framer Motion animations, and swap to Tailwind/shadcn if desired.

If you want, I can:
- Update frontend package.json to include extra dependencies (Recharts, Framer Motion, Tailwind) and wire them into components.
- Replace MUI with Tailwind + shadcn/ui.
- Run the dev servers here to validate build and fix any runtime errors.


