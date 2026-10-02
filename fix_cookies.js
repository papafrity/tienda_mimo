const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const cookieBanner = '<div id="cookieBanner" style="display:none;position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(10,12,18,0.95);border:1px solid #333;padding:15px 25px;border-radius:12px;z-index:999999;box-shadow:0 10px 30px rgba(0,0,0,0.5);align-items:center;gap:20px;backdrop-filter:blur(10px);width:calc(100% - 40px);max-width:500px;"><p style="margin:0;font-size:0.9rem;color:#ccc;line-height:1.4;">Usamos cookies para mejorar tu experiencia en nuestra web. Al continuar navegando, aceptas nuestra <a href="privacidad.html" style="color:#00f0ff;text-decoration:none;">Política de Privacidad</a>.</p><button id="acceptCookies" style="background:#00f0ff;color:#000;border:none;padding:8px 16px;border-radius:8px;font-weight:bold;cursor:pointer;flex-shrink:0;">Aceptar</button></div>';
if (!html.includes('cookieBanner')) {
    html = html.replace('</body>', cookieBanner + '\n</body>');
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Added cookie banner HTML');
}
