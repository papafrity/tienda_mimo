const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

const searchBtn = '<button id="adminRecalcAllBtn" class="magnetic-btn" style="background:transparent;border:1px solid #ffd700;color:#ffd700;padding:.5rem 1rem;font-size:.85rem">🔄 Recalcular todos</button>';
const replaceBtn = searchBtn + '\n                        <button id="adminAddReviewBtn" class="magnetic-btn" style="background:transparent;border:1px solid #2ed573;color:#2ed573;padding:.5rem 1rem;font-size:.85rem">➕ Añadir Reseña</button>';

if (!html.includes('adminAddReviewBtn')) {
    html = html.replace(searchBtn, replaceBtn);
}

// Add the Add Review Modal at the end of the file
const addReviewModal = "\n" +
"    <!-- ADD REVIEW MODAL -->\n" +
"    <div id=\"addReviewModal\" class=\"modal-overlay hidden\" style=\"z-index:99999\">\n" +
"        <div class=\"admin-modal-content\" style=\"max-width:400px\">\n" +
"            <button class=\"modal-close\" id=\"closeAddReviewBtn\">&times;</button>\n" +
"            <h3>Añadir Reseña Manual</h3>\n" +
"            <div class=\"form-group\">\n" +
"                <label>Nombre del Cliente</label>\n" +
"                <input type=\"text\" id=\"manRevName\" class=\"form-input\" placeholder=\"Ej: Juan P.\">\n" +
"            </div>\n" +
"            <div class=\"form-group\">\n" +
"                <label>Puntuación (1-5)</label>\n" +
"                <input type=\"number\" id=\"manRevScore\" class=\"form-input\" min=\"1\" max=\"5\" value=\"5\">\n" +
"            </div>\n" +
"            <div class=\"form-group\">\n" +
"                <label>Comentario</label>\n" +
"                <textarea id=\"manRevComment\" class=\"form-input\" rows=\"3\" placeholder=\"Excelente producto...\"></textarea>\n" +
"            </div>\n" +
"            <div class=\"form-group\">\n" +
"                <label>Fecha (Opcional, formato YYYY-MM-DD)</label>\n" +
"                <input type=\"date\" id=\"manRevDate\" class=\"form-input\">\n" +
"            </div>\n" +
"            <button id=\"saveManRevBtn\" class=\"btn-primary\" style=\"width:100%\">Guardar Reseña</button>\n" +
"        </div>\n" +
"    </div>\n";

if (!html.includes('addReviewModal')) {
    const endBody = html.indexOf('</body>');
    html = html.substring(0, endBody) + addReviewModal + html.substring(endBody);
}

fs.writeFileSync('admin.html', html);
console.log('Admin HTML updated with review features');
