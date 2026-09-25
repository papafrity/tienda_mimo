import os

def fix_file(filename):
    with open(filename, 'rb') as f:
        raw = f.read()
    
    # Strip UTF-8 BOM if present
    if raw.startswith(b'\xef\xbb\xbf'):
        raw = raw[3:]
        
    text = raw.decode('utf-8')
    try:
        # Revert the double encoding
        original_bytes = text.encode('cp1252')
        original_text = original_bytes.decode('utf-8')
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(original_text)
        print(f"Fixed {filename} successfully!")
    except Exception as e:
        print(f"Failed to fix {filename}: {e}")

fix_file('admin.html')
fix_file('admin.js')
