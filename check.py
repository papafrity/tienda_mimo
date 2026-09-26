
with open("admin.js", "r", encoding="utf-8") as f:
    text = f.read()
if "shippingCost" in text:
    print("Found shippingCost!")
else:
    print("Not found")

