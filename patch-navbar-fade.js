
const fs = require("fs");
let css = fs.readFileSync("styles.css", "utf8");

css = css.replace(/\.navbar::after\{content:.*?\}/, ".navbar::after{display:none !important;}");

fs.writeFileSync("styles.css", css);
console.log("Navbar fade patched");

