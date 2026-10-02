const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// Remove old conflicting search block (lines 2962-2972)
const oldBlock = /\/\* FULLSCREEN SEARCH DROPDOWN RE-DESIGN \*\/[\s\S]*?\.search-dropdown\.active \{ background:[\s\S]*?\}/;
const newBlock = /* ─── SEARCH DROPDOWN FULLSCREEN (clean rewrite) ─── */
.search-dropdown {
    position: fixed !important;
    top: 80px !important;
    left: 50% !important;
    transform: translateX(-50%) translateY(-12px) !important;
    width: calc(100vw - 2rem) !important;
    max-width: 860px !important;
    max-height: calc(100dvh - 100px) !important;
    overflow: hidden !important;
    border-radius: 20px !important;
    opacity: 0 !important;
    visibility: hidden !important;
    transition: opacity .3s ease, transform .3s ease, visibility .3s ease !important;
    z-index: 100000 !important;
    background: rgba(8, 10, 15, 0.98) !important;
    backdrop-filter: blur(40px) !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    box-shadow: 0 40px 100px rgba(0,0,0,0.8) !important;
    display: flex !important;
    flex-direction: column !important;
    padding: 1.5rem !important;
}
.search-dropdown.active {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateX(-50%) translateY(0) !important;
}
.search-input { border-bottom: 1px solid rgba(255,255,255,0.1) !important; padding: 0.5rem 0 1rem 0 !important; margin-bottom: 1rem !important; font-size: 1.2rem !important; }
.search-results { flex: 1 !important; max-height: none !important; overflow-y: auto !important; display: grid !important; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important; gap: 1rem !important; align-content: start !important; }
.search-result-item { flex-direction: column !important; text-align: center !important; gap: 0.5rem !important; padding: 1rem !important; background: rgba(255,255,255,0.02) !important; border-radius: 16px !important; }
.search-result-item img { width: 100px !important; height: 100px !important; margin: 0 auto !important; }
@media(max-width:768px) {
    .search-dropdown { width: calc(100vw - 1rem) !important; }
    .search-results { grid-template-columns: 1fr !important; }
    .search-result-item { flex-direction: row !important; text-align: left !important; }
    .search-result-item img { width: 64px !important; height: 64px !important; margin: 0 !important; }
};

if (oldBlock.test(css)) {
    css = css.replace(oldBlock, newBlock);
    console.log('Replaced old search block');
} else {
    css += '\n\n' + newBlock;
    console.log('Appended new search block (old not found)');
}

// Fix split-title on mobile: remove display:block which breaks the char spans
css = css.replace(/\.split-title\{font-size:clamp\(1\.5rem, 7vw, 2\.2rem\);text-align:center;display:block;word-break:normal !important;overflow-wrap:normal !important;\}/g, '.split-title{font-size:clamp(1.5rem,7vw,2.2rem);text-align:center;word-break:keep-all !important;overflow-wrap:normal !important;}');
fs.writeFileSync('styles.css', css, 'utf8');
console.log('Done');
