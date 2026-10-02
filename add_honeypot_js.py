import re
with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()
honeypot_check = '''    // Honeypot spam check\n    const honeypot = e.target.querySelector('#website_url');\n    if (honeypot && honeypot.value !== '') {\n        console.warn('Spam bot detected');\n        return;\n    }\n'''
js = js.replace('publicReviewForm.addEventListener(\'submit\', async (e) => {\\n        e.preventDefault();', 'publicReviewForm.addEventListener(\'submit\', async (e) => {\\n        e.preventDefault();\\n' + honeypot_check)
js = js.replace('checkoutForm.addEventListener(\'submit\', async (e) => {\\n        e.preventDefault();', 'checkoutForm.addEventListener(\'submit\', async (e) => {\\n        e.preventDefault();\\n' + honeypot_check)
with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Honeypot JS added')
