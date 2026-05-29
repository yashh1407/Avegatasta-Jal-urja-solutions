import json
from bs4 import BeautifulSoup
import re

with open("C:/Users/Yash.Mali/.gemini/antigravity/brain/ca586621-2e7f-4c8a-a8f0-c3fdd1070275/.system_generated/steps/1558/content.md", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")
# V-Guard features are usually in a ul/li list or divs with class 'feature'
features = []

for ul in soup.find_all("ul"):
    if "feature" in ul.get("class", []) or ul.find_parent(class_=re.compile("feature|spec", re.I)):
        for li in ul.find_all("li"):
            features.append(li.get_text(strip=True))
            
if not features:
    # Look for generic lists in the product description
    desc = soup.find(class_=re.compile("description", re.I))
    if desc:
        for li in desc.find_all("li"):
            features.append(li.get_text(strip=True))

print("EXTRACTED_FEATURES:", json.dumps(features[:10]))
