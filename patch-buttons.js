
const fs = require("fs");
let css = fs.readFileSync("styles.css", "utf8");

// We need to fix `.checkout-btn` and `.checkout-submit-btn`
const btnFix = `
/* GLOBAL BUTTON FIXES (RESTORE DARK/ACCENT STYLES) */
.checkout-btn, .checkout-submit-btn {
    background: var(--gradient-glow) !important;
    color: #000 !important;
    border: none !important;
    border-radius: 30px !important;
    font-size: 1.1rem !important;
    font-weight: 700 !important;
    cursor: pointer !important;
    transition: all 0.3s !important;
    padding: 1rem !important;
    width: 100% !important;
}
.checkout-btn:hover, .checkout-submit-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 10px 20px rgba(0, 240, 255, 0.3) !important;
}
`;

if (!css.includes("GLOBAL BUTTON FIXES")) {
    fs.writeFileSync("styles.css", css + "\n" + btnFix);
    console.log("Button fixes applied");
}

