const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
// Extract search-container
const searchRegex = /<div class="search-container" id="searchContainer">[\s\S]*?<\/div>\s*<\/div>/;
const searchMatch = html.match(searchRegex);
if (searchMatch) {
    html = html.replace(searchMatch[0], '');
    // Find nav-links
    const navRegex = /<ul class="nav-links" id="navLinks">[\s\S]*?<\/ul>/;
    const navMatch = html.match(navRegex);
    if (navMatch) {
        const replacement = '<div class="nav-center" style="display: flex; align-items: center; gap: 1rem;">\n        ' + searchMatch[0].replace(/<\/div>\s*<\/div>$/, '</div>') + '\n        ' + navMatch[0] + '\n    </div>';
        html = html.replace(navMatch[0], replacement);
    }
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("HTML modified successfully.");
}
