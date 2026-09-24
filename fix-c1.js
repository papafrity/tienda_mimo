const fs = require('fs');

// --- 1. Fix CSS for Cursor Option 1 ---
let css = fs.readFileSync('styles.css', 'utf8');

// The Option 3 css I injected was:
const cssTarget = '.cursor-dot{width:20px;height:20px;background:rgba(0,240,255,0.4);border-radius:50%;position:fixed;top:0;left:0;pointer-events:none;z-index:9999;backdrop-filter:blur(2px);box-sizing:border-box}';
const cssReplace = '.cursor-dot{display:none} /* Hidden dot, using native */';

css = css.replace(cssTarget, cssReplace);

// I need to ensure cursor is auto
css = css.replace('body{background:var(--bg);color:var(--text-primary);font-family:var(--font-sans);line-height:1.6;overflow-x:hidden}', 
                  'body{background:var(--bg);color:var(--text-primary);font-family:var(--font-sans);line-height:1.6;overflow-x:hidden;cursor:auto}');

// Re-style cursor-ring to be a glowing aura
const ringTarget = '.cursor-ring{width:36px;height:36px;border:1px solid rgba(0,240,255,0.3);border-radius:50%;position:fixed;top:0;left:0;pointer-events:none;z-index:9998;transition:width .3s var(--ease-out-expo),height .3s var(--ease-out-expo),border-color .3s,box-shadow .3s;transform:translate(-50%,-50%)}';
const ringReplace = '.cursor-ring{width:50px;height:50px;background:radial-gradient(circle, rgba(0,240,255,0.2) 0%, rgba(0,240,255,0) 70%);border:none;border-radius:50%;position:fixed;top:0;left:0;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:width 0.3s ease, height 0.3s ease;mix-blend-mode:screen;}';
css = css.replace(ringTarget, ringReplace);

const ringHoverTarget = '.cursor-ring.hover{width:56px;height:56px;border-color:var(--accent-color);box-shadow:0 0 20px rgba(0,240,255,.15),0 0 40px rgba(0,240,255,.05)}';
const ringHoverReplace = '.cursor-ring.hover{width:80px;height:80px;background:radial-gradient(circle, rgba(0,240,255,0.3) 0%, rgba(0,240,255,0) 70%);}';
css = css.replace(ringHoverTarget, ringHoverReplace);

const ringHoverCardTarget = '.cursor-ring.hover-card{width:64px;height:64px;border-color:var(--accent-color);box-shadow:0 0 30px rgba(0,240,255,.2),0 0 60px rgba(0,240,255,.08);background:rgba(0,240,255,.03)}';
const ringHoverCardReplace = '.cursor-ring.hover-card{width:100px;height:100px;background:radial-gradient(circle, rgba(0,240,255,0.25) 0%, rgba(0,240,255,0) 70%);}';
css = css.replace(ringHoverCardTarget, ringHoverCardReplace);

fs.writeFileSync('styles.css', css);

// --- 2. Fix JS for Cursor Option 1 ---
let js = fs.readFileSync('script.js', 'utf8');

const sIdx = js.indexOf('// CUSTOM CURSOR (Option 3: Magnetic Solid)');
const eIdx = js.indexOf('// SPLIT TITLE');

if (sIdx !== -1 && eIdx !== -1) {
    const replaceJs = "// CUSTOM CURSOR (Option 1: Aura)\n" +
"    const ring = document.getElementById('cursorRing');\n" +
"    if (ring) ring.style.display = 'block';\n" +
"    let cx = 0, cy = 0, rx = 0, ry = 0;\n" +
"    document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });\n" +
"    function animateCursor() {\n" +
"        if (!ring) return;\n" +
"        rx += (cx - rx) * 0.2; ry += (cy - ry) * 0.2;\n" +
"        ring.style.left = rx + 'px'; ring.style.top = ry + 'px';\n" +
"        requestAnimationFrame(animateCursor);\n" +
"    }\n" +
"    animateCursor();\n" +
"    document.querySelectorAll('a, button, .product-card, .carousel-card, .filter-tab, .cart-btn').forEach(el => {\n" +
"        el.addEventListener('mouseenter', () => ring && ring.classList.add('hover'));\n" +
"        el.addEventListener('mouseleave', () => ring && ring.classList.remove('hover'));\n" +
"    });\n" +
"    document.querySelectorAll('.product-card, .carousel-card').forEach(el => {\n" +
"        el.addEventListener('mouseenter', () => { if(ring){ ring.classList.remove('hover'); ring.classList.add('hover-card'); } });\n" +
"        el.addEventListener('mouseleave', () => ring && ring.classList.remove('hover-card'));\n" +
"    });\n\n    ";
    
    js = js.substring(0, sIdx) + replaceJs + js.substring(eIdx);
    fs.writeFileSync('script.js', js);
}
console.log('Cursor Option 1 applied');
