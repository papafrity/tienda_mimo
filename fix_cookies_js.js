const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');
const cookieJS = \n// --- COOKIE BANNER ---\ndocument.addEventListener('DOMContentLoaded', () => {\n    const banner = document.getElementById('cookieBanner');\n    const btn = document.getElementById('acceptCookies');\n    if (banner && btn) {\n        if (!localStorage.getItem('cookiesAccepted')) {\n            banner.style.display = 'flex';\n        }\n        btn.addEventListener('click', () => {\n            localStorage.setItem('cookiesAccepted', 'true');\n            banner.style.display = 'none';\n        });\n    }\n});\n;
if (!js.includes('cookieBanner')) {
    fs.appendFileSync('script.js', cookieJS, 'utf8');
    console.log('Added cookie JS');
}
