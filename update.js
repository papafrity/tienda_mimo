const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');
js = js.replace(/<img src="\$\{([^}]+)\}" alt="\$\{([^}]+)\}">/g, '<img src="${$1}" alt="${$2}" loading="lazy" decoding="async">');
fs.writeFileSync('script.js', js);
