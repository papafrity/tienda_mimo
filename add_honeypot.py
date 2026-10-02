import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
honeypot_html = '<input type="text" name="website_url" id="website_url" style="display:none !important;" tabindex="-1" autocomplete="off">'
html = html.replace('<form id="publicReviewForm">', '<form id="publicReviewForm">\n' + honeypot_html)
html = html.replace('<form id="checkoutForm">', '<form id="checkoutForm">\n' + honeypot_html)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Honeypot HTML added')
