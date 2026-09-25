
const fs = require("fs");
let css = fs.readFileSync("styles.css", "utf8");

// 1. Remove Mercado Libre style
css = css.replace(/\/\* =========================================\r?\n   MERCADO LIBRE STYLE FOR CAROUSEL CARDS\r?\n   ========================================= \*\/[\s\S]*?\/\* =========================================\r?\n   INSTAGRAM GRID ON MOBILE/, "/* =========================================\n   INSTAGRAM GRID ON MOBILE");

// 2. Modify Mobile Grid from 3 columns to 2
css = css.replace(/grid-template-columns: repeat\(3, 1fr\) !important;/g, "grid-template-columns: repeat(2, 1fr) !important;");

// Also restore some padding and border to the grid cards so it looks better
css = css.replace(/padding: 0 !important;\s*background: transparent !important;/g, "padding: 0.5rem !important;\n        background: rgba(255,255,255,0.03) !important;\n        border: 1px solid rgba(255,255,255,0.06) !important;\n        border-radius: 12px !important;");
css = css.replace(/height: 120px !important;/g, "height: 140px !important;");
css = css.replace(/\.product-card h3 \{\s*font-size: 0.7rem !important;/g, ".product-card h3 {\n        font-size: 0.85rem !important;");

// 3. Chatbot Max Height
const chatbotFix = `
/* CHATBOT FIXES */
.chatbot-window {
    max-height: calc(100vh - 120px) !important;
    display: flex !important;
    flex-direction: column !important;
}
.chatbot-messages {
    flex: 1 !important;
    overflow-y: auto !important;
}
`;
if (!css.includes("CHATBOT FIXES")) {
    css += "\n" + chatbotFix;
}

// 4. Hero Fade Top issue
// Let us find the hero fade in styles.css and lower its position
const heroFadeFix = `
/* HERO FADE FIX */
.hero::after {
    top: auto !important;
    bottom: 0 !important;
    height: 50% !important;
    background: linear-gradient(to top, var(--bg-color) 0%, transparent 100%) !important;
}
.hero-overlay {
    background: transparent !important; /* ensure it does not darken the top too much */
}
`;
if (!css.includes("HERO FADE FIX")) {
    css += "\n" + heroFadeFix;
}

fs.writeFileSync("styles.css", css);
console.log("CSS patched");

