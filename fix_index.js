const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/Toda la tecnolog[^\s]* en un click/, 'Toda la tecnología en un click');
html = html.replace(/<form class="hero-search" id="heroSearch"[^>]*>[\s\S]*?<\/form>/, '');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed index.html');
