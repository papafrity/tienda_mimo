const fs = require('fs');
let data = fs.readFileSync('script.js', 'utf8');

const targetStr = 'initProductFiltersAndModals();';
const replaceStr = 'initProductFiltersAndModals();\n\n            // SEO: check if a product is in URL\n            const urlParams = new URLSearchParams(window.location.search);\n            const pId = urlParams.get("p");\n            if (pId) {\n                setTimeout(() => { if(typeof window.openProductModal === "function") window.openProductModal(pId); }, 300);\n            }';
data = data.replace(targetStr, replaceStr);

fs.writeFileSync('script.js', data);
console.log('Fixed init URL param');
