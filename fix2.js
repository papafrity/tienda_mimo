const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');
let fix = '\n/* FIX CLICKS ON MOBILE */\n.bg-glow, .card-glow, .card-spotlight, .cursor-aura, .carousel-particle, .hero-deco, .hero-visual { pointer-events: none !important; }\n.hero-btn { position: relative; z-index: 50 !important; }\n.carousel-btn { z-index: 50 !important; pointer-events: auto !important; }\n@media(max-width: 480px) {\n  .product-card::after, .carousel-card-info::after {\n    content: \'Ver detalles ?\';\n    display: block;\n    text-align: center;\n    font-size: 0.8rem;\n    color: #00f0ff;\n    margin-top: 0.5rem;\n    opacity: 0.9;\n    font-weight: 600;\n  }\n}\n';
if (!css.includes('Ver detalles')) { fs.writeFileSync('styles.css', css + fix); console.log('CSS fixed'); }
