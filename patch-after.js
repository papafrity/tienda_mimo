
const fs = require("fs");
let css = fs.readFileSync("styles.css", "utf8");

css = css.replace(/\.product-card::after \{\s*display: none !important;\s*\}/g, "");
css = css.replace(/\.product-card \.price, \.product-card \.offer-price \{\s*font-size: 0.8rem !important;\s*font-weight: 600 !important;\s*\}/g, ".product-card .price, .product-card .offer-price {\n        font-size: 1.1rem !important;\n        font-weight: 600 !important;\n    }");

fs.writeFileSync("styles.css", css);
console.log("Card patched");

