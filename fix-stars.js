const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');
fs.writeFileSync('script.js', js); console.log('Stars logic updated');
