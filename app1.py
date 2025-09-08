from PIL import Image
import imagehash, cv2, numpy as np, pytesseract, re, os, time, base64, matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from rapidfuzz import process
from urllib.parse import urlparse
import socket
import requests
import os


BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # current file location
BRANDS_FOLDER = os.path.join(BASE_DIR, "Brands")
USER_FOLDER   = os.path.join(BASE_DIR,"User")

os.makedirs(BRANDS_FOLDER, exist_ok=True)
os.makedirs(USER_FOLDER,   exist_ok=True)

# ---------- URL Utilities ----------
def normalize_url(url: str) -> str:
    """Ensure scheme; return normalized URL string."""
    if not re.match(r'^[a-zA-Z]+://', url or ''):
        url = "https://" + url.strip()
    return url

def is_file_input(url_or_path: str) -> bool:
    """True if input is a local image (path) or file:// URL."""
    if str(url_or_path).lower().startswith("file://"):
        return True
    # If it looks like a path and exists, treat as image
    return os.path.exists(url_or_path)


def extract_domain(url: str):
    """Robust domain extraction (ignores file://)"""
    if is_file_input(url):
        return None
    try:
        p = urlparse(url)
        host = p.hostname or ""
        if not host:
            return None

        host = host.lower()

        # Remove www prefix if present
        if host.startswith('www.'):
            host = host[4:]

        # Split into parts and get the main domain name
        parts = host.split('.')
        if len(parts) >= 2:
            # Take the first part (brand name) for most domains
            # e.g., "example" from "example.com" or "paypal" from "paypal.com"
            return parts[0] if parts[0] else None
        elif len(parts) == 1:
            # Single part domain (edge case)
            return parts[0] if parts[0] else None
        else:
            return None

    except Exception:
        return None

def check_dns(url: str, timeout=3) -> bool:
    try:
        host = urlparse(url).hostname
        if not host:
            return False
        socket.setdefaulttimeout(timeout)
        socket.gethostbyname(host)
        return True
    except Exception:
        return False

def check_http(url: str, timeout=6) -> bool:
    """Lightweight HTTP reachability check; ignores TLS errors."""
    try:
        r = requests.get(url, timeout=timeout, allow_redirects=True, verify=False)
        return 200 <= r.status_code < 400
    except Exception:
        return False

# ---------- Selenium Screenshot ----------
def capture_viewport_screenshot(url, save_path, width=1280, height=720, retries=1):
    """Viewport screenshot with timeouts + retries. Returns save_path or None."""
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--allow-insecure-localhost")
    options.add_argument(f"--window-size={width},{height}")
    driver = None

    for attempt in range(retries + 1):
        try:
            driver = webdriver.Chrome(options=options)
            driver.set_page_load_timeout(12)
            driver.get(url)
            # wait a bit for layout
            time.sleep(2.5)
            screenshot = driver.get_screenshot_as_base64()
            with open(save_path, "wb") as f:
                f.write(base64.b64decode(screenshot))
            return save_path
        except Exception as e:
            if attempt >= retries:
                print(f"❌ Error capturing screenshot (attempt {attempt+1}): {e}")
                return None
            time.sleep(1.5)  # brief backoff then retry
        finally:
            if driver:
                try:
                    driver.quit()
                except Exception:
                    pass
            driver = None

# ---------- Image Normalization ----------
def normalize_image(img_path, target_size=(1280, 720), bg_color=(255,255,255)):
    try:
        img = Image.open(img_path).convert("RGB")
    except Exception:
        # If PIL fails, return a blank canvas to avoid crashes
        return Image.new("RGB", target_size, bg_color)

    img.thumbnail(target_size, Image.Resampling.LANCZOS)
    background = Image.new("RGB", target_size, bg_color)
    offset = ((target_size[0] - img.width) // 2,
              (target_size[1] - img.height) // 2)
    background.paste(img, offset)
    return background

# ---------- OCR Preprocessing ----------
def preprocess_for_ocr(img_path):
    try:
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return None
        # gentle denoise and binarization
        img = cv2.medianBlur(img, 3)
        img = cv2.threshold(img, 0, 255, cv2.THRESH_OTSU | cv2.THRESH_BINARY)[1]
        return img
    except Exception:
        return None

def clean_text(text):
    return re.sub(r'[^a-zA-Z0-9 ]', ' ', text).lower().strip()

# ---------- Similarity Functions ----------
def image_similarity(img1_path, img2_path):
    img1 = normalize_image(img1_path)
    img2 = normalize_image(img2_path)
    try:
        ph = imagehash.phash(img1)
        dh = imagehash.dhash(img1)
        ph2 = imagehash.phash(img2)
        dh2 = imagehash.dhash(img2)
        phash_sim = 1 - (ph - ph2) / (len(ph.hash) ** 2)
        dhash_sim = 1 - (dh - dh2) / (len(dh.hash) ** 2)
        return (phash_sim + dhash_sim) / 2
    except Exception:
        return 0.0

def color_similarity(img1_path, img2_path, bins=32):
    try:
        img1 = np.array(normalize_image(img1_path))
        img2 = np.array(normalize_image(img2_path))
        hist1 = cv2.calcHist([img1],[0,1,2],None,[bins,bins,bins],[0,256,0,256,0,256])
        hist2 = cv2.calcHist([img2],[0,1,2],None,[bins,bins,bins],[0,256,0,256,0,256])
        hist1 = cv2.normalize(hist1, hist1).flatten()
        hist2 = cv2.normalize(hist2, hist2).flatten()
        return float(cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL))
    except Exception:
        return 0.0

def text_similarity(img1_path, img2_path):
    img1 = preprocess_for_ocr(img1_path)
    img2 = preprocess_for_ocr(img2_path)
    if img1 is None or img2 is None:
        return 0.0

    try:
        text1 = clean_text(pytesseract.image_to_string(img1))
        text2 = clean_text(pytesseract.image_to_string(img2))
        if not text1 or not text2:
            return 0.0

        # TF-IDF cosine similarity
        vectorizer = TfidfVectorizer().fit([text1, text2])
        vectors = vectorizer.transform([text1, text2])
        tfidf_sim = float(cosine_similarity(vectors[0], vectors[1])[0][0])

        # Jaccard similarity
        set1, set2 = set(text1.split()), set(text2.split())
        jaccard_sim = (len(set1 & set2) / len(set1 | set2)) if set1 and set2 else 0.0

        return (tfidf_sim + jaccard_sim) / 2
    except Exception:
        return 0.0

def website_similarity(ref_img, target_img, weights=(0.5, 0.4, 0.1)):
    try:
        img_sim = image_similarity(ref_img, target_img)
        col_sim = color_similarity(ref_img, target_img)
        txt_sim = text_similarity(ref_img, target_img)
        final_score = weights[0]*img_sim + weights[1]*col_sim + weights[2]*txt_sim
        return final_score, {"image": img_sim, "color": col_sim, "text": txt_sim}, weights
    except Exception as e:
        print(f"[ERROR] Website similarity failed: {e}")
        return None, None, None


# ---------- Fuzzy Brand Detection ----------
def fuzzy_match_brand(domain):
    brands = [os.path.splitext(f)[0].replace("_ref","") for f in os.listdir(BRANDS_FOLDER) if f.lower().endswith(".png")]
    if not brands:
        print("❌ No brand reference images found in dataset.")
        return None
    best = process.extractOne(domain, brands)
    if not best:
        print(f"[DEBUG] No fuzzy match found for domain '{domain}' in brands {brands}")
        return None
    best_match, score, _ = best
    print(f"[DEBUG] Fuzzy match for domain '{domain}': '{best_match}' (score={score})")
    if score >= 60:  # Lowered threshold for more flexible matching
        print(f"🔍 Fuzzy matched '{domain}' → '{best_match}' (score={round(score,1)})")
        return best_match
    print(f"[DEBUG] Fuzzy match score {score} below threshold for '{domain}'")
    return None

# ---------- Explainability ----------
def explain_score(details, weights, final_score, use_streamlit=False):
    keys = ["image", "color", "text"]
    contributions = {k: details[k] * weights[i] for i, k in enumerate(keys)}

    explanation = "\n--- Explainability ---\n"
    for i, k in enumerate(keys):
        explanation += f"{k.capitalize()} contribution: {contributions[k]:.3f} (raw={details[k]:.3f}, weight={weights[i]})\n"
    explanation += f"Total Score: {final_score:.3f}\n"

    # Show in Streamlit or console
    if use_streamlit:
        st.markdown(explanation)
    else:
        print(explanation)

    return explanation


import os, re
import streamlit as st

def check_website(user_input, lgbm_score=None, llm_score=None, ui_weight=0.4, lgbm_weight=0.3, llm_weight=0.3):
    """
    user_input: URL or local image
    lgbm_score, llm_score: optional external scores from your ML/LLM modules
    """
    ui_score, ui_details, ui_weights = None, None, None
    brand_name, ref_img, user_img = None, None, None

    # --------- Case 1: Local image input ---------
    if is_file_input(user_input):
        fname = os.path.basename(user_input)
        guess = re.split(r'[^a-z0-9]+', os.path.splitext(fname.lower())[0])
        guess = next((g for g in guess if g), None)
        brand_name = guess if guess else None
        if not brand_name:
            st.error("❌ Local image provided but cannot guess brand name from filename. Rename like 'paypal_user.png'.")
            return None

        matched = fuzzy_match_brand(brand_name) or brand_name
        ref_img = os.path.join(BRANDS_FOLDER, f"{matched}_ref.png")
        if os.path.exists(ref_img):
            user_img = user_input.replace("file://", "") if user_input.lower().startswith("file://") else user_input
            ui_score, ui_details, ui_weights = website_similarity(ref_img, user_img)
        else:
            st.warning(f"⚠️ No reference found for '{matched}' in dataset.")

    # --------- Case 2: URL input ---------
    else:
        url = normalize_url(user_input)
        domain = extract_domain(url)
        print(f"[DEBUG] Extracted domain: {domain}")
        if not domain:
            print("[DEBUG] Invalid URL (cannot extract domain). Returning fallback result.")
            return {
                "brand": None,
                "reference_image": None,
                "user_screenshot": None,
                "score": None,
                "details": {"message": "Invalid URL (cannot extract domain)."},
                "weights": None
            }

        if not check_dns(url):
            print(f"[DEBUG] DNS resolution failed for '{url}'. Returning fallback result.")
            return {
                "brand": domain,
                "reference_image": None,
                "user_screenshot": None,
                "score": None,
                "details": {"message": f"DNS resolution failed for '{url}'."},
                "weights": None
            }
        if not check_http(url):
            print(f"[DEBUG] '{url}' not reachable (HTTP check failed). Returning fallback result.")
            return {
                "brand": domain,
                "reference_image": None,
                "user_screenshot": None,
                "score": None,
                "details": {"message": f"'{url}' not reachable (HTTP check failed)."},
                "weights": None
            }

        brand_name = domain
        ref_img = os.path.join(BRANDS_FOLDER, f"{brand_name}_ref.png")
        if not os.path.exists(ref_img):
            print(f"[DEBUG] No exact reference image for '{brand_name}'. Trying fuzzy match...")
            fuzzy = fuzzy_match_brand(domain)
            print(f"[DEBUG] Fuzzy match result: {fuzzy}")
            if fuzzy:
                brand_name = fuzzy
                ref_img = os.path.join(BRANDS_FOLDER, f"{brand_name}_ref.png")
                print(f"[DEBUG] Using fuzzy matched reference image: {ref_img}")
            else:
                print(f"[DEBUG] No fuzzy match found for '{domain}'. Proceeding without reference image.")

        if os.path.exists(ref_img):
            user_img = os.path.join(USER_FOLDER, f"{domain}_user.png")
            print(f"[DEBUG] Taking screenshot for user_img: {user_img}")
            # If a screenshot already exists from previous runs, reuse it first
            if os.path.exists(user_img):
                print(f"[DEBUG] Found existing user screenshot at {user_img}, reusing it.")
                saved = user_img
            else:
                saved = capture_viewport_screenshot(url, user_img, retries=1)
            if saved:
                print(f"[DEBUG] Screenshot saved. Running similarity...")
                ui_score, ui_details, ui_weights = website_similarity(ref_img, user_img)
                if ui_score is not None:
                    print(f"[DEBUG] Similarity score: {ui_score}")
                    return {
                        "brand": brand_name,
                        "reference_image": ref_img,
                        "user_screenshot": user_img,
                        "score": ui_score,
                        "details": ui_details,
                        "weights": ui_weights
                    }
                else:
                    print(f"[DEBUG] Similarity analysis failed for '{brand_name}'. Returning structured result.")
                    return {
                        "brand": brand_name,
                        "reference_image": ref_img,
                        "user_screenshot": user_img,
                        "score": None,
                        "details": {"message": "Similarity analysis failed for this brand."},
                        "weights": None
                    }
            else:
                # If capture failed but a previously saved user image exists under a different name, try to find it
                fallback_files = [f for f in os.listdir(USER_FOLDER) if f.lower().startswith(domain.lower())]
                if fallback_files:
                    fallback_path = os.path.join(USER_FOLDER, fallback_files[0])
                    print(f"[DEBUG] Using fallback existing user image: {fallback_path}")
                    ui_score, ui_details, ui_weights = website_similarity(ref_img, fallback_path)
                    if ui_score is not None:
                        return {
                            "brand": brand_name,
                            "reference_image": ref_img,
                            "user_screenshot": fallback_path,
                            "score": ui_score,
                            "details": ui_details,
                            "weights": ui_weights
                        }
                print(f"[DEBUG] Screenshot failed for '{url}'. Returning structured result.")
                return {
                    "brand": brand_name,
                    "reference_image": ref_img,
                    "user_screenshot": None,
                    "score": None,
                    "details": {"message": "Screenshot failed. Similarity analysis not available."},
                    "weights": None
                }
        else:
            # No reference image found, but still take a screenshot and return a result
            user_img = os.path.join(USER_FOLDER, f"{domain}_user.png")
            print(f"[DEBUG] No reference image found. Taking screenshot for user_img: {user_img}")
            # reuse existing screenshot if present
            if os.path.exists(user_img):
                print(f"[DEBUG] Found existing user screenshot at {user_img}, reusing it.")
                saved = user_img
            else:
                saved = capture_viewport_screenshot(url, user_img, retries=1)
            if saved:
                print(f"[DEBUG] Screenshot saved. Returning fallback result.")
                return {
                    "brand": domain,
                    "reference_image": None,
                    "user_screenshot": user_img,
                    "score": None,
                    "details": {"message": f"No reference image found for '{domain}'. Similarity analysis not available."},
                    "weights": None
                }
            else:
                # try to find any existing user image
                fallback_files = [f for f in os.listdir(USER_FOLDER) if f.lower().startswith(domain.lower())]
                if fallback_files:
                    fallback_path = os.path.join(USER_FOLDER, fallback_files[0])
                    print(f"[DEBUG] Using fallback existing user image (no ref image): {fallback_path}")
                    return {
                        "brand": domain,
                        "reference_image": None,
                        "user_screenshot": fallback_path,
                        "score": None,
                        "details": {"message": f"No reference image found for '{domain}'. Similarity analysis not available."},
                        "weights": None
                    }
                print(f"[DEBUG] Screenshot failed for '{url}'. Returning fallback result.")
                return {
                    "brand": domain,
                    "reference_image": None,
                    "user_screenshot": None,
                    "score": None,
                    "details": {"message": "Screenshot failed. Similarity analysis not available."},
                    "weights": None
                }

    # --------- Return structured result ---------
    return {
        "brand": brand_name,
        "reference_image": ref_img if os.path.exists(ref_img) else None,
        "user_screenshot": user_img if 'user_img' in locals() else None,
        "score": ui_score,
        "details": ui_details,
        "weights": ui_weights
    }
