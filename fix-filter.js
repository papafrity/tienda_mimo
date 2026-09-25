const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');
html = html.replace(
    '<button class="stat-filter" data-filter="month"',
    '<button class="stat-filter" data-filter="year" style="background:transparent; color:#fff; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; font-size: 0.8rem;">Este Año</button>\n                            <button class="stat-filter" data-filter="month"'
);
fs.writeFileSync('admin.html', html);
console.log('Year filter added to HTML');
