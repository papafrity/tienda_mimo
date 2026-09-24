const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const baseSearch = /\.cart-sidebar\s*\{[\s\S]*?box-shadow: -10px 0 30px rgba\(0, 0, 0, 0\.5\);\s*\}/;
const baseReplace = ".cart-sidebar {\n" +
"    position: fixed;\n" +
"    top: 1rem; right: 1rem; bottom: 1rem;\n" +
"    height: calc(100vh - 2rem);\n" +
"    width: 100%;\n" +
"    max-width: 420px;\n" +
"    background: rgba(10, 12, 18, 0.65);\n" +
"    backdrop-filter: blur(40px);\n" +
"    -webkit-backdrop-filter: blur(40px);\n" +
"    border: 1px solid rgba(255,255,255,0.08);\n" +
"    border-radius: 24px;\n" +
"    z-index: 1001;\n" +
"    display: flex;\n" +
"    flex-direction: column;\n" +
"    transform: translateX(120%);\n" +
"    transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1), box-shadow 0.6s ease;\n" +
"    box-shadow: -10px 10px 40px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255,255,255,0.05);\n" +
"}";
css = css.replace(baseSearch, baseReplace);

css = css.replace('.cart-sidebar.active { transform: translateX(0); }', '.cart-sidebar.active { transform: translateX(0); box-shadow: -20px 20px 60px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(255,255,255,0.05); }');

const itemSearch = /\.cart-item\s*\{[\s\S]*?position: relative;\s*\}/;
const itemReplace = ".cart-item {\n" +
"    display: flex;\n" +
"    gap: 1rem;\n" +
"    background: rgba(255, 255, 255, 0.02);\n" +
"    border: 1px solid rgba(255, 255, 255, 0.04);\n" +
"    border-radius: 16px;\n" +
"    padding: 0.8rem;\n" +
"    align-items: center;\n" +
"    position: relative;\n" +
"    transition: background 0.3s, transform 0.3s;\n" +
"}\n" +
".cart-item:hover {\n" +
"    background: rgba(255, 255, 255, 0.05);\n" +
"    transform: translateY(-2px);\n" +
"}";
css = css.replace(itemSearch, itemReplace);

const imgSearch = /\.cart-item img\s*\{[\s\S]*?background: var\(--bg\);\s*\}/;
const imgReplace = ".cart-item img {\n" +
"    width: 75px;\n" +
"    height: 75px;\n" +
"    object-fit: contain;\n" +
"    border-radius: 12px;\n" +
"    background: rgba(255,255,255,0.03);\n" +
"    padding: 5px;\n" +
"}";
css = css.replace(imgSearch, imgReplace);

const mqMobile = "\n@media(max-width:480px){\n    .cart-sidebar {\n        top: 0; right: 0; bottom: 0;\n        height: 100vh;\n        max-width: 100%;\n        border-radius: 0;\n        border: none;\n    }\n}\n";
css += mqMobile;

fs.writeFileSync('styles.css', css);
console.log('Cart redesign applied');
