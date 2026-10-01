const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');
js = js.replace(/\(p\.name && p\.name\.toLowerCase\(\)\.includes\(query\) \|\|/g, '(p.name && p.name.toLowerCase().includes(query)) ||');
js = js.replace(/\(p\.category && p\.category\.toLowerCase\(\)\.includes\(query\) \|\|/g, '(p.category && p.category.toLowerCase().includes(query)) ||');
js = js.replace(/\(p\.name && p\.name\.toLowerCase\(\)\.includes\(q\) \|\|/g, '(p.name && p.name.toLowerCase().includes(q)) ||');
js = js.replace(/\(p\.category && p\.category\.toLowerCase\(\)\.includes\(q\) \|\|/g, '(p.category && p.category.toLowerCase().includes(q)) ||');
fs.writeFileSync('script.js', js, 'utf8');
