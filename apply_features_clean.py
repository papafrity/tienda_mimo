import re

with open("admin.html", "r", encoding="utf-8") as f:
    html = f.read()

# Fix the user's corrupted Settings tab text
html = html.replace('Configuraci\ufffdn', 'Configuración')
html = html.replace('P\ufffdrez', 'Pérez')

# 1. Move Calculator to tab-calculator
calc_match = re.search(r'(<!-- Cost Calculator Section -->.*?)<!-- Active Products -->', html, re.DOTALL)
if calc_match:
    calc_html = calc_match.group(1).strip()
    html = html.replace(calc_match.group(1), "") # Remove from tab-products
    
    # Enable the toggle visually since it's its own tab now
    calc_html = calc_html.replace('id="calculatorBody" class="calculator-body hidden"', 'id="calculatorBody" class="calculator-body"')
    calc_html = calc_html.replace('id="toggleCalcBtn"', 'id="toggleCalcBtn" class="calculator-header active"')

    # insert before tab-reviews
    tab_reviews_idx = html.find('<!-- TAB CONTENT: REVIEWS -->')
    if tab_reviews_idx != -1:
        new_tab = f"""<!-- TAB CONTENT: CALCULATOR -->
        <div id="tab-calculator" class="tab-content hidden">
            <div class="admin-main" style="margin-top:0;padding-top:0;padding-left:0;padding-right:0;">
                {calc_html}
            </div>
        </div>
        
        """
        html = html[:tab_reviews_idx] + new_tab + html[tab_reviews_idx:]

# 2. Fix Settings tab garbled text (if it wasn't caught by the replacement above)
html = html.replace('?? Configuración de Transferencia', '⚙️ Configuración de Transferencia')
html = html.replace('?? Configuración', '⚙️ Configuración')

# 3. Stats Date Filters (in tab-orders)
stats_filters_old = """<div class="stats-filters" style="display:flex; gap: 0.5rem; background:rgba(255,255,255,0.05); padding: 0.3rem; border-radius: 10px;">
                            <button class="stat-filter active" data-filter="all" style="background:rgba(0,240,255,0.1); color:var(--accent-color); border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; font-weight:bold; font-size: 0.8rem;">Histórico</button>
                            <button class="stat-filter" data-filter="year" style="background:transparent; color:#fff; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; font-size: 0.8rem;">Este Año</button>
                            <button class="stat-filter" data-filter="month" style="background:transparent; color:#fff; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; font-size: 0.8rem;">Este Mes</button>
                            <button class="stat-filter" data-filter="week" style="background:transparent; color:#fff; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; font-size: 0.8rem;">Esta Semana</button>
                        </div>"""
stats_filters_new = """<div class="stats-filters" style="display:flex; gap: 0.5rem; background:rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 10px; flex-wrap:wrap; align-items:center;">
                            <button class="stat-filter active" data-filter="all" style="background:rgba(0,240,255,0.1); color:var(--accent-color); border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; font-weight:bold; font-size: 0.8rem;">Histórico</button>
                            <div style="display:flex; gap:0.3rem; align-items:center;">
                                <label style="font-size:0.75rem; color:var(--text-secondary); margin-left:0.5rem;">Día:</label>
                                <input type="date" id="statDateFilter" style="background:transparent; color:#fff; border:1px solid var(--surface-border); border-radius:6px; padding:0.2rem; font-family:'Outfit',sans-serif; font-size:0.8rem; color-scheme: dark;">
                            </div>
                            <div style="display:flex; gap:0.3rem; align-items:center;">
                                <label style="font-size:0.75rem; color:var(--text-secondary); margin-left:0.5rem;">Mes:</label>
                                <input type="month" id="statMonthFilter" style="background:transparent; color:#fff; border:1px solid var(--surface-border); border-radius:6px; padding:0.2rem; font-family:'Outfit',sans-serif; font-size:0.8rem; color-scheme: dark;">
                            </div>
                            <div style="display:flex; gap:0.3rem; align-items:center;">
                                <label style="font-size:0.75rem; color:var(--text-secondary); margin-left:0.5rem;">Año:</label>
                                <input type="number" id="statYearFilter" placeholder="2024" style="background:transparent; color:#fff; border:1px solid var(--surface-border); border-radius:6px; padding:0.2rem; font-family:'Outfit',sans-serif; font-size:0.8rem; width: 60px;">
                            </div>
                        </div>"""
html = html.replace(stats_filters_old, stats_filters_new)

# 4. Order management filters
orders_toolbar_old = """<select id="orderStatusFilter" style="padding:.5rem 1rem;background:var(--surface-color);border:1px solid var(--surface-border);border-radius:8px;color:#fff;font-family:'Outfit',sans-serif;font-size:.85rem">
                            <option value="all">Todos los estados</option>
                            <option value="initiated">⚪ Iniciados</option>
                            <option value="pending">🟡 Pendientes</option>
                            <option value="paid">🟢 Pagados</option>
                            <option value="shipped">🔵 Enviados</option>
                            <option value="delivered">✅ Entregados</option>
                            <option value="cancelled">🔴 Cancelados</option>
                        </select>"""
orders_toolbar_new = orders_toolbar_old + """
                        <input type="date" id="orderDateFilter" title="Filtrar por fecha" style="padding:.5rem;background:var(--surface-color);border:1px solid var(--surface-border);border-radius:8px;color:#fff;font-family:'Outfit',sans-serif;font-size:.85rem; color-scheme: dark;">
                        <input type="text" id="orderLocationFilter" placeholder="📍 Provincia / Ciudad" style="padding:.5rem 1rem;background:var(--surface-color);border:1px solid var(--surface-border);border-radius:8px;color:#fff;font-family:'Outfit',sans-serif;font-size:.85rem; max-width: 150px;">
                        <input type="text" id="orderClientFilter" placeholder="👤 Nombre Cliente" style="padding:.5rem 1rem;background:var(--surface-color);border:1px solid var(--surface-border);border-radius:8px;color:#fff;font-family:'Outfit',sans-serif;font-size:.85rem; max-width: 150px;">
"""
html = html.replace(orders_toolbar_old, orders_toolbar_new)

with open("admin.html", "w", encoding="utf-8") as f:
    f.write(html)
print("admin.html updated successfully")

# ------------- ADMIN.JS -------------
with open("admin.js", "r", encoding="utf-8") as f:
    js = f.read()

# 1. Remove Clean Duplicates Button logic
dupes_regex = re.search(r'(// Remove duplicates logic.*?)(?=\n// Global preview renderer)', js, re.DOTALL)
if dupes_regex:
    js = js.replace(dupes_regex.group(1), "")

# 2. Update loadStats to support filters
load_stats_old = re.search(r'(async function loadStats\(\) \{.*?)document\.getElementById\(\'refreshStatsBtn\'\)', js, re.DOTALL)
if load_stats_old:
    load_stats_new = """async function loadStats(period = 'all') {
    try {
        const snapshot = await db.collection('orders').get();
        let totalRevenue = 0, paidCount = 0, totalCount = 0;
        const productCount = {};
        
        const dateFilter = document.getElementById('statDateFilter').value;
        const monthFilter = document.getElementById('statMonthFilter').value;
        const yearFilter = document.getElementById('statYearFilter').value;

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        snapshot.forEach(doc => {
            const o = doc.data();
            const orderDate = o.createdAt ? (o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt)) : null;
            
            let include = true;
            if (orderDate) {
                // Check custom filters first
                if (dateFilter) {
                    const [y, m, d] = dateFilter.split('-');
                    if (orderDate.getFullYear() != y || orderDate.getMonth() + 1 != m || orderDate.getDate() != d) include = false;
                } else if (monthFilter) {
                    const [y, m] = monthFilter.split('-');
                    if (orderDate.getFullYear() != y || orderDate.getMonth() + 1 != m) include = false;
                } else if (yearFilter) {
                    if (orderDate.getFullYear() != yearFilter) include = false;
                } else {
                    // Check predefined period filters
                    if (period === 'year' && orderDate < startOfYear) include = false;
                    if (period === 'month' && orderDate < startOfMonth) include = false;
                    if (period === 'week' && orderDate < startOfWeek) include = false;
                }
            } else {
                if (dateFilter || monthFilter || yearFilter || period !== 'all') include = false;
            }

            if (include) {
                totalCount++;
                if (o.status === 'paid') {
                    paidCount++;
                    totalRevenue += o.total || 0;
                    (o.cart || []).forEach(item => {
                        const key = item.name || item.id;
                        productCount[key] = (productCount[key] || 0) + item.qty;
                    });
                }
            }
        });

        document.getElementById('statTotalRevenue').textContent = '$' + totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 });
        document.getElementById('statTotalOrders').textContent = totalCount;
        document.getElementById('statPaidOrders').textContent = paidCount;

        const sorted = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const list = document.getElementById('topProductsList');
        list.innerHTML = sorted.length === 0
            ? '<div style="color:var(--text-secondary);font-size:.85rem;padding:.5rem 0">Sin ventas aún</div>'
            : sorted.map(([name, qty], i) => `
                <div style="display:flex;align-items:center;gap:.8rem;padding:.3rem 0">
                    <span style="color:var(--text-secondary);font-size:.8rem;min-width:20px;font-weight:700">${i + 1}.</span>
                    <div style="flex:1;height:6px;background:rgba(0,240,255,.1);border-radius:3px;overflow:hidden">
                        <div style="height:100%;width:${(qty / sorted[0][1]) * 100}%;background:var(--gradient-glow);border-radius:3px;transition:width .5s"></div>
                    </div>
                    <span style="font-size:.85rem;min-width:0;flex:2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</span>
                    <span style="color:var(--accent-color);font-weight:700;font-size:.85rem;min-width:30px;text-align:right">${qty}</span>
                </div>
            `).join('');
    } catch (e) {
        console.error('Error loading stats:', e);
    }
}

"""
    js = js.replace(load_stats_old.group(1), load_stats_new)

# 3. Add event listeners for custom date filters
event_listeners_old = """document.getElementById('refreshStatsBtn').addEventListener('click', loadStats);"""
event_listeners_new = """document.getElementById('refreshStatsBtn').addEventListener('click', () => loadStats(document.querySelector('.stat-filter.active')?.dataset.filter || 'all'));
document.getElementById('statDateFilter')?.addEventListener('change', () => {
    document.getElementById('statMonthFilter').value = '';
    document.getElementById('statYearFilter').value = '';
    document.querySelectorAll('.stat-filter').forEach(btn => btn.classList.remove('active'));
    loadStats();
});
document.getElementById('statMonthFilter')?.addEventListener('change', () => {
    document.getElementById('statDateFilter').value = '';
    document.getElementById('statYearFilter').value = '';
    document.querySelectorAll('.stat-filter').forEach(btn => btn.classList.remove('active'));
    loadStats();
});
document.getElementById('statYearFilter')?.addEventListener('input', () => {
    document.getElementById('statDateFilter').value = '';
    document.getElementById('statMonthFilter').value = '';
    document.querySelectorAll('.stat-filter').forEach(btn => btn.classList.remove('active'));
    loadStats();
});
"""
js = js.replace(event_listeners_old, event_listeners_new)

# 4. Update loadOrders to support Location, Client, and Date filtering in JS
load_orders_old = re.search(r'(async function loadOrders\(filter = \'all\'\) \{.*?)// ─── GOOGLE IMAGES SEARCH', js, re.DOTALL)
if load_orders_old:
    load_orders_new = """async function loadOrders() {
    const filter = document.getElementById('orderStatusFilter').value || 'all';
    const dateFilter = document.getElementById('orderDateFilter')?.value || '';
    const locationFilter = (document.getElementById('orderLocationFilter')?.value || '').toLowerCase();
    const clientFilter = (document.getElementById('orderClientFilter')?.value || '').toLowerCase();

    const tbody = document.getElementById('ordersList');
    if (!tbody) return;
    try {
        let query = db.collection('orders').orderBy('createdAt', 'desc');
        if (filter !== 'all') query = query.where('status', '==', filter);
        const snapshot = await query.get();
        tbody.innerHTML = '';
        
        let matchCount = 0;
        
        snapshot.forEach(doc => {
            const o = doc.data();
            const id = doc.id;
            const dateObj = o.createdAt ? (o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt)) : null;
            const dateStr = dateObj ? dateObj.toLocaleDateString('es-AR') : '-';
            
            // Client Filter
            const cName = (o.customer?.name || '').toLowerCase();
            if (clientFilter && !cName.includes(clientFilter)) return;
            
            // Location Filter
            const cLoc = `${o.customer?.province || ''} ${o.customer?.city || ''} ${o.shippingProvince || ''}`.toLowerCase();
            if (locationFilter && !cLoc.includes(locationFilter)) return;
            
            // Date Filter
            if (dateFilter && dateObj) {
                const [y, m, d] = dateFilter.split('-');
                if (dateObj.getFullYear() != y || dateObj.getMonth() + 1 != m || dateObj.getDate() != d) return;
            }

            matchCount++;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${o.customer?.name || '—'}</strong></td>
                <td>$${fmt(o.total || 0)}${o.shippingCost ? '<br><small style="color:var(--text-secondary)">+ envío $' + fmt(o.shippingCost) + '</small>' : ''}</td>
                <td>${(o.cart || []).reduce((s, i) => s + i.qty, 0)} items</td>
                <td>${o.customer?.province || o.shippingProvince || '—'}</td>
                <td style="font-size:.85rem;white-space:nowrap">${dateStr}</td>
                <td><span style="display:inline-block;padding:.2rem .6rem;border-radius:20px;font-size:.8rem;background:${o.status === 'paid' ? 'rgba(46,213,115,.15)' : o.status === 'shipped' ? 'rgba(0,240,255,.15)' : o.status === 'delivered' ? 'rgba(46,213,115,.1)' : o.status === 'cancelled' ? 'rgba(255,71,87,.15)' : o.status === 'initiated' ? 'rgba(255,255,255,.05)' : 'rgba(255,193,7,.15)'};color:${o.status === 'paid' ? '#2ed573' : o.status === 'shipped' ? '#00f0ff' : o.status === 'delivered' ? '#2ed573' : o.status === 'cancelled' ? '#ff4757' : o.status === 'initiated' ? '#888' : '#ffc107'}">${statusLabels[o.status] || o.status}</span></td>
                <td>
                    <button class="action-btn view-order-btn" data-id="${id}" title="Ver detalle">👁️</button>
                    ${(statusFlow[o.status] || []).map(next => `<button class="action-btn status-btn" data-id="${id}" data-next="${next}" title="Marcar como ${statusLabels[next]}">${next === 'cancelled' ? '❌' : next === 'paid' ? '💳' : next === 'shipped' ? '📦' : '✅'}</button>`).join('')}
                </td>`;
            tbody.appendChild(tr);
        });

        if (matchCount === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-secondary)">No se encontraron pedidos con estos filtros.</td></tr>';
        }

        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', () => viewOrder(btn.dataset.id));
        });
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const next = btn.dataset.next;
                if (!confirm(`¿Cambiar estado a "${statusLabels[next]}"?`)) return;
                try {
                    await db.collection('orders').doc(id).update({ status: next, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
                    loadOrders();
                } catch (e) { 
                    console.error('Error updating order:', e); 
                    showFirebaseErrorAlert('actualizar el pedido', e);
                }
            });
        });
    } catch (e) {
        console.error('Error loading orders:', e);
    }
}

async function viewOrder(id) {
    try {
        const doc = await db.collection('orders').doc(id).get();
        if (!doc.exists) return;
        const o = doc.data();
        const date = o.createdAt ? (o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt)).toLocaleString('es-AR') : '-';
        const content = document.getElementById('orderDetailContent');
        content.innerHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;background:var(--surface-color);padding:1rem;border-radius:10px">
                <div><strong>Cliente:</strong> ${o.customer?.name || '—'}</div>
                <div><strong>Email:</strong> ${o.customer?.email || '—'}</div>
                <div><strong>Teléfono:</strong> ${o.customer?.phone || '—'}</div>
                <div><strong>DNI:</strong> ${o.customer?.dni || '—'}</div>
                <div><strong>Dirección:</strong> ${o.customer?.address || '—'}, ${o.customer?.city || '—'}, ${o.customer?.province || o.shippingProvince || '—'}</div>
                <div><strong>CP:</strong> ${o.customer?.zip || '—'}</div>
                <div><strong>Fecha:</strong> ${date}</div>
                <div><strong>Estado:</strong> ${statusLabels[o.status] || o.status}</div>
                ${o.shippingCost ? `<div><strong>Envío:</strong> $${fmt(o.shippingCost)}</div>` : ''}
                ${o.paymentId ? `<div><strong>MP ID:</strong> ${o.paymentId}</div>` : ''}
            </div>
            <table class="admin-table" style="font-size:.85rem">
                <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
                <tbody>${(o.cart || []).map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>$${fmt(i.price || 0)}</td><td>$${fmt((i.price || 0) * i.qty)}</td></tr>`).join('')}</tbody>
            </table>
            <div style="text-align:right;margin-top:1rem;font-size:1.2rem;font-weight:800;color:var(--accent-color)">Total: $${fmt(o.total || 0)}</div>
        `;
        document.getElementById('orderModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (e) {
        console.error('Error viewing order:', e);
    }
}

document.getElementById('closeOrderModalBtn').addEventListener('click', () => {
    document.getElementById('orderModal').classList.remove('active');
    document.body.style.overflow = '';
});
document.getElementById('orderModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('orderModal')) {
        document.getElementById('orderModal').classList.remove('active');
        document.body.style.overflow = '';
    }
});

document.getElementById('orderStatusFilter').addEventListener('change', () => loadOrders());
document.getElementById('orderDateFilter')?.addEventListener('change', () => loadOrders());
document.getElementById('orderLocationFilter')?.addEventListener('input', () => loadOrders());
document.getElementById('orderClientFilter')?.addEventListener('input', () => loadOrders());

document.getElementById('reloadOrdersBtn').addEventListener('click', () => {
    loadOrders();
});
loadOrders();

// ─── GOOGLE IMAGES SEARCH"""
    js = js.replace(load_orders_old.group(1), load_orders_new)

# 5. Update Reviews and Settings logic
reviews_old = re.search(r'(// ─── ADMIN REVIEWS TAB ───────────────────────────────────.*?)document\.getElementById\(\'adminRecalcAllBtn\'\)', js, re.DOTALL)
if reviews_old:
    reviews_new = """// ─── ADMIN REVIEWS TAB ───────────────────────────────────
async function loadReviewsProductSelect() {
    const select = document.getElementById('adminReviewsProductSelect');
    if (!select) return;
    const selectedVal = select.value;
    select.innerHTML = '<option value="">Cargando productos...</option>';
    try {
        const snap = await db.collection("products").orderBy("name").get();
        select.innerHTML = '<option value="">Todos los productos</option>';
        snap.forEach(doc => {
            const p = doc.data();
            const opt = document.createElement('option');
            opt.value = doc.id;
            opt.textContent = `${p.name} (${p.reviewCount || 0}⭐)`;
            select.appendChild(opt);
        });
        if (selectedVal) select.value = selectedVal;
    } catch(e) {
        console.error(e);
        select.innerHTML = '<option value="">Error al cargar productos</option>';
    }
}

async function renderReviewsTab(prodId = 'all') {
    const container = document.getElementById('adminReviewsTabList');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:.85rem;padding:2rem">Cargando reseñas...</div>';

    try {
        let allReviews = [];
        let prodName = 'Todos los Productos';
        
        if (prodId === 'all' || !prodId) {
            const prods = await db.collection("products").get();
            const promises = [];
            prods.forEach(doc => {
                const p = doc.data();
                const pId = doc.id;
                promises.push(
                    db.collection("products").doc(pId).collection("reviews").get().then(snap => {
                        snap.forEach(rDoc => {
                            allReviews.push({ id: rDoc.id, prodId: pId, prodName: p.name, ...rDoc.data() });
                        });
                    })
                );
            });
            await Promise.all(promises);
        } else {
            const prodDoc = await db.collection("products").doc(prodId).get();
            prodName = prodDoc.exists ? prodDoc.data().name : 'Producto';
            const snap = await db.collection("products").doc(prodId).collection("reviews").get();
            snap.forEach(doc => {
                allReviews.push({ id: doc.id, prodId: prodId, prodName: prodName, ...doc.data() });
            });
        }
        
        allReviews.sort((a, b) => {
            const tA = a.date?.toDate ? a.date.toDate().getTime() : 0;
            const tB = b.date?.toDate ? b.date.toDate().getTime() : 0;
            return tB - tA; // Newest first
        });

        container.innerHTML = '';
        if (allReviews.length === 0) {
            container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem;font-size:.9rem">Aún no hay reseñas.</p>';
            return;
        }

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:.5rem 0';
        header.innerHTML = `
            <span style="color:var(--text-primary);font-weight:600;font-size:.95rem">${prodName} — <span style="color:var(--text-secondary);font-weight:400">${allReviews.length} reseña(s)</span></span>
            ${prodId !== 'all' && prodId ? `<button class="recalc-rating-btn magnetic-btn" data-prod="${prodId}" style="background:transparent;border:1px solid var(--accent-color);color:var(--accent-color);padding:.4rem .8rem;border-radius:8px;font-size:.8rem;cursor:pointer">🔄 Recalcular rating</button>` : ''}
        `;
        container.appendChild(header);

        allReviews.forEach(r => {
            const dateStr = r.date?.toDate?.() ? r.date.toDate().toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
            const card = document.createElement('div');
            card.style.cssText = 'background:rgba(255,255,255,.02);border:1px solid var(--surface-border);border-radius:10px;padding:.8rem 1rem';
            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                    <div style="flex:1">
                        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem">
                            <strong style="color:var(--text-primary);font-size:.9rem">${r.userName || 'Anónimo'}</strong>
                            <span style="color:var(--text-secondary);font-size:.75rem">${dateStr}</span>
                            <span style="font-size:.75rem;color:var(--text-secondary)">(En: ${r.prodName})</span>
                        </div>
                        <div style="margin-bottom:.3rem">${renderStarsHtml(r.rating || 0)}</div>
                        ${r.comment ? `<p style="color:var(--text-secondary);font-size:.85rem;line-height:1.4;margin:0">${r.comment}</p>` : ''}
                    </div>
                    <button class="del-review-tab-btn" data-id="${r.id}" data-prod="${r.prodId}" style="background:none;border:none;color:#ff4757;cursor:pointer;font-size:1.2rem;padding:.2rem .4rem;flex-shrink:0" title="Eliminar reseña">&times;</button>
                </div>
            `;
            container.appendChild(card);
        });

        // Delete handlers
        container.querySelectorAll('.del-review-tab-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('¿Eliminar esta reseña definitivamente?')) return;
                try {
                    await db.collection("products").doc(btn.dataset.prod).collection("reviews").doc(btn.dataset.id).delete();
                    // Recalculate product rating after deletion
                    const snap2 = await db.collection("products").doc(btn.dataset.prod).collection("reviews").get();
                    let total = 0, count = 0;
                    snap2.forEach(d => { total += d.data().rating || 0; count++; });
                    const avg = count > 0 ? total / count : 0;
                    try { await db.collection("products").doc(btn.dataset.prod).update({ rating: avg, reviewCount: count }); } catch(e) {}
                    renderReviewsTab(prodId);
                    showToast('Reseña eliminada', 'success');
                } catch(e) {
                    console.error(e);
                    showToast('Error al eliminar reseña', 'error');
                }
            });
        });

        // Recalculate handler
        const recalcBtn = container.querySelector('.recalc-rating-btn');
        if (recalcBtn) {
            recalcBtn.addEventListener('click', async () => {
                try {
                    const snap2 = await db.collection("products").doc(prodId).collection("reviews").get();
                    let total = 0, count = 0;
                    snap2.forEach(d => { total += d.data().rating || 0; count++; });
                    const avg = count > 0 ? total / count : 0;
                    await db.collection("products").doc(prodId).update({ rating: avg, reviewCount: count });
                    showToast(`Rating recalculado: ${avg.toFixed(1)}⭐ (${count} reseñas)`, 'success');
                } catch(e) {
                    console.error(e);
                    showToast('Error al recalcular', 'error');
                }
            });
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p style="text-align:center;color:#ff4757;padding:2rem">Error al cargar reseñas</p>';
    }
}

document.getElementById('adminReviewsProductSelect')?.addEventListener('change', function() {
    renderReviewsTab(this.value || 'all');
});

document.getElementById('adminReviewsRefreshBtn')?.addEventListener('click', () => {
    const select = document.getElementById('adminReviewsProductSelect');
    const prodId = select?.value || 'all';
    loadReviewsProductSelect();
    renderReviewsTab(prodId);
});

// Added Initial load for Reviews tab
document.querySelector('.tab-btn[data-tab="tab-reviews"]')?.addEventListener('click', () => {
    renderReviewsTab(document.getElementById('adminReviewsProductSelect')?.value || 'all');
});

document.getElementById('adminRecalcAllBtn')"""
    js = js.replace(reviews_old.group(1), reviews_new)

settings_logic = """
// ─── ADMIN SETTINGS TAB ───────────────────────────────────
async function loadSettings() {
    try {
        const doc = await db.collection('settings').doc('transfer').get();
        if (doc.exists) {
            const data = doc.data();
            if (document.getElementById('adminTransferDiscount')) document.getElementById('adminTransferDiscount').value = data.discount || '';
            if (document.getElementById('adminTransferCbu')) document.getElementById('adminTransferCbu').value = data.cbu || '';
            if (document.getElementById('adminTransferAlias')) document.getElementById('adminTransferAlias').value = data.alias || '';
            if (document.getElementById('adminTransferName')) document.getElementById('adminTransferName').value = data.name || '';
        }
    } catch (e) {
        console.error("Error al cargar configuración", e);
    }
}

document.getElementById('saveSettingsBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('saveSettingsBtn');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    try {
        const discount = parseFloat(document.getElementById('adminTransferDiscount').value) || 0;
        const cbu = document.getElementById('adminTransferCbu').value.trim();
        const alias = document.getElementById('adminTransferAlias').value.trim();
        const name = document.getElementById('adminTransferName').value.trim();
        
        await db.collection('settings').doc('transfer').set({
            discount, cbu, alias, name, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        showToast('Configuración guardada exitosamente', 'success');
    } catch (e) {
        console.error("Error al guardar configuración", e);
        showToast('Error al guardar configuración', 'error');
    }
    btn.disabled = false;
    btn.textContent = 'Guardar Configuración';
});

document.querySelector('.tab-btn[data-tab="tab-settings"]')?.addEventListener('click', loadSettings);
"""
# append to the end only if not already there
if "ADMIN SETTINGS TAB" not in js:
    js += "\n" + settings_logic

with open("admin.js", "w", encoding="utf-8") as f:
    f.write(js)
print("All fixes applied successfully without corrupting encoding.")
