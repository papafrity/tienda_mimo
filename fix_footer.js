const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const footerLinks = '<div class="footer-links">\n                <h4>Legal</h4>\n                <a href="aviso-legal.html">Aviso Legal</a>\n                <a href="privacidad.html">Política de Privacidad</a>\n            </div>';
if (!html.includes('Aviso Legal')) {
    html = html.replace('</div>\n        <div class="footer-bottom">', '</div>\n            ' + footerLinks + '\n        </div>\n        <div class="footer-bottom">');
    // also fix logo link
    html = html.replace('<a href="#" class="logo magnetic-btn">', '<a href="#home" class="logo magnetic-btn">');
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Fixed footer and logo');
}
