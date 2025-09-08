import requests
import ollama
from bs4 import BeautifulSoup
import json
import re
import pickle
import pandas as pd
import shap
import os

# ---------- Load LGBM Model Package ----------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "phishing_lgbm.pkl")
with open(MODEL_PATH, "rb") as f:
    package = pickle.load(f)

ml_model = package["model"]
scaler = package["scaler"]
features_list = package["features"]
lgbm_model = ml_model.named_estimators_["lgbm"]

# ---------- Feature Extractor ----------
def extract_features(url):
    feats = {}
    feats['length_url'] = len(url)
    feats['length_hostname'] = len(re.findall(r'://([^/]+)/?', url)[0]) if "://" in url else len(url)
    feats['ip'] = 1 if re.match(r'^\d+\.\d+\.\d+\.\d+$', url) else 0
    feats['nb_dots'] = url.count('.')
    feats['nb_hyphens'] = url.count('-')
    feats['nb_at'] = url.count('@')
    feats['nb_qm'] = url.count('?')
    feats['nb_and'] = url.count('&')
    feats['nb_or'] = url.count('|')
    feats['nb_eq'] = url.count('=')
    feats['nb_underscore'] = url.count('_')
    feats['nb_tilde'] = url.count('~')
    feats['nb_percent'] = url.count('%')
    feats['nb_slash'] = url.count('/')
    feats['nb_star'] = url.count('*')
    feats['nb_colon'] = url.count(':')
    feats['nb_comma'] = url.count(',')
    feats['nb_semicolumn'] = url.count(';')
    feats['nb_dollar'] = url.count('$')
    feats['nb_space'] = url.count(' ')
    feats['nb_www'] = url.count('www')
    feats['nb_com'] = url.count('.com')
    feats['nb_dslash'] = url.count('//')
    feats['http_in_path'] = 1 if "http" in url[url.find("://")+3:] else 0
    feats['https_token'] = 1 if "https" in url else 0
    feats['ratio_digits_url'] = sum(c.isdigit() for c in url) / len(url)
    feats['ratio_digits_host'] = 0.0
    feats['punycode'] = 1 if "xn--" in url else 0
    feats['shortening_service'] = 1 if re.search(r'bit\.ly|goo\.gl|tinyurl|ow\.ly', url) else 0
    feats['path_extension'] = 1 if re.search(r'\.[a-zA-Z0-9]{2,4}(/|$)', url) else 0
    feats['phish_hints'] = 1 if re.search(r'login|verify|bank|account|update|secure', url.lower()) else 0
    feats['domain_in_brand'] = 0
    feats['brand_in_subdomain'] = 0
    feats['brand_in_path'] = 0
    feats['suspecious_tld'] = 1 if re.search(r'\.(zip|review|country|kim|cricket|science|work|party|info)$', url) else 0
    return feats

# ---------- SHAP Explainability Formatter ----------
def format_shap_explanations(features_list, shap_array, prediction_type):
    explanations = []
    for feat, val in zip(features_list, shap_array[0]):
        if abs(val) < 0.2:  # ignore weak contributions
            continue
        direction = "phishing" if val > 0 else "legitimate"
        if prediction_type == "legitimate" and val < 0:
            text = f"{feat.replace('_',' ')} pushes towards legitimate."
            explanations.append(text)
        elif prediction_type == "phishing" and val > 0:
            text = f"{feat.replace('_',' ')} pushes towards phishing."
            explanations.append(text)
    return explanations

# ---------- Extract Main Content ----------
def extract_main_content(html):
    soup = BeautifulSoup(html, 'html.parser')
    for element in soup(["script", "style", "meta", "link", "header", "footer", "nav", "aside", "noscript"]):
        element.decompose()
    text = soup.get_text(" ", strip=True)
    return text

# ---------- LLM Analysis (Ollama Mistral) ----------
def analyze_with_ollama(content, model_name="mistral"):
    system_prompt = """You are an expert cybersecurity analyst. 
Your task is to analyze the content of a website and determine if it is a scam, phishing attempt, or otherwise malicious.
Respond STRICTLY in this JSON format:

{
  "verdict": "phishing" or "legitimate",
  "risk_level": "suspicious" or "safe",
  "reasons": ["list of brief reasons"],
  "evidence_snippets": ["list of concrete snippets found in the text"]
}
"""
    try:
        user_message = f"Analyze this website content:\n\n{content}"
        response = ollama.chat(
            model=model_name,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_message}
            ],
            options={'temperature': 0.1}
        )
        response_text = response['message']['content'].strip()
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            return None
    except Exception as e:
        print(f"❌ Error with Ollama: {e}")
        return None

# ---------- Hybrid Classification ----------
def classify_content(url):
    # Step 1: Fetch page
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        print(f"[DEBUG] classify_content: fetching URL: {url}")
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        html_content = response.text
        print(f"[DEBUG] fetch OK — {len(html_content)} chars")
    except Exception as e:
        print(f"[ERROR] Failed to fetch URL: {e}")
        return {"error": f"Failed to fetch URL: {e}"}

    # Step 2: Extract content
    main_text = extract_main_content(html_content)
    max_chars = 4000
    text_for_llm = (url + " " + main_text)[:max_chars]

    print(f"📡 Feeding {len(text_for_llm)} characters to LLM (max={max_chars})\n")

    # Step 3: ML prediction
    feats = extract_features(url)
    X_input = pd.DataFrame([feats]).reindex(columns=features_list, fill_value=0)
    X_scaled = scaler.transform(X_input)

    # Raw probability from model = phishing probability
    try:
        probs = ml_model.predict_proba(X_scaled)[0]
        # Determine which column corresponds to a phishing label.
        phishing_index = None
        classes = getattr(ml_model, 'classes_', None)
        if classes is not None:
            # look for common label encodings
            for candidate in ('phishing', '1', 1, True):
                try:
                    phishing_index = list(classes).index(candidate)
                    break
                except ValueError:
                    continue
        # fallback to index 1 if available
        if phishing_index is None:
            phishing_index = 1 if len(probs) > 1 else 0
        phishing_prob = float(probs[phishing_index])
    except Exception as e:
        print(f"[ERROR] ML model prediction failed: {e}")
        return {"error": f"ML model prediction failed: {e}"}

    # Convert to legitimacy confidence
    legitimacy_conf = 1 - phishing_prob

    ml_pred = "phishing" if phishing_prob > 0.5 else "legitimate"

    print(f"[DEBUG] ML phishing_prob={phishing_prob:.4f}, legitimacy_conf={legitimacy_conf:.4f}, ml_pred={ml_pred}")

    # SHAP explanations
    try:
        explainer = shap.TreeExplainer(lgbm_model)
        shap_values = explainer.shap_values(X_scaled)
        shap_array = shap_values[1] if isinstance(shap_values, list) else shap_values
        ml_explanations = format_shap_explanations(features_list, shap_array, ml_pred)
    except Exception as e:
        print(f"[WARN] SHAP explanation failed: {e}")
        ml_explanations = []

    # Step 4: LLM prediction (with fallback)
    llm_result = None
    try:
        llm_result = analyze_with_ollama(text_for_llm)
        print(f"[DEBUG] ollama result: {llm_result}")
    except Exception as e:
        print(f"[WARN] Ollama analysis failed or not available: {e}")
        llm_result = None

    # Fallback heuristic if LLM unavailable or returns None
    if not llm_result:
        heur = re.search(r'login|verify|account|password|bank|secure|update|confirm|sign in|credit card|ssn', main_text, re.IGNORECASE)
        if heur:
            llm_label = "phishing"
            llm_risk = "suspicious"
            llm_reasons = ["suspicious phishing keywords found in page text"]
            evidence_snippets = [heur.group(0)]
            print(f"[DEBUG] LLM fallback => phishing due to keyword: {heur.group(0)}")
        else:
            llm_label = "legitimate"
            llm_risk = "safe"
            llm_reasons = ["no obvious phishing language detected"]
            evidence_snippets = []
            print(f"[DEBUG] LLM fallback => legitimate (no phishing keywords)")
    else:
        llm_label = llm_result.get("verdict", "unknown")
        llm_risk = llm_result.get("risk_level", "suspicious")
        llm_reasons = llm_result.get("reasons", [])
        evidence_snippets = llm_result.get("evidence_snippets", [])

    # Step 5: Ensemble decision (optional — only used inside this function)
    # Ensure llm_label and ml_explanations exist and are consistent types
    if not isinstance(ml_explanations, list):
        ml_explanations = []
    if not isinstance(llm_label, str):
        llm_label = str(llm_label) if llm_label is not None else "unknown"
    if not isinstance(llm_risk, str):
        llm_risk = str(llm_risk) if llm_risk is not None else "suspicious"

    llm_score = 1.0 if llm_label == "phishing" else 0.0 if llm_label == "legitimate" else 0.5
    if llm_risk == "suspicious" and 0.15 < phishing_prob < 0.5:
        final = "phishing"
    elif phishing_prob >= 0.85:
        final = "phishing"
    elif phishing_prob <= 0.15:
        final = "legitimate"
    else:
        combined_score = (0.6 * phishing_prob) + (0.4 * llm_score)
        final = "phishing" if combined_score >= 0.5 else "legitimate"

    print(f"[DEBUG] Ensemble: final={final}, combined_score approx={(0.6*phishing_prob)+(0.4*llm_score):.4f}")

    # Return all keys with safe defaults for frontend
    return {
        "url": url,
        "final_verdict": final,
        "ml_confidence": float(round(max(0.0, min(1.0, legitimacy_conf)), 3)),
        "ml_prediction": ml_pred or "unknown",
        "ml_explanations": ml_explanations or [],
        "llm_prediction": llm_label or "unknown",
        "llm_risk_level": llm_risk or "suspicious",
        "llm_reasons": llm_reasons or [],
        "evidence_snippets": evidence_snippets or []
    }



# ---------- Main ----------
def main():
    print("🌐 Website Scam & Phishing Analyzer")
    print("----------------------------------------")
    website_url = input("Please enter the full URL to analyze: ").strip()
    result = classify_content(website_url)

    if "error" in result:
        print(f"❌ {result['error']}")
        return

    print("="*60)
    print(f"📋 URL: {result['url']}")

    # 🔹 Module 1: Just show raw predictions, no "final verdict"
    print("\n🔍 Module 1: Phishing Detection Analysis")
    print(f"✅ ML Prediction: {result['ml_prediction']} (phishing-prob={result['ml_confidence']})")
    print(f"🤖 LLM Prediction: {result['llm_prediction']} (risk={result['llm_risk_level']})")

    print("\n🤖 AI's Contextual Analysis:")

    if result['ml_prediction'] == "phishing":
        print("\nPhishing Indicators (from ML):")
        for explanation in result['ml_explanations']:
            print(f" • {explanation}")
    else:
        print("\nLegitimate Indicators (from ML):")
        for explanation in result['ml_explanations']:
            print(f" • {explanation}")

    if result['llm_prediction'] == "phishing":
        print("\nLLM Evidence Snippets:")
        for snippet in result['evidence_snippets']:
            print(f" • {snippet}")
    else:
        print("\nLLM Reasons for Legitimacy:")
        for reason in result['llm_reasons']:
            print(f" • {reason}")

    print("="*60)
    print("ℹ️ Final Combined Verdict will be shown in the last section.")
