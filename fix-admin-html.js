const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// 1. Add Calculator Tab
html = html.replace(
    '<button class=\"tab-btn\" data-tab=\"tab-shipping\">?? Tarifas de Envío</button>',
    '<button class=\"tab-btn\" data-tab=\"tab-shipping\">?? Tarifas de Envío</button>\n            <button class=\"tab-btn\" data-tab=\"tab-calculator\">?? Calculadora</button>'
);

// 2. Extract calculator from tab-products
const calcStart = html.indexOf('<div class=\"calculator-card\">');
const calcEnd = html.indexOf('<!-- Products Action -->'); // Just before the Add product button
if (calcStart !== -1 && calcEnd !== -1) {
    let calcHtml = html.substring(calcStart, calcEnd);
    
    // Remove shipping field from calcHtml
    const shipFieldStart = calcHtml.indexOf('<div class=\"calc-form-group\">\\n                                <label for=\"calcShipping\">Costo de Envío del Proveedor (ARS)</label>');
    if (shipFieldStart !== -1) {
        // Find next group
        const shipFieldEnd = calcHtml.indexOf('</div>', calcHtml.indexOf('</div>', shipFieldStart) + 6) + 6;
        calcHtml = calcHtml.substring(0, shipFieldStart) + calcHtml.substring(shipFieldEnd);
    }

    // Remove from original
    html = html.substring(0, calcStart) + html.substring(calcEnd);

    // Append to end as a new tab
    const newTab = \\\n\\n        <!-- TAB CONTENT: CALCULATOR -->\\n        <div id=\"tab-calculator\" class=\"tab-content hidden\">\\n            \ + calcHtml + \\\n        </div>\\n\\n\;
    const closingDiv = html.lastIndexOf('</div>\\n\\n    <!-- PRODUCT MODAL -->');
    html = html.substring(0, closingDiv) + newTab + html.substring(closingDiv);
}

// 3. Add filters to stats
const statsHeader = '<div style=\"display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem\">';
const newStatsHeader = \
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
                    <div style="display:flex; gap: 1rem; align-items:center">
                        <h3 style="margin:0">?? Estadísticas de Ventas</h3>
                        <div class="stats-filters" style="display:flex; gap: 0.5rem; background:rgba(255,255,255,0.05); padding: 0.3rem; border-radius: 10px;">
                            <button class="stat-filter active" data-filter="all" style="background:rgba(0,240,255,0.1); color:var(--accent-color); border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; font-weight:bold; font-size: 0.8rem;">Histórico</button>
                            <button class="stat-filter" data-filter="month" style="background:transparent; color:#fff; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; font-size: 0.8rem;">Este Mes</button>
                            <button class="stat-filter" data-filter="week" style="background:transparent; color:#fff; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; font-size: 0.8rem;">Esta Semana</button>
                        </div>
                    </div>
                    <button id="refreshStatsBtn" class="magnetic-btn" style="background:transparent;border:1px solid var(--surface-border);color:var(--text-secondary);padding:.5rem 1rem;border-radius:8px;font-size:.85rem">?? Actualizar</button>
                </div>
\;
html = html.replace(statsHeader + '\\n                    <h3 style="margin:0">?? Estadísticas de Ventas</h3>\\n                    <button id="refreshStatsBtn"', newStatsHeader + '<!--');
html = html.replace('<!-- class="magnetic-btn" style="background:transparent;border:1px solid var(--surface-border);color:var(--text-secondary);padding:.5rem 1rem;border-radius:8px;font-size:.85rem">?? Actualizar</button>\\n                </div>', '');

fs.writeFileSync('admin.html', html);
console.log('HTML structure updated');
