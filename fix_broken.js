const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const correctBlock = '<div class="nav-center" style="display: flex; align-items: center; gap: 1.5rem;">\n        <div class="search-container" id="searchContainer">\n            <button class="search-toggle magnetic-btn" id="searchToggle" aria-label="Buscar">\n                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>\n            </button>\n            <div class="search-dropdown" id="searchDropdown">\n                <input type="text" class="search-input" id="searchInput" placeholder="Buscar productos..." autocomplete="off">\n                <div class="search-results" id="searchResults"></div>\n            </div>\n        </div>\n        <ul class="nav-links" id="navLinks">\n            <li><a href="#carousel" data-instant><span class="nav-text">Ofertas</span></a></li>\n            <li><a href="#products"><span class="nav-text">Productos</span></a></li>\n            <li><a href="#contact"><span class="nav-text">Contacto</span></a></li>\n        </ul>\n    </div>';
const regex = /<div class="nav-center"[\s\S]*?<a href="#contact"><span class="nav-text">Contacto<\/span><\/a><\/li>[\s\S]*?<\/ul>/;
if (regex.test(html)) {
    html = html.replace(regex, correctBlock);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Fixed html');
} else {
    console.log('Regex failed');
}
