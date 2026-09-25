const fs = require('fs');
let lines = fs.readFileSync('script.js', 'utf8').split('\n');

// Find function openProductModal
const openIdx = lines.findIndex(l => l.includes('window.openProductModal = function(prodId) {'));
if(openIdx !== -1) {
    // We insert the history push state right after "if (!p) return;"
    const returnIdx = lines.findIndex((l, i) => i > openIdx && l.includes('if (!p) return;'));
    if(returnIdx !== -1) {
        lines.splice(returnIdx + 1, 0, '            if (new URLSearchParams(window.location.search).get("p") !== prodId) history.pushState({ modalOpen: true }, "", "?p=" + encodeURIComponent(prodId));');
    }
}

// Find closeM
const closeIdx = lines.findIndex(l => l.includes('function closeM() { document.getElementById'));
if(closeIdx !== -1) {
    lines[closeIdx] = lines[closeIdx].replace(
        document.body.style.overflow = ''; },
        document.body.style.overflow = ''; if(window.location.search.includes('?p=')) history.pushState(null, '', window.location.pathname); }
    );
}

fs.writeFileSync('script.js', lines.join('\n'));
console.log("Done");
const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');
let fix = '\n/* FIX CLICKS ON MOBILE */\n.bg-glow, .card-glow, .card-spotlight, .cursor-aura, .carousel-particle, .hero-deco, .hero-visual { pointer-events: none !important; }\n.hero-btn { position: relative; z-index: 50 !important; }\n.carousel-btn { z-index: 50 !important; pointer-events: auto !important; }\n@media(max-width: 480px) {\n  .product-card::after, .carousel-card-info::after {\n    content: \'Ver detalles ?\';\n    display: block;\n    text-align: center;\n    font-size: 0.8rem;\n    color: #00f0ff;\n    margin-top: 0.5rem;\n    opacity: 0.9;\n    font-weight: 600;\n  }\n}\n';
if (!css.includes('Ver detalles')) { fs.writeFileSync('styles.css', css + fix); }
