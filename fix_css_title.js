const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');
css = css.replace(/\.split-title\{font-size:2rem;text-align:center;display:block\}/g, '.split-title{font-size:clamp(1.5rem, 7vw, 2.2rem);text-align:center;display:block;word-break:normal !important;overflow-wrap:normal !important;}');
fs.writeFileSync('styles.css', css, 'utf8');
console.log('Fixed CSS');
