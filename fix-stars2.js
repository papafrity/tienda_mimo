const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');
js = js.split('Math.round(p.score)').join('Math.round(p.score || 5)');
fs.writeFileSync('script.js', js);
console.log('Stars fixed via split-join');
