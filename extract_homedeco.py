import pypdf
import os
import re
import json

pdf_path = r'C:\Users\papaf\Downloads\catalogo pm\CATALOGO HOMEDECO OFICIAL (15).pdf'
all_products = []

try:
    reader = pypdf.PdfReader(pdf_path)
    current_name = []
    
    for page in reader.pages:
        text = page.extract_text()
        if not text: continue
        
        # Normalize spaces and U S D
        text = text.replace('U S D', 'USD').replace(' , ', '.')
        
        for line in text.split('\n'):
            line = line.strip()
            if not line: continue
            
            # Look for pricing like '1 X 9.5 USD'
            # sometimes written as '10 X 8 USD'
            if 'X' in line and 'USD' in line:
                # Find all occurrences in the line
                matches = re.findall(r'(\d+)\s*X\s*(\d+(?:\.\d+)?)\s*USD', line, re.IGNORECASE)
                if matches:
                    name = ' '.join(current_name).strip()
                    # Clean name
                    name = re.sub(r'^(IMPORTADOS|REINGRESO|PRECIO POR UNIDAD|BODY SPLASH VS)+', '', name).strip()
                    
                    tiers = []
                    base_price = 0
                    
                    for m in matches:
                        qty = int(m[0])
                        price = float(m[1])
                        if qty == 1:
                            base_price = price
                        else:
                            tiers.append({'minQty': qty, 'price': price})
                    
                    if name and (base_price > 0 or tiers):
                        all_products.append({'name': name, 'price': base_price, 'tiers': tiers, 'category': 'Homedeco', 'isActive': False})
                        current_name = []
                    elif all_products and (base_price > 0 or tiers):
                        # Append to previous product if no name
                        if base_price > 0 and all_products[-1]['price'] == 0:
                            all_products[-1]['price'] = base_price
                        all_products[-1]['tiers'].extend(tiers)
                else:
                    current_name.append(line)
            else:
                if line not in ['IMPORTADOS', 'REINGRESO', 'PRECIO POR UNIDAD']: 
                    current_name.append(line)
                    
except Exception as e:
    print(f'Error: {e}')

with open('homedeco_products.json', 'w', encoding='utf-8') as f:
    json.dump(all_products, f, indent=2, ensure_ascii=False)

print(f'Extracted {len(all_products)} products from Homedeco.')
