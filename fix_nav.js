const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const target = '<div class="search-container" id="searchContainer">';
if (html.includes(target) && !html.includes('<div class="nav-right">')) {
    html = html.replace(target, '<div class="nav-right">\n        ' + target);
    const hamburgerEnd = '</span>\n        </button>';
    const idx = html.indexOf(hamburgerEnd);
    if (idx !== -1) {
        const insertIdx = idx + hamburgerEnd.length;
        html = html.slice(0, insertIdx) + '\n    </div>' + html.slice(insertIdx);
    }
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Fixed nav-right');
} else {
    console.log('nav-right already exists or target not found');
}
