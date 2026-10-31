import re
import urllib.request
import os

filepath = os.path.join(os.path.dirname(__file__), '..', 'new_style', 'src', 'data', 'places.js')
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

urls = re.findall(r'image:\s*[\'\"](https?://[^\'\"]+)[\'\"]', text)
print(f"Total place images to verify: {len(urls)}")

failed = []
for i, u in enumerate(urls):
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=5)
        if res.status != 200:
            failed.append((i, u, res.status))
        else:
            print(f"  [{i+1}/{len(urls)}] 200 OK: {u[:60]}")
    except Exception as e:
        failed.append((i, u, str(e)))
        print(f"  [{i+1}/{len(urls)}] FAILED: {u} => {e}")

print(f"\n=============================")
print(f"FAILED IMAGES AUDIT: {len(failed)} of {len(urls)}")
for idx, u, err in failed:
    print(f"Item #{idx}: {u} -> {err}")

