const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');
html = html.replace('<button id="migrateBtn"', '<button id="generateSitemapBtn" class="magnetic-btn outline" style="margin-right:0.5rem; background:rgba(0,240,255,0.1); border-color:rgba(0,240,255,0.3); color:#fff">??? Generar Sitemap SEO</button>\n                <button id="migrateBtn"');
fs.writeFileSync('admin.html', html);

let js = fs.readFileSync('admin.js', 'utf8');
const sitemapLogic = \n// SEO SITEMAP GENERATOR\ndocument.getElementById('generateSitemapBtn')?.addEventListener('click', () => {\n    const baseUrl = 'https://tienda-mimo.vercel.app';\n    let xml = '<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n';\n    xml += '  <url>\\n    <loc>' + baseUrl + '/</loc>\\n    <changefreq>daily</changefreq>\\n    <priority>1.0</priority>\\n  </url>\\n';\n    \n    const tbody = document.getElementById('productsTable');\n    const rows = tbody ? tbody.querySelectorAll('tr') : [];\n    rows.forEach(row => {\n        const id = row.getAttribute('data-id');\n        if(id) {\n            xml += '  <url>\\n    <loc>' + baseUrl + '/?p=' + encodeURIComponent(id) + '</loc>\\n    <changefreq>weekly</changefreq>\\n    <priority>0.8</priority>\\n  </url>\\n';\n        }\n    });\n    xml += '</urlset>';\n    \n    const blob = new Blob([xml], {type: 'text/xml'});\n    const url = URL.createObjectURL(blob);\n    const a = document.createElement('a');\n    a.href = url;\n    a.download = 'sitemap.xml';\n    a.click();\n    URL.revokeObjectURL(url);\n    alert('Sitemap.xml generado. Por favor reemplazá el archivo sitemap.xml en tu carpeta y subilo a GitHub/Vercel.');\n});\n;
js += sitemapLogic;
fs.writeFileSync('admin.js', js);
console.log('Sitemap logic added');
