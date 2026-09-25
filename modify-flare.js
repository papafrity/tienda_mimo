
const fs = require("fs");
let css = fs.readFileSync("styles.css", "utf8");
css = css.replace("? ENVÍO GRATIS", "? ENVÍO GRATIS (CABA)");
fs.writeFileSync("styles.css", css);
console.log("Flare updated");

