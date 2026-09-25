
const fs = require("fs");
let html = fs.readFileSync("admin.html", "utf8");

html = html.replace(/<button class="tab-btn" data-tab="tab-reviews">.*?<\/button>/, `$&` + `\n            <button class="tab-btn" data-tab="tab-settings">?? Configuración</button>`);

const settingsTab = `
        <!-- TAB CONTENT: SETTINGS -->
        <div id="tab-settings" class="tab-content hidden">
            <div class="calculator-card" style="max-width: 600px; margin: 0 auto; background: var(--surface-color); padding: 2rem; border-radius: 15px; border: 1px solid var(--surface-border);">
                <h3 style="margin-top: 0; margin-bottom: 1.5rem; font-family: var(--font-display);">?? Configuración de Transferencia</h3>
                
                <div class="calc-form-group" style="margin-bottom: 1rem;">
                    <label for="adminTransferDiscount">Descuento por Transferencia (%)</label>
                    <input type="number" id="adminTransferDiscount" class="calc-input" placeholder="Ej: 10" min="0" max="100">
                    <small style="color: var(--text-secondary); font-size: 0.8rem; display: block; margin-top: 0.3rem;">Dejar en 0 si no hay descuento.</small>
                </div>
                
                <div class="calc-form-group" style="margin-bottom: 1rem;">
                    <label for="adminTransferCbu">CBU / CVU</label>
                    <input type="text" id="adminTransferCbu" class="calc-input" placeholder="0000000000000000000000">
                </div>
                
                <div class="calc-form-group" style="margin-bottom: 1rem;">
                    <label for="adminTransferAlias">Alias</label>
                    <input type="text" id="adminTransferAlias" class="calc-input" placeholder="MI.ALIAS.BANCO">
                </div>
                
                <div class="calc-form-group" style="margin-bottom: 1.5rem;">
                    <label for="adminTransferName">Titular de la Cuenta</label>
                    <input type="text" id="adminTransferName" class="calc-input" placeholder="Juan Pérez">
                </div>
                
                <button id="saveSettingsBtn" class="magnetic-btn" style="background: var(--gradient-glow); color: #000; border: none; padding: 1rem; width: 100%; border-radius: 10px; font-weight: bold; cursor: pointer;">Guardar Configuración</button>
            </div>
        </div>
`;

if (!html.includes(`id="tab-settings"`)) {
    const closingDiv = html.lastIndexOf(`</div>\n\n    <!-- Product Modal -->`);
    if(closingDiv !== -1) {
        html = html.substring(0, closingDiv) + settingsTab + html.substring(closingDiv);
        fs.writeFileSync("admin.html", html);
        console.log("Settings tab added");
    } else { console.log("Product modal not found"); }
}

