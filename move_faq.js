const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const faqRegex = /<!--[^<]*CENTRO DE AYUDA & BENEFICIOS FAQ[^<]*-->\s*<section class="faq-bento-section"[\s\S]*?<\/section>/;
const faqMatch = html.match(faqRegex);
if (faqMatch) {
    let newHtml = html.replace(faqRegex, '');
    const footerRegex = /<!-- Footer -->\s*<footer/i;
    newHtml = newHtml.replace(footerRegex, faqMatch[0] + '\n\n    <!-- Footer -->\n    <footer');
    fs.writeFileSync('index.html', newHtml);
    console.log('FAQ section moved successfully.');
} else {
    console.log('FAQ section not found.');
}
