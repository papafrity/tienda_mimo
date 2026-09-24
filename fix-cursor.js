const fs = require('fs');

// --- 1. UPDATE CSS ---
let css = fs.readFileSync('styles.css', 'utf8');

const cssTarget = '.cursor-dot{width:6px;height:6px;background:var(--accent-color);border-radius:50%;position:fixed;top:0;left:0;pointer-events:none;z-index:9999;transition:width .2s,height .2s,background .2s;mix-blend-mode:difference}';
const cssReplace = '.cursor-dot{width:20px;height:20px;background:rgba(0,240,255,0.4);border-radius:50%;position:fixed;top:0;left:0;pointer-events:none;z-index:9999;backdrop-filter:blur(2px);box-sizing:border-box}';

css = css.replace(cssTarget, cssReplace);
fs.writeFileSync('styles.css', css);

// --- 2. UPDATE JS ---
let js = fs.readFileSync('script.js', 'utf8');

const jsTargetStart = '// "?"?"? CUSTOM CURSOR';
const jsTargetEnd = '// "?"?"? SPLIT TITLE ANIMATION';

const sIdx = js.indexOf(jsTargetStart);
const eIdx = js.indexOf(jsTargetEnd);

if (sIdx !== -1 && eIdx !== -1) {
    const replaceJs = \// "?"?"? CUSTOM CURSOR (Option 3: Magnetic Solid) "?"?"?
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (ring) ring.style.display = 'none'; // Hide ring for this option

    if (dot) {
        gsap.set(dot, { xPercent: -50, yPercent: -50 });

        let targetEl = null;

        document.addEventListener('mousemove', e => {
            if (!targetEl) {
                gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' });
            }
        });

        const interactables = document.querySelectorAll('a, button, .product-card, .carousel-card, .filter-tab, .cart-btn, .search-toggle');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                targetEl = el;
                const r = el.getBoundingClientRect();
                gsap.to(dot, { 
                    x: r.left + r.width / 2, 
                    y: r.top + r.height / 2, 
                    width: r.width + 16, 
                    height: r.height + 16, 
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0, 240, 255, 0.08)',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    duration: 0.3, 
                    ease: 'back.out(1.5)' 
                });
            });
            el.addEventListener('mouseleave', (e) => {
                targetEl = null;
                gsap.to(dot, {
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 240, 255, 0.4)',
                    border: 'none',
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.3, 
                    ease: 'power2.out'
                });
            });
        });
    }

    \;
    
    js = js.substring(0, sIdx) + replaceJs + js.substring(eIdx);
    fs.writeFileSync('script.js', js);
    console.log('Cursor Option 3 applied');
} else {
    console.log('Could not find JS bounds for cursor');
}
