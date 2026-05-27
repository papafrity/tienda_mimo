// Simple Auth
const PIN = "1234"; // Default PIN
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const adminPin = document.getElementById('adminPin');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

if (localStorage.getItem('mimo_admin_auth') === 'true') {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadProducts();
}

loginBtn.addEventListener('click', () => {
    if (adminPin.value === PIN) {
        localStorage.setItem('mimo_admin_auth', 'true');
        loginScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
        loadProducts();
    } else {
        loginError.textContent = 'PIN Incorrecto';
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('mimo_admin_auth');
    location.reload();
});

// Products Logic
let adminProducts = [];
let currentUploadedImages = [];
const tbody = document.getElementById('adminProductList');

async function loadProducts() {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">Cargando productos...</td></tr>';
    try {
        const querySnapshot = await db.collection("products").get();
        adminProducts = [];
        querySnapshot.forEach((doc) => {
            adminProducts.push({ id: doc.id, ...doc.data() });
        });
        renderAdminProducts();
    } catch(e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #ff4757;">Error conectando a Firebase: ${e.message}</td></tr>`;
    }
}

function renderAdminProducts() {
    tbody.innerHTML = '';
    const migrateBtn = document.getElementById('migrateBtn');
    if (adminProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem;">No hay productos. Usa "Cargar Catálogo Inicial" para iniciar.</td></tr>';
        if (migrateBtn) migrateBtn.style.display = '';
        return;
    }
    if (migrateBtn) migrateBtn.style.display = 'none';
    
    adminProducts.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.image}" alt="img"></td>
            <td><strong>${p.name}</strong></td>
            <td style="text-transform: capitalize;">${p.category}</td>
            <td>$${parseFloat(p.price).toFixed(2)}</td>
            <td>${p.offerPrice ? '$' + parseFloat(p.offerPrice).toFixed(2) : '-'}</td>
            <td style="text-align:center">${p.stock !== undefined ? p.stock : '-'}</td>
            <td style="text-align:center">${p.peso ? p.peso + 'kg' : '-'}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${p.id}" title="Editar">✏️</button>
                <button class="action-btn del del-btn" data-id="${p.id}" title="Borrar">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openModal(e.target.closest('.edit-btn').dataset.id));
    });
    document.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteProduct(e.target.closest('.del-btn').dataset.id));
    });
}

// Modal Logic
const modal = document.getElementById('adminModal');
const form = document.getElementById('productForm');

document.getElementById('addProductBtn').addEventListener('click', () => openModal());
document.getElementById('reloadBtn').addEventListener('click', loadProducts);
document.getElementById('cancelBtn').addEventListener('click', () => modal.classList.remove('active'));

function openModal(id = null) {
    form.reset();
    document.getElementById('prodId').value = '';
    document.getElementById('modalTitle').textContent = 'Agregar Producto';
    
    currentUploadedImages = [];
    const previewContainer = document.getElementById('imgPreviewContainer');
    Array.from(previewContainer.querySelectorAll('img')).forEach(img => img.remove());
    const statusText = previewContainer.querySelector('span');
    if (statusText) statusText.textContent = '';
    previewContainer.style.display = 'none';
    
    if (id) {
        document.getElementById('modalTitle').textContent = 'Editar Producto';
        const p = adminProducts.find(x => x.id === id);
        if (p) {
            document.getElementById('prodId').value = p.id;
            document.getElementById('prodName').value = p.name;
            document.getElementById('prodCategory').value = p.category;
            document.getElementById('prodPrice').value = p.price;
            document.getElementById('prodOffer').value = p.offerPrice || '';
            document.getElementById('prodBadge').value = p.badge || '';
            document.getElementById('prodDesc').value = p.description || '';
            document.getElementById('prodImg').value = p.image || '';
            document.getElementById('prodFeatured').checked = p.isFeatured || false;
            document.getElementById('prodStock').value = p.stock ?? 0;
            document.getElementById('prodWeight').value = p.peso ?? 0.5;
            
            let imgsToLoad = [];
            if (p.fullImages) {
                try { imgsToLoad = JSON.parse(p.fullImages); } catch(e) {}
            }
            if (imgsToLoad.length === 0 && p.image) {
                imgsToLoad = [p.image];
            }
            
            if (imgsToLoad.length > 0) {
                currentUploadedImages = imgsToLoad;
                imgsToLoad.forEach(src => {
                    const imgEl = document.createElement('img');
                    imgEl.src = src;
                    imgEl.style.cssText = "width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid var(--surface-border);";
                    previewContainer.appendChild(imgEl);
                });
                if (statusText) statusText.textContent = `${imgsToLoad.length} imagen(es)`;
                previewContainer.style.display = 'flex';
            }
        }
    }
    modal.classList.add('active');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    
    let finalImages = currentUploadedImages;
    let mainImgUrl = document.getElementById('prodImg').value;
    
    // Si metió un link manual o modificó el input URL
    if (finalImages.length === 0) {
        finalImages = [mainImgUrl];
    } else if (mainImgUrl !== finalImages[0]) {
        // Agrega el modificado manual al frente
        finalImages.unshift(mainImgUrl);
    }
    
    const productData = {
        name: document.getElementById('prodName').value,
        category: document.getElementById('prodCategory').value,
        price: parseFloat(document.getElementById('prodPrice').value),
        offerPrice: document.getElementById('prodOffer').value ? parseFloat(document.getElementById('prodOffer').value) : null,
        badge: document.getElementById('prodBadge').value,
        description: document.getElementById('prodDesc').value,
        image: mainImgUrl,
        fullImages: JSON.stringify(finalImages),
        isFeatured: document.getElementById('prodFeatured').checked,
        stock: parseInt(document.getElementById('prodStock').value) || 0,
        peso: parseFloat(document.getElementById('prodWeight').value) || 0.5
    };

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.textContent = 'Guardando...';
    saveBtn.disabled = true;

    try {
        if (id) {
            await db.collection("products").doc(id).update(productData);
        } else {
            await db.collection("products").add(productData);
        }
        modal.classList.remove('active');
        await loadProducts();
    } catch (error) {
        console.error("Error guardando:", error);
        alert("Hubo un error al guardar.");
    }

    saveBtn.textContent = 'Guardar Producto';
    saveBtn.disabled = false;
});

async function deleteProduct(id) {
    if (confirm("¿Estás seguro de que quieres borrar este producto?")) {
        await db.collection("products").doc(id).delete();
        loadProducts();
    }
}

// Migrate Initial Data
document.getElementById('migrateBtn').addEventListener('click', async () => {
    if(!confirm("Esto cargará los 12 productos iniciales en Firebase. Solo debes hacerlo 1 vez. ¿Continuar?")) return;
    const btn = document.getElementById('migrateBtn');
    btn.textContent = 'Cargando...';
    btn.disabled = true;
    
    const initialProducts = [
        { name: "Sony WH-1000XM5", category: "auriculares", price: 349.00, oldPrice: 349.00, offerPrice: 244.30, badge: "-30%", isFeatured: true, description: "Cancelación de ruido líder en la industria. 30 horas de batería. Audio Hi-Res.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop", fullImages: '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"]' },
        { name: "MimoPods Pro Max", category: "auriculares", price: 199.00, description: "Cancelación activa de ruido. Audio espacial. Chip M2. Resistencia al agua IPX4.", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop", fullImages: '["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop"]' },
        { name: "JBL Charge 5", category: "parlantes", price: 179.00, offerPrice: 179.00, badge: "Más Vendido", isFeatured: true, description: "Sonido potente JBL Original Pro. Resistencia al agua IP67. 20 horas de batería.", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop", fullImages: '["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop"]' },
        { name: "Marshall Stanmore II", category: "parlantes", price: 349.00, description: "Diseño clásico Marshall. Bluetooth 5.0. Multi-host. Sonido amplio y dinámico.", image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=300&fit=crop", fullImages: '["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=600&fit=crop"]' },
        { name: "Amazon Fire TV Stick 4K", category: "tvbox", price: 49.99, oldPrice: 49.99, offerPrice: 42.49, badge: "-15%", isFeatured: true, description: "Streaming en 4K Ultra HD. Wi-Fi 6. Control por voz con Alexa.", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop", fullImages: '["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop"]' },
        { name: "Google Chromecast 4K", category: "tvbox", price: 59.99, description: "Google TV integrado. Resolución 4K HDR. Control remoto con Google Assistant.", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop", fullImages: '["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop"]' },
        { name: "Samsung 55\" QLED 4K", category: "televisores", price: 699.00, oldPrice: 699.00, offerPrice: 559.20, badge: "-20%", isFeatured: true, description: "Pantalla QLED 55 pulgadas. Resolución 4K. Quantum Processor. Smart Hub.", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop", fullImages: '["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop"]' },
        { name: "LG OLED 65\" C3", category: "televisores", price: 1299.00, description: "OLED evo 65 pulgadas. Negro perfecto. Dolby Vision IQ y Atmos. Procesador α9 Gen6.", image: "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=400&h=300&fit=crop", fullImages: '["https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&h=600&fit=crop"]' },
        { name: "Cocina Inducción Premium", category: "cocinas", price: 899.00, offerPrice: 899.00, badge: "Más Vendido", isFeatured: true, description: "4 zonas de inducción. Horno eléctrico 70L. Panel táctil digital.", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop", fullImages: '["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop"]' },
        { name: "Cocina Mixta 6 Hornallas", category: "cocinas", price: 649.00, description: "6 hornallas (4 gas + 2 eléctricas). Horno con grill. Encendido automático.", image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop", fullImages: '["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&h=600&fit=crop"]' },
        { name: "Heladera Side by Side Inox", category: "heladeras", price: 1199.00, description: "Side by Side. 580L de capacidad. Dispensador de agua y hielo. No Frost.", image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop", fullImages: '["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&h=600&fit=crop"]' },
        { name: "Heladera NoFrost 400L", category: "heladeras", price: 799.00, description: "400L de capacidad. Sistema No Frost. Cajón de frutas y verduras.", image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop", fullImages: '["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&h=600&fit=crop"]' }
    ];

    try {
        for (const p of initialProducts) {
            await db.collection("products").add(p);
        }
        btn.textContent = 'Cargado ✓';
        setTimeout(() => btn.style.display = 'none', 2000);
        loadProducts();
    } catch(e) {
        console.error("Error migrando productos", e);
        alert("Error al cargar productos iniciales.");
        btn.textContent = 'Reintentar';
        btn.disabled = false;
    }
});

// Remove duplicates logic
document.getElementById('migrateBtn').insertAdjacentHTML('afterend', `
    <button id="cleanDuplicatesBtn" class="magnetic-btn" style="background: rgba(255,50,50,0.2); color: #ff4757; border: 1px solid #ff4757; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; margin-left: 10px;">
        Limpiar Duplicados
    </button>
`);
document.getElementById('cleanDuplicatesBtn').addEventListener('click', async () => {
    if (!confirm("¿Seguro que quieres eliminar los productos duplicados (dejando solo uno de cada uno)?")) return;
    const btn = document.getElementById('cleanDuplicatesBtn');
    btn.disabled = true;
    btn.textContent = "Limpiando...";
    
    try {
        const snapshot = await db.collection("products").get({ source: 'server' });
        const seenNames = new Set();
        const batch = db.batch();
        let deletedCount = 0;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            if (seenNames.has(data.name)) {
                batch.delete(doc.ref);
                deletedCount++;
            } else {
                seenNames.add(data.name);
            }
        });
        
        if (deletedCount > 0) {
            await batch.commit();
            alert(`Se eliminaron ${deletedCount} productos duplicados.`);
        } else {
            alert("No se encontraron productos duplicados.");
        }
        loadProducts();
    } catch (e) {
        console.error(e);
        alert("Error limpiando duplicados.");
    }
    btn.textContent = "Limpiar Duplicados";
    btn.disabled = false;
});

// Image Upload and Preview Handler
document.getElementById('prodImgFile').addEventListener('change', async function(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const previewContainer = document.getElementById('imgPreviewContainer');
    // Clear old previews except the label/span
    Array.from(previewContainer.querySelectorAll('img')).forEach(img => img.remove());
    
    const statusText = previewContainer.querySelector('span') || document.createElement('span');
    if(!statusText.parentNode) previewContainer.appendChild(statusText);
    statusText.textContent = 'Cargando imágenes...';
    statusText.style.color = 'var(--text-secondary)';
    previewContainer.style.display = 'flex';

    currentUploadedImages = [];

    for(let file of files) {
        const base64 = await compressImageFile(file);
        currentUploadedImages.push(base64);
        
        const imgEl = document.createElement('img');
        imgEl.src = base64;
        imgEl.style.cssText = "width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid var(--surface-border);";
        previewContainer.appendChild(imgEl);
    }
    
    statusText.textContent = `${files.length} imagen(es) listas`;
    statusText.style.color = 'var(--accent-color)';
    document.getElementById('prodImg').value = currentUploadedImages[0]; // Set primary to the first
});

function compressImageFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Update preview live if typing a URL
document.getElementById('prodImg').addEventListener('input', function(e) {
    const url = e.target.value.trim();
    const previewContainer = document.getElementById('imgPreviewContainer');
    const previewImg = document.getElementById('imgPreview');
    const statusText = previewContainer.querySelector('span');

    if (url) {
        previewImg.src = url;
        statusText.textContent = '✓ Imagen cargada';
        statusText.style.color = '#2ed573';
        previewContainer.style.display = 'flex';
    } else {
        previewContainer.style.display = 'none';
    }
});

// ─── COST CALCULATOR LOGIC ─────────────────────────────────
const toggleCalcBtn = document.getElementById('toggleCalcBtn');
const calculatorBody = document.getElementById('calculatorBody');
const calcCurrency = document.getElementById('calcCurrency');
const calcCost = document.getElementById('calcCost');
const calcUsdRate = document.getElementById('calcUsdRate');
const fetchRateBtn = document.getElementById('fetchRateBtn');
const calcShipping = document.getElementById('calcShipping');
const calcProfit = document.getElementById('calcProfit');
const usdRateGroup = document.getElementById('usdRateGroup');

const resNetCost = document.getElementById('resNetCost');
const resMpFee = document.getElementById('resMpFee');
const resSellPrice = document.getElementById('resSellPrice');
const resNetProfit = document.getElementById('resNetProfit');
const rateSource = document.getElementById('rateSource');

if (toggleCalcBtn && calculatorBody) {
    // Expand/Collapse
    toggleCalcBtn.addEventListener('click', () => {
        toggleCalcBtn.classList.toggle('active');
        calculatorBody.classList.toggle('hidden');
    });

    // Toggle USD rate field based on currency selection
    calcCurrency.addEventListener('change', () => {
        if (calcCurrency.value === 'USD') {
            usdRateGroup.style.display = 'flex';
        } else {
            usdRateGroup.style.display = 'none';
        }
        calculateCosts();
    });

    // Event listeners for recalculation
    [calcCost, calcUsdRate, calcShipping, calcProfit].forEach(input => {
        input.addEventListener('input', calculateCosts);
    });

    // API button
    if (fetchRateBtn) {
        fetchRateBtn.addEventListener('click', fetchUsdRate);
    }

    async function fetchUsdRate() {
        if (fetchRateBtn) fetchRateBtn.textContent = '⏳';
        try {
            const res = await fetch('https://dolarapi.com/v1/dolares/blue');
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            if (data && data.venta) {
                calcUsdRate.value = Math.round(data.venta);
                if (rateSource) {
                    const date = new Date(data.fechaActualizacion);
                    rateSource.textContent = `Dólar Blue: $${data.venta} (Act: ${date.toLocaleTimeString()})`;
                    rateSource.style.color = '#2ed573';
                }
                calculateCosts();
            }
        } catch (e) {
            console.error('Error fetching exchange rate:', e);
            if (rateSource) {
                rateSource.textContent = 'Error al consultar. Ingresa manual.';
                rateSource.style.color = '#ff4757';
            }
        } finally {
            if (fetchRateBtn) fetchRateBtn.textContent = '🔄 API';
        }
    }

    function calculateCosts() {
        const cost = parseFloat(calcCost.value) || 0;
        const rate = parseFloat(calcUsdRate.value) || 1;
        const shipping = parseFloat(calcShipping.value) || 0;
        const margin = parseFloat(calcProfit.value) || 0;

        // Convert cost to ARS if USD is selected
        const costInArs = calcCurrency.value === 'USD' ? cost * rate : cost;
        const netCost = costInArs + shipping;

        // Calculate Sell Price: NetCost * (1 + Margin%) / (1 - MercadoPagoFee%)
        const mpFeeRate = 0.065;
        const sellPrice = netCost * (1 + margin / 100) / (1 - mpFeeRate);
        const mpFee = sellPrice * mpFeeRate;
        const netProfit = sellPrice - mpFee - netCost;

        // Update UI
        resNetCost.textContent = `$${netCost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS`;
        resMpFee.textContent = `$${mpFee.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS`;
        resSellPrice.textContent = `$${sellPrice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS`;
        resNetProfit.textContent = `$${netProfit.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS`;
    }

    // Initial load
    fetchUsdRate();
    calculateCosts();
}

// ─── SHIPPING RATES ──────────────────────────────────────────
const ratesBody = document.getElementById('shippingRatesBody');

async function loadShippingRates() {
    try {
        const doc = await db.collection('config').doc('shipping').get();
        const rates = doc.exists ? doc.data().rates || {} : {};
        ratesBody.innerHTML = '';
        Object.entries(rates).forEach(([prov, rate]) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><strong>${prov}</strong></td>
                <td>$${rate.base}</td>
                <td>$${rate.perKg}</td>
                <td><button class="action-btn del del-rate-btn" data-prov="${prov}" title="Eliminar">🗑️</button></td>`;
            ratesBody.appendChild(tr);
        });
        if (Object.keys(rates).length === 0) {
            ratesBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:1.5rem;color:var(--text-secondary)">No hay tarifas configuradas. Agregá una abajo.</td></tr>';
        }
        // Attach delete handlers
        document.querySelectorAll('.del-rate-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const prov = btn.dataset.prov;
                if (!confirm(`¿Eliminar tarifa para ${prov}?`)) return;
                const doc = await db.collection('config').doc('shipping').get();
                const rates = doc.exists ? doc.data().rates || {} : {};
                delete rates[prov];
                await db.collection('config').doc('shipping').set({ rates });
                loadShippingRates();
            });
        });
    } catch (e) {
        console.error('Error loading rates:', e);
    }
}

document.getElementById('addRateBtn').addEventListener('click', async () => {
    const prov = document.getElementById('newRateProvince').value.trim();
    const base = parseFloat(document.getElementById('newRateBase').value);
    const perKg = parseFloat(document.getElementById('newRatePerKg').value);
    if (!prov || isNaN(base) || isNaN(perKg)) { alert('Completá todos los campos.'); return; }
    try {
        const doc = await db.collection('config').doc('shipping').get();
        const rates = doc.exists ? doc.data().rates || {} : {};
        rates[prov] = { base, perKg };
        await db.collection('config').doc('shipping').set({ rates });
        document.getElementById('newRateProvince').value = '';
        document.getElementById('newRateBase').value = '';
        document.getElementById('newRatePerKg').value = '';
        loadShippingRates();
    } catch (e) {
        console.error('Error adding rate:', e);
    }
});

// Load rates on init
loadShippingRates();

// ─── STATISTICS ──────────────────────────────────────────────
async function loadStats() {
    try {
        const snapshot = await db.collection('orders').get();
        let totalRevenue = 0, paidCount = 0, totalCount = 0;
        const productCount = {};

        snapshot.forEach(doc => {
            const o = doc.data();
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

document.getElementById('refreshStatsBtn').addEventListener('click', loadStats);
loadStats();

// ─── ORDER MANAGEMENT ─────────────────────────────────────
const statusLabels = { pending:'🟡 Pendiente', paid:'🟢 Pagado', shipped:'🔵 Enviado', delivered:'✅ Entregado', cancelled:'🔴 Cancelado' };
const statusFlow = { pending:['paid','cancelled'], paid:['shipped','cancelled'], shipped:['delivered','cancelled'], delivered:[], cancelled:[] };

async function loadOrders(filter = 'all') {
    const tbody = document.getElementById('ordersList');
    if (!tbody) return;
    try {
        let query = db.collection('orders').orderBy('createdAt', 'desc');
        if (filter !== 'all') query = query.where('status', '==', filter);
        const snapshot = await query.get();
        tbody.innerHTML = '';
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-secondary)">No hay pedidos' + (filter !== 'all' ? ` con estado ${statusLabels[filter]}` : '') + '.</td></tr>';
            return;
        }
        snapshot.forEach(doc => {
            const o = doc.data();
            const id = doc.id;
            const date = o.createdAt ? (o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt)).toLocaleDateString('es-AR') : '-';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${o.customer?.name || '—'}</strong></td>
                <td>$${(o.total || 0).toFixed(2)}${o.shippingCost ? '<br><small style="color:var(--text-secondary)">+ envío $' + o.shippingCost.toFixed(2) + '</small>' : ''}</td>
                <td>${(o.cart || []).reduce((s, i) => s + i.qty, 0)} items</td>
                <td>${o.customer?.province || o.shippingProvince || '—'}</td>
                <td style="font-size:.85rem;white-space:nowrap">${date}</td>
                <td><span style="display:inline-block;padding:.2rem .6rem;border-radius:20px;font-size:.8rem;background:${o.status === 'paid' ? 'rgba(46,213,115,.15)' : o.status === 'shipped' ? 'rgba(0,240,255,.15)' : o.status === 'delivered' ? 'rgba(46,213,115,.1)' : o.status === 'cancelled' ? 'rgba(255,71,87,.15)' : 'rgba(255,193,7,.15)'};color:${o.status === 'paid' ? '#2ed573' : o.status === 'shipped' ? '#00f0ff' : o.status === 'delivered' ? '#2ed573' : o.status === 'cancelled' ? '#ff4757' : '#ffc107'}">${statusLabels[o.status] || o.status}</span></td>
                <td>
                    <button class="action-btn view-order-btn" data-id="${id}" title="Ver detalle">👁️</button>
                    ${(statusFlow[o.status] || []).map(next => `<button class="action-btn status-btn" data-id="${id}" data-next="${next}" title="Marcar como ${statusLabels[next]}">${next === 'cancelled' ? '❌' : next === 'paid' ? '💳' : next === 'shipped' ? '📦' : '✅'}</button>`).join('')}
                </td>`;
            tbody.appendChild(tr);
        });

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
                    loadOrders(document.getElementById('orderStatusFilter').value);
                } catch (e) { console.error('Error updating order:', e); }
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
                ${o.shippingCost ? `<div><strong>Envío:</strong> $${o.shippingCost.toFixed(2)}</div>` : ''}
                ${o.paymentId ? `<div><strong>MP ID:</strong> ${o.paymentId}</div>` : ''}
            </div>
            <table class="admin-table" style="font-size:.85rem">
                <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
                <tbody>${(o.cart || []).map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>$${(i.price || 0).toFixed(2)}</td><td>$${((i.price || 0) * i.qty).toFixed(2)}</td></tr>`).join('')}</tbody>
            </table>
            <div style="text-align:right;margin-top:1rem;font-size:1.2rem;font-weight:800;color:var(--accent-color)">Total: $${(o.total || 0).toFixed(2)}</div>
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

document.getElementById('orderStatusFilter').addEventListener('change', function() {
    loadOrders(this.value);
});
document.getElementById('reloadOrdersBtn').addEventListener('click', () => {
    loadOrders(document.getElementById('orderStatusFilter').value);
});
loadOrders();
