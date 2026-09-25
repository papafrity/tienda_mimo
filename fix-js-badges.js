
const fs = require("fs");
let js = fs.readFileSync("script.js", "utf8");

js = js.replace(/const badgeHtml =.*?<\/span>` : "";/g, "const badgeHtml = ``;");
js = js.replace(/<span class="badge">.*?<\/span>/g, "");
js = js.replace(/\${p.badge \? `<span class="badge-new">\${p.badge}<\/span>` : ""}/g, "");
js = js.replace(/\${p.badge \? `<span class="badge">\${p.badge}<\/span>` : ""}/g, "");
js = js.replace(/\${badgeHtml}/g, "");
js = js.replace(/<span class="badge">\${p.category}<\/span>/g, "");

fs.writeFileSync("script.js", js);
console.log("Badges removed");

