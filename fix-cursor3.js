const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');

const sIdx = js.indexOf("const dot = document.getElementById('cursorDot');");
const eIdx = js.indexOf("const title = document.getElementById('heroTitle');");

if (sIdx !== -1 && eIdx !== -1) {
    // Backtrack to the start of the comment or just replace from sIdx
    const replaceJs = "const dot = document.getElementById('cursorDot');\n" +
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
"    }\n\n    // SPLIT TITLE\n    ";
    
    // We backtrack a bit for the end index to keep comments intact, but it's okay to overwrite up to const title
    // Actually wait, I need to make sure I don't delete // SPLIT TITLE comment if I replace up to const title.
    // Let's just find // "?"?"? SPLIT TITLE ANIMATION
    let blockStart = js.lastIndexOf('//', eIdx);
    
    js = js.substring(0, sIdx) + replaceJs + js.substring(eIdx);
    fs.writeFileSync('script.js', js);
    console.log('Cursor Option 3 applied');
} else {
    console.log('Could not find JS bounds for cursor', sIdx, eIdx);
}
