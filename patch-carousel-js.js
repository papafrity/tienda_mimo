
const fs = require("fs");
let js = fs.readFileSync("script.js", "utf8");

const oldHtml = `                <div class="carousel-card-info">
                    
                    <h3>\${p.name}</h3>
                    \${priceHtml}
                    <button class="add-to-cart magnetic-btn"`;

const newHtml = `                <div class="carousel-card-info">
                    
                    <h3>\${p.name}</h3>
                    <div class="stars">\${renderStarsHtml(p.rating)}\${p.reviewCount ? \`<span class="review-count">(\${p.reviewCount})</span>\` : ""}</div>
                    \${priceHtml}
                    \${tiersHintHtml(p)}
                    <button class="add-to-cart magnetic-btn"`;

js = js.replace(oldHtml, newHtml);
fs.writeFileSync("script.js", js);
console.log("Patched script.js for carousel cards");

