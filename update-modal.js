const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');

// Update openProductModal
js = js.replace('const mImg = document.getElementById('modalMainImg');', 
    'const mImg = document.getElementById('modalMainImg');\n            if (new URLSearchParams(window.location.search).get('p') !== prodId) history.pushState({ modalOpen: true }, '\', '?p=' + encodeURIComponent(prodId));');

// Update closeM
js = js.replace('function closeM() { document.getElementById('productModal').classList.remove('active'); document.body.style.overflow = '\'; }', 
    'function closeM() { document.getElementById('productModal').classList.remove('active'); document.body.style.overflow = '\'; if (window.location.search.includes('?p=')) history.pushState(null, '\', window.location.pathname); }');

fs.writeFileSync('script.js', js);
