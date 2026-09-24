const fs = require('fs');
let data = fs.readFileSync('script.js', 'utf8');

// Replace open Product Modal
const openStr = 'if (!p) return;';
const openReplace = 'if (!p) return;\n            if (new URLSearchParams(window.location.search).get("p") !== prodId) history.pushState(null, "", "?p=" + encodeURIComponent(prodId));';
data = data.replace(openStr, openReplace);

// Replace closeM
const closeStr = "document.body.style.overflow = ''; }";
const closeReplace = "document.body.style.overflow = ''; if(window.location.search.includes('?p=')) history.pushState(null, '', window.location.pathname); }";
data = data.replace(closeStr, closeReplace);

fs.writeFileSync('script.js', data);
console.log('Fixed URLs');
