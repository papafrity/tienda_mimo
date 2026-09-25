
const fs = require("fs");
let css = fs.readFileSync("styles.css", "utf8");

// Change height of carousel on mobile
css = css.replace(/height:440px/g, "height:380px");
// Just in case it was 460px
css = css.replace(/min-height:460px/g, "min-height:400px");

fs.writeFileSync("styles.css", css);
console.log("Patched carousel height");

