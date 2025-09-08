import json
import traceback
from app2 import classify_content

url = 'https://www.paypal.com'
print(f"Testing classify_content for: {url}\n")
try:
    res = classify_content(url)
    print(json.dumps(res, indent=2))
except Exception as e:
    print("Exception while running classify_content:")
    print(str(e))
    print(traceback.format_exc())
