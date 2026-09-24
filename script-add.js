const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');
html = html.replace('<button id="migrateBtn"', '<button id="generateSitemapBtn" class="magnetic-btn outline" style="margin-right:0.5rem; background:rgba(0,240,255,0.1); border-color:rgba(0,240,255,0.3); color:#fff">Sitemap SEO</button>\n                <button id="migrateBtn"');
fs.writeFileSync('admin.html', html);

let js = fs.readFileSync('admin.js', 'utf8');
const lines = [
  "// SEO SITEMAP GENERATOR",
  "document.getElementById('generateSitemapBtn')?.addEventListener('click', () => {",
  "    const baseUrl = 'https://tienda-mimo.vercel.app';",
  "    let xml = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\\n';",
  "    xml += '  <url>\\n    <loc>' + baseUrl + '/</loc>\\n    <changefreq>daily</changefreq>\\n    <priority>1.0</priority>\\n  </url>\\n';",
  "    const tbody = document.getElementById('productsTable');",
  "    const rows = tbody ? tbody.querySelectorAll('tr') : [];",
  "    rows.forEach(row => {",
  "        const id = row.getAttribute('data-id');",
  "        if(id) { xml += '  <url>\\n    <loc>' + baseUrl + '/?p=' + encodeURIComponent(id) + '</loc>\\n    <changefreq>weekly</changefreq>\\n    <priority>0.8</priority>\\n  </url>\\n'; }",
  "    });",
  "    xml += '</urlset>';",
  "    const blob = new Blob([xml], {type: 'text/xml'});",
  "    const url = URL.createObjectURL(blob);",
  "    const a = document.createElement('a');",
  "    a.href = url;",
  "    a.download = 'sitemap.xml';",
  "    a.click();",
  "    URL.revokeObjectURL(url);",
  "    alert('Sitemap.xml generado con todos los productos. Reemplaza el archivo sitemap.xml en tu carpeta local y pushea a GitHub.');",
  "});"
];
js += "\n\n" + lines.join("\n");
fs.writeFileSync('admin.js', js);
