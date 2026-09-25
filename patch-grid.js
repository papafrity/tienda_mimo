
const fs = require("fs");
let css = fs.readFileSync("styles.css", "utf8");

css = css.replace(/gap: 2px !important;/g, "gap: 12px !important;");
css = css.replace(/padding: 0 !important;\s*\}/g, "padding: 0 1rem !important;\n    }");
css = css.replace(/background: #111 !important;/g, "background: rgba(255,255,255,0.03) !important; border-radius: 8px !important;");

fs.writeFileSync("styles.css", css);
console.log("Grid patched");

