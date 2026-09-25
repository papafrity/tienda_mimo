import os

corruptions = {
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',  # This has a soft hyphen
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Ã ': 'à',
    'Ã¨': 'è',
    'Ã¬': 'ì',
    'Ã²': 'ò',
    'Ã¹': 'ù',
    'Ã¼': 'ü',
    'Ã\x81': 'Á',
    'Ã\x89': 'É',
    'Ã\x8d': 'Í',
    'Ã\x93': 'Ó',
    'Ã\x9a': 'Ú',
    'Ã\x91': 'Ñ',
    'Ã\x9c': 'Ü',
    'Â¿': '¿',
    'Â¡': '¡',
    'â€œ': '“',
    'â€ ': '”',
    'â€™': '’',
    'â€˜': '‘',
    'Â°': '°',
    'â€¢': '•',
    'â€¦': '…',
    'â€¡': '‡',
    'â€“': '–',
    'â€”': '—',
    'Â': '', # lingering Â from non-breaking spaces or similar
    'âš ï¸': '⚠️', # âš\x8fï¸\x8f
    'â†—': '↗',
    'ðŸ›¡ï¸': '🛡️',
    'ðŸ’¾': '💾',
    'ðŸ§ª': '🧪'
}

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    for bad, good in corruptions.items():
        content = content.replace(bad, good)
        
    # specific fix for í which often ends up as Ã followed by a non-printable char
    content = content.replace('Ã\xad', 'í')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('index.html')
fix_file('admin.html')
fix_file('admin.js')
fix_file('script.js')

print("Applied heuristic encoding fixes.")
