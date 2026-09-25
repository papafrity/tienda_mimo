const fs = require('fs');

function fixEncoding(text) {
    return text
        .replace(/Ã¡/g, 'á')
        .replace(/Ã©/g, 'é')
        .replace(/Ã³/g, 'ó')
        .replace(/Ã­/g, 'í') // notice this has a non-breaking space or hidden char sometimes, let's use broad replacements
        .replace(/Ãº/g, 'ú')
        .replace(/Ã±/g, 'ñ')
        .replace(/Ã /g, 'à')
        .replace(/Â¡/g, '¡')
        .replace(/Â¿/g, '¿')
        .replace(/Ã\xAD/g, 'í') // specific hex for Ã­
        .replace(/Ã¯/g, 'ï')
        .replace(/Ã¼/g, 'ü')
        .replace(/Ã\x81/g, 'Á')
        .replace(/Ã\x89/g, 'É')
        .replace(/Ã\x8D/g, 'Í')
        .replace(/Ã\x93/g, 'Ó')
        .replace(/Ã\x9A/g, 'Ú')
        .replace(/Ã\x91/g, 'Ñ')
        .replace(/â€“/g, '-')
        .replace(/â€œ/g, '"')
        .replace(/â€\x9D/g, '"')
        .replace(/â€˜/g, "'")
        .replace(/â€™/g, "'")
        .replace(/ðŸ›’/g, '🛒')
        .replace(/ðŸ“¦/g, '📦')
        .replace(/ðŸ”¥/g, '🔥')
        .replace(/ðŸšš/g, '🚚')
        .replace(/ðŸ’¡/g, '💡')
        .replace(/ðŸŽ®/g, '🎮')
        .replace(/ðŸ“±/g, '📱')
        .replace(/ðŸ’»/g, '💻')
        .replace(/ðŸ“º/g, '📺')
        .replace(/ðŸ› /g, '🛠️')
        .replace(/â­/g, '⭐')
        .replace(/âœ…/g, '✅')
        .replace(/âš ï¸/g, '⚠️')
        .replace(/âœ”ï¸/g, '✔️')
        .replace(/CatÇlogo/g, 'Catálogo')
        .replace(/TecnologÃa/g, 'Tecnología')
        .replace(/mÃ¡s/g, 'más')
        .replace(/DecoraciÃ³n/g, 'Decoración')
        .replace(/IluminaciÃ³n/g, 'Iluminación')
        .replace(/ClimatizaciÃ³n/g, 'Climatización')
        .replace(/VentilaciÃ³n/g, 'Ventilación')
        .replace(/BaÃ±o/g, 'Baño')
        .replace(/maÃ±ana/g, 'mañana')
        .replace(/BotÃ³n/g, 'Botón')
        .replace(/dÃas/g, 'días')
        .replace(/recibÃs/g, 'recibís')
        .replace(/envÃo/g, 'envío')
        .replace(/estÃ¡/g, 'está')
        .replace(/fÃ¡brica/g, 'fábrica')
        .replace(/selecciÃ³n/g, 'selección');
}

['index.html', 'script.js', 'styles.css', 'admin.html', 'admin.js'].forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = fixEncoding(content);
        
        // Specific removals
        if (file === 'index.html') {
            // Remove Boton de arrepentimiento
            content = content.replace(/<p>[^<]*Botón de arrepentimiento[^<]*<\/p>/gi, '');
            content = content.replace(/<p>[^<]*BotÃ³n de arrepentimiento[^<]*<\/p>/gi, '');
            // Sometimes it's inside a div or just text. Let's find the string.
            const idx = content.indexOf('Botón de arrepentimiento');
            if(idx !== -1) {
                const pStart = content.lastIndexOf('<p', idx);
                const pEnd = content.indexOf('</p>', idx) + 4;
                if(pStart !== -1 && pEnd !== -1) {
                    content = content.substring(0, pStart) + content.substring(pEnd);
                }
            }
        }
        
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log('Encoding fixed and Boton de arrepentimiento removed');
