const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const cssTarget = '.cursor-dot{width:6px;height:6px;background:var(--accent-color);border-radius:50%;position:fixed;top:0;left:0;pointer-events:none;z-index:9999;transition:width .2s,height .2s,background .2s;mix-blend-mode:difference}';
const cssReplace = '.cursor-dot{width:20px;height:20px;background:rgba(0,240,255,0.4);border-radius:50%;position:fixed;top:0;left:0;pointer-events:none;z-index:9999;backdrop-filter:blur(2px);box-sizing:border-box}';

css = css.replace(cssTarget, cssReplace);
fs.writeFileSync('styles.css', css);

let js = fs.readFileSync('script.js', 'utf8');

const sIdx = js.indexOf('// "?"?"? CUSTOM CURSOR');
const eIdx = js.indexOf('// "?"?"? SPLIT TITLE ANIMATION');

if (sIdx !== -1 && eIdx !== -1) {
    const replaceJs = "// CUSTOM CURSOR (Option 3: Magnetic Solid)\n" +
"    const dot = document.getElementById('cursorDot');\n" +
"    const ring = document.getElementById('cursorRing');\n" +
"    if (ring) ring.style.display = 'none';\n" +
"\n" +
"    if (dot) {\n" +
"        gsap.set(dot, { xPercent: -50, yPercent: -50 });\n" +
"\n" +
"        let targetEl = null;\n" +
"\n" +
"        document.addEventListener('mousemove', e => {\n" +
"            if (!targetEl) {\n" +
"                gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' });\n" +
"            }\n" +
"        });\n" +
"\n" +
"        const interactables = document.querySelectorAll('a, button, .product-card, .carousel-card, .filter-tab, .cart-btn, .search-toggle');\n" +
"        interactables.forEach(el => {\n" +
"            el.addEventListener('mouseenter', () => {\n" +
"                targetEl = el;\n" +
"                const r = el.getBoundingClientRect();\n" +
"                gsap.to(dot, { \n" +
"                    x: r.left + r.width / 2, \n" +
"                    y: r.top + r.height / 2, \n" +
"                    width: r.width + 16, \n" +
"                    height: r.height + 16, \n" +
"                    borderRadius: '12px',\n" +
"                    backgroundColor: 'rgba(0, 240, 255, 0.08)',\n" +
"                    border: '1px solid rgba(0, 240, 255, 0.4)',\n" +
"                    duration: 0.3, \n" +
"                    ease: 'back.out(1.5)' \n" +
"                });\n" +
"            });\n" +
"            el.addEventListener('mouseleave', (e) => {\n" +
"                targetEl = null;\n" +
"                gsap.to(dot, {\n" +
"                    width: 20, \n" +
"                    height: 20, \n" +
"                    borderRadius: '50%',\n" +
"                    backgroundColor: 'rgba(0, 240, 255, 0.4)',\n" +
"                    border: 'none',\n" +
"                    x: e.clientX,\n" +
"                    y: e.clientY,\n" +
"                    duration: 0.3, \n" +
"                    ease: 'power2.out'\n" +
"                });\n" +
"            });\n" +
"        });\n" +
"    }\n\n    ";
    
    js = js.substring(0, sIdx) + replaceJs + js.substring(eIdx);
    fs.writeFileSync('script.js', js);
    console.log('Cursor Option 3 applied');
} else {
    console.log('Could not find JS bounds for cursor', sIdx, eIdx);
}
