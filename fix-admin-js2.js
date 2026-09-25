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
js = js.replace("const calcShipping = document.getElementById('calcShipping');\n", "");
js = js.replace("[calcCost, calcUsdRate, calcShipping, calcProfit]", "[calcCost, calcUsdRate, calcProfit]");
js = js.replace("const shipping = parseFloat(calcShipping.value) || 0;", "const shipping = 0;");

// 3. Rewrite loadStats to support filters
const statReplace = "async function loadStats(filter = 'all') {\n" +
"    try {\n" +
"        const snapshot = await db.collection('orders').get();\n" +
"        let totalRevenue = 0, paidCount = 0, totalCount = 0;\n" +
"        const productCount = {};\n" +
"        \n" +
"        const now = new Date();\n" +
"        const startOfWeek = new Date(now);\n" +
"        startOfWeek.setDate(now.getDate() - now.getDay());\n" +
"        startOfWeek.setHours(0,0,0,0);\n" +
"        \n" +
"        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);\n" +
"        const startOfYear = new Date(now.getFullYear(), 0, 1);\n" +
"\n" +
"        snapshot.forEach(doc => {\n" +
"            const o = doc.data();\n" +
"            \n" +
"            let include = true;\n" +
"            if (filter !== 'all') {\n" +
"                const orderDate = o.createdAt ? (o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt)) : new Date(0);\n" +
"                if (filter === 'year' && orderDate < startOfYear) include = false;\n" +
"                if (filter === 'month' && orderDate < startOfMonth) include = false;\n" +
"                if (filter === 'week' && orderDate < startOfWeek) include = false;\n" +
"            }\n" +
"            \n" +
"            if (!include) return;\n" +
"\n" +
"            totalCount++;\n" +
"            if (o.status === 'paid') {\n" +
"                paidCount++;\n" +
"                totalRevenue += o.total || 0;\n" +
"                (o.cart || []).forEach(item => {\n" +
"                    const key = item.name || item.id;\n" +
"                    productCount[key] = (productCount[key] || 0) + item.qty;\n" +
"                });\n" +
"            }\n" +
"        });\n" +
"\n" +
"        const revEl = document.getElementById('statTotalRevenue');\n" +
"        if (revEl) revEl.textContent = '$' + totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 });\n" +
"        const ordersEl = document.getElementById('statTotalOrders');\n" +
"        if (ordersEl) ordersEl.textContent = totalCount;\n" +
"        const paidEl = document.getElementById('statPaidOrders');\n" +
"        if (paidEl) paidEl.textContent = paidCount;\n" +
"\n" +
"        const sorted = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 10);\n" +
"        const list = document.getElementById('topProductsList');\n" +
"        if (list) {\n" +
"            list.innerHTML = sorted.length === 0\n" +
"                ? '<div style=\"color:var(--text-secondary);font-size:0.85rem\">No hay datos de ventas en este periodo.</div>'\n" +
"                : sorted.map(x => '<div style=\"display:flex;justify-content:space-between;background:rgba(255,255,255,0.02);padding:0.5rem 0.8rem;border-radius:6px;font-size:0.85rem\"><span style=\"color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%\">' + x[0] + '</span><span style=\"color:var(--accent-color);font-weight:bold\">' + x[1] + ' unid.</span></div>').join('');\n" +
"        }\n" +
"    } catch (e) {\n" +
"        console.error('Error loading stats:', e);\n" +
"    }\n" +
"}\n";

js = js.replace(/async function loadStats\(\) \{[\s\S]*?console\.error\('Error loading stats:', e\);\n    \}\n\}/, statReplace);

// Add event listeners for the filters
const filterListeners = "\n" +
"document.querySelectorAll('.stat-filter').forEach(btn => {\n" +
"    btn.addEventListener('click', (e) => {\n" +
"        document.querySelectorAll('.stat-filter').forEach(b => {\n" +
"            b.classList.remove('active');\n" +
"            b.style.background = 'transparent';\n" +
"            b.style.color = '#fff';\n" +
"        });\n" +
"        const target = e.currentTarget;\n" +
"        target.classList.add('active');\n" +
"        target.style.background = 'rgba(0,240,255,0.1)';\n" +
"        target.style.color = 'var(--accent-color)';\n" +
"        \n" +
"        loadStats(target.dataset.filter);\n" +
"    });\n" +
"});\n";
if (!js.includes('.stat-filter')) {
    js += filterListeners;
}

fs.writeFileSync('admin.js', js);
console.log('admin.js updated');
