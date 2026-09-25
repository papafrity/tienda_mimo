
const fs = require("fs");

// 1. Fix Button
let css = fs.readFileSync("styles.css", "utf8");
if (!css.includes("#loadMoreBtn")) {
    css += "\n\n/* LOAD MORE BUTTON FIX */\n#loadMoreBtn {\n    background: transparent !important;\n    color: var(--accent-color) !important;\n    border: 1px solid var(--accent-color) !important;\n    border-radius: 50px !important;\n    padding: 0.8rem 2.5rem !important;\n    font-size: 0.95rem !important;\n    font-weight: 600 !important;\n    cursor: pointer !important;\n    transition: all 0.3s !important;\n    display: block;\n    margin: 2rem auto;\n}\n#loadMoreBtn:hover {\n    background: var(--gradient-glow) !important;\n    color: #000 !important;\n    border-color: transparent !important;\n}\n";
}

// 2. Fix Fade Divider in CSS
css = css.replace(".wave-divider{position:relative;z-index:1;line-height:0;margin-bottom:-1px}", ".wave-divider{position:relative;z-index:1;line-height:0;margin-bottom:-1px; height:80px; background: linear-gradient(to bottom, transparent, #030303);}");
css = css.replace(".wave-divider svg{display:block;width:100%;height:80px}", ".wave-divider svg{display:none;}");

fs.writeFileSync("styles.css", css);

// 3. Just in case, fix fade divider in HTML (not strictly needed since we hid the SVG via CSS, but cleaner to replace it).
// Actually, modifying just the CSS is safer and avoids HTML parsing issues.

console.log("Patched Load More Button and replaced wave with fade.");

