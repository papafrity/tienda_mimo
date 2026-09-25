const fs = require('fs');
let js = fs.readFileSync('admin.js', 'utf8');

// 1. Remove cleanDuplicates logic
const dupStart = js.indexOf("document.getElementById('migrateBtn').insertAdjacentHTML('afterend'");
if (dupStart !== -1) {
    const dupEnd = js.indexOf("btn.disabled = false;\n});", dupStart) + 24;
    if (dupEnd > dupStart + 24) {
        js = js.substring(0, dupStart) + js.substring(dupEnd);
    }
}

// 2. Fix calcShipping references
js = js.replace("const calcShipping = document.getElementById('calcShipping');\\n", "");
js = js.replace("[calcCost, calcUsdRate, calcShipping, calcProfit]", "[calcCost, calcUsdRate, calcProfit]");
js = js.replace("const shipping = parseFloat(calcShipping.value) || 0;", "const shipping = 0;");

// 3. Rewrite loadStats to support filters
const statSearch = 'async function loadStats() {';
const statReplace = \sync function loadStats(filter = 'all') {
    try {
        const snapshot = await db.collection('orders').get();
        let totalRevenue = 0, paidCount = 0, totalCount = 0;
        const productCount = {};
        
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0,0,0,0);
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        snapshot.forEach(doc => {
            const o = doc.data();
            
            // Filter by date
            let include = true;
            if (filter !== 'all') {
                const orderDate = o.createdAt ? (o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt)) : new Date(0);
                if (filter === 'week' && orderDate < startOfWeek) include = false;
                if (filter === 'month' && orderDate < startOfMonth) include = false;
            }
            
            if (!include) return;

            totalCount++;
            if (o.status === 'paid') {
                paidCount++;
                totalRevenue += o.total || 0;
                (o.cart || []).forEach(item => {
                    const key = item.name || item.id;
                    productCount[key] = (productCount[key] || 0) + item.qty;
                });
            }
        });

        const revEl = document.getElementById('statTotalRevenue');
        if (revEl) revEl.textContent = '$' + totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 });
        const ordersEl = document.getElementById('statTotalOrders');
        if (ordersEl) ordersEl.textContent = totalCount;
        const paidEl = document.getElementById('statPaidOrders');
        if (paidEl) paidEl.textContent = paidCount;

        const sorted = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const list = document.getElementById('topProductsList');
        if (list) {
            list.innerHTML = sorted.length === 0
                ? '<div style="color:var(--text-secondary);font-size:0.85rem">No hay datos de ventas en este periodo.</div>'
                : sorted.map(([name, qty]) => \<div style="display:flex;justify-content:space-between;background:rgba(255,255,255,0.02);padding:0.5rem 0.8rem;border-radius:6px;font-size:0.85rem">
                    <span style="color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%">\</span>
                    <span style="color:var(--accent-color);font-weight:bold">\ unid.</span>
                </div>\).join('');
        }
    } catch (e) {
        console.error('Error loading stats:', e);
    }
}
\;

if (js.indexOf(statSearch) !== -1 && !js.includes('if (filter !== \\'all\\') {')) {
    const startIdx = js.indexOf(statSearch);
    const endIdx = js.indexOf('} catch (e) {', startIdx) + 80; // approximate end
    const realEnd = js.indexOf('}', js.indexOf('}', endIdx)) + 1; // get out of loadStats block
    
    // Actually, I'll just replace the whole function by string manipulation
    const bodyStart = js.indexOf('{', startIdx) + 1;
    // let's do regex replace for the whole function
}
// Let's use regex to replace loadStats function
js = js.replace(/async function loadStats\(\) \{[\s\S]*?console\.error\('Error loading stats:', e\);\n    \}\n\}/, statReplace);

// Add event listeners for the filters
const filterListeners = \
document.querySelectorAll('.stat-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.stat-filter').forEach(b => {
            b.classList.remove('active');
            b.style.background = 'transparent';
            b.style.color = '#fff';
        });
        const target = e.currentTarget;
        target.classList.add('active');
        target.style.background = 'rgba(0,240,255,0.1)';
        target.style.color = 'var(--accent-color)';
        
        loadStats(target.dataset.filter);
    });
});
\;
if (!js.includes('.stat-filter')) {
    js += '\\n' + filterListeners;
}

fs.writeFileSync('admin.js', js);
console.log('admin.js updated');
