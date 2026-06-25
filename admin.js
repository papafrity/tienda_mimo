// ─── FIREBASE GOOGLE AUTH ─────────────────────────────────
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

// Tu UID de administrador autorizado. Se configura automáticamente en el primer login.
// Si necesitás cambiarlo, borrá el valor guardado en localStorage 'mimo_admin_uid'.
let ADMIN_UID = localStorage.getItem('mimo_admin_uid') || '';

function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadProducts();
}

function showLogin() {
    loginScreen.classList.remove('hidden');
    dashboard.classList.add('hidden');
}

// Escuchar cambios en el estado de autenticación
auth.onAuthStateChanged((user) => {
    if (user) {
        // Si no hay admin UID guardado, este es el primer login. Guardar el UID.
        if (!ADMIN_UID) {
            ADMIN_UID = user.uid;
            localStorage.setItem('mimo_admin_uid', user.uid);
            alert(
                '✅ ¡Primera configuración exitosa!\n\n' +
                'Tu UID de administrador es:\n' + user.uid + '\n\n' +
                'Copialo y pegalo en las Reglas de Firestore donde dice TU_UID_AQUI.\n' +
                'Este mensaje solo aparece una vez.'
            );
        }
        
        // Verificar que sea el admin autorizado
        if (user.uid === ADMIN_UID) {
            showDashboard();
        } else {
            loginError.textContent = '❌ Esta cuenta de Google no está autorizada como administrador.';
            auth.signOut();
        }
    } else {
        showLogin();
    }
});

// Botón de login con Google
loginBtn.addEventListener('click', async () => {
    loginError.textContent = '';
    loginBtn.disabled = true;
    loginBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 48 48" style="animation: spin 1s linear infinite;"><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        Conectando...`;
    try {
        await auth.signInWithPopup(googleProvider);
    } catch (error) {
        console.error('Error de login:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            loginError.textContent = 'Cerraste la ventana de inicio de sesión. Intentá de nuevo.';
        } else if (error.code === 'auth/popup-blocked') {
            loginError.textContent = 'Tu navegador bloqueó la ventana emergente. Permitila e intentá de nuevo.';
        } else {
            loginError.textContent = 'Error: ' + error.message;
        }
    }
    loginBtn.disabled = false;
    loginBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        Iniciar sesión con Google`;
});

// Botón de logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut();
});

// Agregar animación de spin para el botón de carga
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);

// ─── HELPER FUNCTIONS ─────────────────────────────────────
function fmt(n) { const v = Number(n); return v % 1 === 0 ? v.toString() : v.toFixed(2); }

function renderStarsHtml(rating) {
    const r = Math.round((rating || 0) * 2) / 2;
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (r >= i) html += '<span style="color:#ffd700">★</span>';
        else if (r >= i - 0.5) html += '<span style="background:linear-gradient(90deg,#ffd700 50%,#555 50%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">★</span>';
        else html += '<span style="color:#555">★</span>';
    }
    return html;
}

// Detect if a string is a local file path (file://, C:\, C:/, UNC paths, etc.), even with quotes
function isLocalFilePath(url) {
    if (!url) return false;
    const cleanUrl = url.trim().replace(/^["']|["']$/g, '').trim();
    if (/^file:\/\//i.test(cleanUrl) || /^file:\//i.test(cleanUrl)) return true;
    if (/^[a-zA-Z]:[\\\/]/i.test(cleanUrl)) return true;
    if (/^\\\\/i.test(cleanUrl)) return true;
    return false;
}

function showFirebaseErrorAlert(action, error) {
    let msg = `Hubo un error al ${action}:\n\n${error.message}`;
    const errMsg = (error.message || '').toLowerCase();
    if (error.code === 'permission-denied' || errMsg.includes('permission') || errMsg.includes('insufficient')) {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            msg += `\n\n💡 TIP DE SEGURIDAD:\nTu cuenta actual de Google está autenticada en Firebase con el UID:\n\n${currentUser.uid}\n\nAsegúrate de copiar este código exactamente y pegarlo en tus Reglas de Firestore en la consola de Firebase.`;
        } else {
            msg += `\n\n⚠️ No estás autenticado actualmente en Firebase. Por favor inicia sesión con Google.`;
        }
    }
    alert(msg);
}

async function loadAdminReviews(prodId) {
    const list = document.getElementById('adminReviewsList');
    const empty = document.getElementById('adminReviewsEmpty');
    const countEl = document.getElementById('adminReviewCount');
    if (!list) return;
    list.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:.85rem;padding:.5rem">Cargando...</div>';
    if (empty) empty.style.display = 'none';
    try {
        const snap = await db.collection("products").doc(prodId).collection("reviews").orderBy("date", "desc").limit(50).get();
        list.innerHTML = '';
        if (snap.empty) {
            if (empty) empty.style.display = '';
            if (countEl) countEl.textContent = '(0)';
            return;
        }
        if (countEl) countEl.textContent = `(${snap.size})`;
        snap.forEach(doc => {
            const r = doc.data();
            const dateStr = r.date?.toDate?.() ? r.date.toDate().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : '';
            const card = document.createElement('div');
            card.style.cssText = 'background:rgba(255,255,255,.02);border:1px solid var(--surface-border);border-radius:8px;padding:.6rem .8rem;font-size:.82rem';
            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
                    <div>
                        <strong style="color:var(--text-primary)">${r.userName || 'Anónimo'}</strong>
                        <span style="color:var(--text-secondary);margin-left:.4rem">${dateStr}</span>
                    </div>
                    <button class="del-review-btn" data-id="${doc.id}" data-prod="${prodId}" style="background:none;border:none;color:#ff4757;cursor:pointer;font-size:1rem;padding:0 0 0 .5rem" title="Eliminar reseña">&times;</button>
                </div>
                <div>${renderStarsHtml(r.rating)}</div>
                ${r.comment ? `<p style="color:var(--text-secondary);margin:.3rem 0 0 0;line-height:1.4">${r.comment}</p>` : ''}
            `;
            list.appendChild(card);
        });
        list.querySelectorAll('.del-review-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('¿Eliminar esta reseña?')) return;
                try {
                    await db.collection("products").doc(btn.dataset.prod).collection("reviews").doc(btn.dataset.id).delete();
                    const snap2 = await db.collection("products").doc(btn.dataset.prod).collection("reviews").get();
                    let total = 0, count = 0;
                    snap2.forEach(d => { total += d.data().rating || 0; count++; });
                    const avg = count > 0 ? total / count : 0;
                    await db.collection("products").doc(btn.dataset.prod).update({ rating: avg, reviewCount: count });
                    loadAdminReviews(prodId);
                } catch(e) {
                    console.error(e);
                    showFirebaseErrorAlert('eliminar reseña', e);
                }
            });
        });
    } catch(e) {
        console.error(e);
        list.innerHTML = '<div style="text-align:center;color:#ff4757;font-size:.85rem;padding:.5rem">Error al cargar reseñas</div>';
    }
}

// Products Logic
let adminProducts = [];
let currentUploadedImages = [];
const tbody = document.getElementById('adminProductList');
const adminSearchInput = document.getElementById('adminSearchInput');
const adminCategoryFilter = document.getElementById('adminCategoryFilter');

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

    // Populate category filter
    const prevCat = adminCategoryFilter.value;
    const cats = [...new Set(adminProducts.map(p => p.category).filter(Boolean))].sort();
    adminCategoryFilter.innerHTML = '<option value="all">Todas</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
    adminCategoryFilter.value = prevCat;

    // Apply filters
    const searchTerm = (adminSearchInput.value || '').toLowerCase().trim();
    const catFilter = adminCategoryFilter.value;
    const filtered = adminProducts.filter(p => {
        const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm);
        const matchCat = catFilter === 'all' || p.category === catFilter;
        return matchSearch && matchCat;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-secondary);">No se encontraron productos con ese filtro.</td></tr>';
        return;
    }

    filtered.forEach(p => {
        const tr = document.createElement('tr');
        const displayImg = isLocalFilePath(p.image) 
            ? "https://placehold.co/100x100/1a1a2e/ff4757?text=PC+File" 
            : (p.image || 'https://placehold.co/100x100/1a1a2e/00f0ff?text=Mimo!');
        tr.innerHTML = `
            <td><img src="${displayImg}" alt="img"></td>
            <td><strong>${p.name}</strong></td>
            <td style="text-transform: capitalize;">${p.category}</td>
            <td>$${fmt(p.price)}</td>
            <td>${p.offerPrice ? '$' + fmt(p.offerPrice) : '-'}</td>
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

adminSearchInput.addEventListener('input', renderAdminProducts);
adminCategoryFilter.addEventListener('change', renderAdminProducts);

function openModal(id = null) {
    form.reset();
    document.getElementById('prodId').value = '';
    document.getElementById('prodCost').value = '0';
    document.getElementById('prodMargin').value = '30';
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
            document.getElementById('prodCost').value = p.cost || 0;
            document.getElementById('prodMargin').value = p.margin || 30;
            document.getElementById('prodPrice').value = p.price;
            document.getElementById('prodOffer').value = p.offerPrice || '';
            document.getElementById('prodBadge').value = p.badge || '';
            document.getElementById('prodDesc').value = p.description || '';
            let imgsToLoad = [];
            if (p.fullImages) {
                try { imgsToLoad = JSON.parse(p.fullImages); } catch(e) {}
            }
            if (imgsToLoad.length === 0 && p.image) {
                imgsToLoad = [p.image];
            }
            
            // Clean local files from the list loaded into the editor
            currentUploadedImages = imgsToLoad.filter(src => !isLocalFilePath(src));
            
            // Check if primary image is a local path
            if (p.image && isLocalFilePath(p.image)) {
                document.getElementById('prodImg').value = '';
                alert("Atención: Este producto tenía guardada una ruta de archivo local de tu PC (por ejemplo C:\\ o file://). Hemos limpiado el campo de la imagen para evitar errores. Por favor, sube una nueva imagen usando el botón 'Subir desde PC/Móvil' o pega un enlace de internet válido.");
            } else {
                document.getElementById('prodImg').value = p.image || '';
            }
            document.getElementById('prodFeatured').checked = p.isFeatured || false;
            document.getElementById('prodStock').value = p.stock ?? 0;
            document.getElementById('prodWeight').value = p.peso ?? 0.5;
            
            if (imgsToLoad.length > 0) {
                currentUploadedImages = imgsToLoad;
                renderImagePreviews();
            }
            
            // Load reviews for this product
            loadAdminReviews(id);
            // Auto-open reviews panel
            const panel = document.getElementById('adminReviewsPanel');
            const arrow = document.getElementById('adminReviewsArrow');
            if (panel) panel.style.display = '';
            if (arrow) arrow.style.transform = 'rotate(90deg)';
        }
    }
    modal.classList.add('active');
    // Disparar evento para que aparezca la cruz de borrar imagen
    document.getElementById('prodImg').dispatchEvent(new Event('input'));
    // Update profit display
    document.getElementById('prodPrice').dispatchEvent(new Event('input'));
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    
    let finalImages = [...currentUploadedImages];
    let typedUrl = document.getElementById('prodImg').value.trim();
    
    // Si escribió un link pero olvidó hacer clic en "+ Agregar URL", agregarlo automáticamente
    if (typedUrl) {
        typedUrl = typedUrl.replace(/^["']|["']$/g, '').trim();
        if (!isLocalFilePath(typedUrl) && !finalImages.includes(typedUrl)) {
            finalImages.push(typedUrl);
        }
    }
    
    // Validar que tengamos al menos una imagen en la colección
    if (finalImages.length === 0) {
        finalImages.push('https://placehold.co/400x400/1a1a2e/00f0ff?text=Mimo!');
    }
    
    // Filtrar rutas locales
    finalImages = finalImages.filter(img => !isLocalFilePath(img));
    
    // La imagen principal será la primera de la lista
    const mainImgUrl = finalImages[0];
    
    const productData = {
        name: document.getElementById('prodName').value,
        category: document.getElementById('prodCategory').value,
        price: parseFloat(document.getElementById('prodPrice').value) || 0,
        cost: parseFloat(document.getElementById('prodCost').value) || 0,
        margin: parseInt(document.getElementById('prodMargin').value) || 0,
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
        showFirebaseErrorAlert('guardar el producto', error);
    }

    saveBtn.textContent = 'Guardar Producto';
    saveBtn.disabled = false;
});

// Auto-calculate price
function updateCalculatedPrice() {
    const cost = parseFloat(document.getElementById('prodCost').value) || 0;
    const margin = parseFloat(document.getElementById('prodMargin').value) || 0;
    const finalPrice = cost * (1 + (margin / 100));
    document.getElementById('prodPrice').value = finalPrice.toFixed(2);
    
    const profit = finalPrice - cost;
    const display = document.getElementById('prodProfitDisplay');
    if (display) display.textContent = `Ganancia: $${profit.toFixed(2)}`;
}
document.getElementById('prodCost').addEventListener('input', updateCalculatedPrice);
document.getElementById('prodMargin').addEventListener('input', updateCalculatedPrice);

// Also update profit display if user manually edits the final price
document.getElementById('prodPrice').addEventListener('input', () => {
    const cost = parseFloat(document.getElementById('prodCost').value) || 0;
    const finalPrice = parseFloat(document.getElementById('prodPrice').value) || 0;
    const profit = finalPrice - cost;
    const display = document.getElementById('prodProfitDisplay');
    if (display) display.textContent = `Ganancia: $${profit.toFixed(2)}`;
});

async function deleteProduct(id) {
    if (confirm("¿Estás seguro de que quieres borrar este producto?")) {
        try {
            await db.collection("products").doc(id).delete();
            loadProducts();
        } catch (error) {
            console.error("Error eliminando producto:", error);
            showFirebaseErrorAlert('eliminar el producto', error);
        }
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

// Global preview renderer
function renderImagePreviews() {
    const previewContainer = document.getElementById('imgPreviewContainer');
    Array.from(previewContainer.querySelectorAll('.preview-img-wrapper')).forEach(w => w.remove());
    const statusText = previewContainer.querySelector('span');
    
    if (currentUploadedImages.length === 0) {
        previewContainer.style.display = 'none';
        document.getElementById('prodImg').value = '';
        document.getElementById('clearImgBtn').style.display = 'none';
        return;
    }
    
    currentUploadedImages.forEach((src, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-img-wrapper';
        wrapper.style.cssText = "position: relative; display: inline-block;";
        
        const imgEl = document.createElement('img');
        if (isLocalFilePath(src)) {
            imgEl.src = "https://placehold.co/100x100/1a1a2e/ff4757?text=Local+File+Blocked";
            imgEl.title = "Archivo local bloqueado: " + src;
        } else {
            imgEl.src = src;
        }
        imgEl.style.cssText = "width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid var(--surface-border);";
        
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '&times;';
        delBtn.style.cssText = "position: absolute; top: -8px; right: -8px; background: #ff4757; color: white; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 16px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.5);";
        delBtn.onclick = (e) => {
            e.preventDefault();
            currentUploadedImages.splice(index, 1);
            renderImagePreviews();
        };
        
        wrapper.appendChild(imgEl);
        wrapper.appendChild(delBtn);
        previewContainer.appendChild(wrapper);
    });
    
    if(statusText) {
        statusText.textContent = `${currentUploadedImages.length} imagen(es) listas`;
        statusText.style.color = 'var(--accent-color)';
    }
    previewContainer.style.display = 'flex';
    document.getElementById('clearImgBtn').style.display = 'block';
}

// Image Upload and Preview Handler
document.getElementById('prodImgFile').addEventListener('change', async function(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for(let file of files) {
        const base64 = await compressImageFile(file);
        currentUploadedImages.push(base64);
    }
    
    renderImagePreviews();
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
const prodImgInput = document.getElementById('prodImg');
const clearImgBtn = document.getElementById('clearImgBtn');
const addImgUrlBtn = document.getElementById('addImgUrlBtn');

// Add Image URL explicitly
if (addImgUrlBtn) {
    addImgUrlBtn.addEventListener('click', () => {
        let url = prodImgInput.value.trim();
        if (!url) {
            alert('Por favor, ingresá una URL válida antes de agregar.');
            return;
        }
        url = url.replace(/^["']|["']$/g, '').trim();
        if (isLocalFilePath(url)) {
            alert('Error: No podés usar una ruta de tu PC (file://).');
            return;
        }
        
        // Add to images if not already present
        if (!currentUploadedImages.includes(url)) {
            currentUploadedImages.push(url);
            renderImagePreviews();
            // Empty the URL input field so the user can easily paste another one!
            prodImgInput.value = '';
            showToast('Imagen agregada con éxito', 'success');
        } else {
            alert('Esta imagen ya está agregada.');
        }
    });
}

// Toggle clear all button visibility dynamically
prodImgInput.addEventListener('input', function(e) {
    let url = e.target.value.trim();
    if (url || currentUploadedImages.length > 0) {
        clearImgBtn.style.display = 'block';
    } else {
        clearImgBtn.style.display = 'none';
    }
});

clearImgBtn.addEventListener('click', () => {
    prodImgInput.value = '';
    currentUploadedImages = [];
    renderImagePreviews();
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
                try {
                    const doc = await db.collection('config').doc('shipping').get();
                    const rates = doc.exists ? doc.data().rates || {} : {};
                    delete rates[prov];
                    await db.collection('config').doc('shipping').set({ rates });
                    loadShippingRates();
                } catch (error) {
                    console.error('Error deleting rate:', error);
                    showFirebaseErrorAlert('eliminar la tarifa de envío', error);
                }
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
        showFirebaseErrorAlert('agregar la tarifa de envío', e);
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
                <td>$${fmt(o.total || 0)}${o.shippingCost ? '<br><small style="color:var(--text-secondary)">+ envío $' + fmt(o.shippingCost) + '</small>' : ''}</td>
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

document.getElementById('orderStatusFilter').addEventListener('change', function() {
    loadOrders(this.value);
});
document.getElementById('reloadOrdersBtn').addEventListener('click', () => {
    loadOrders(document.getElementById('orderStatusFilter').value);
});
loadOrders();

// ─── GOOGLE IMAGES SEARCH (OPCIÓN 2B) ─────────────────────────
const searchGoogleImagesBtn = document.getElementById('searchGoogleImagesBtn');

searchGoogleImagesBtn.addEventListener('click', () => {
    const name = document.getElementById('prodName').value.trim();
    const query = name 
        ? encodeURIComponent(name.replace(/[""']/g, '').substring(0, 150))
        : '';
    if (!query) {
        alert('Primero escribí el nombre del producto para buscar.');
        return;
    }
    window.open(`https://www.google.com/search?tbm=isch&q=${query}`, '_blank');
});

// Google Custom Search feature has been removed as per user request.

// ─── ADMIN REVIEWS TOGGLE ─────────────────────────────────
function initAdminReviewsToggle() {
    const toggle = document.getElementById('adminReviewsToggle');
    const panel = document.getElementById('adminReviewsPanel');
    const arrow = document.getElementById('adminReviewsArrow');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', () => {
        const isOpen = panel.style.display !== 'none';
        panel.style.display = isOpen ? 'none' : '';
        if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(90deg)';
    });
}
initAdminReviewsToggle();

// ─── TABS LOGIC ───────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        const targetId = btn.getAttribute('data-tab');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.remove('hidden');
        }
        // Refresh reviews tab when opened
        if (targetId === 'tab-reviews') {
            loadReviewsProductSelect();
        }
    });
});

// ─── ADMIN REVIEWS TAB ───────────────────────────────────
async function loadReviewsProductSelect() {
    const select = document.getElementById('adminReviewsProductSelect');
    if (!select) return;
    const selectedVal = select.value;
    select.innerHTML = '<option value="">Cargando productos...</option>';
    try {
        const snap = await db.collection("products").orderBy("name").get();
        select.innerHTML = '<option value="">Seleccioná un producto...</option>';
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

function renderReviewsTab(prodId) {
    const container = document.getElementById('adminReviewsTabList');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:.85rem;padding:2rem">Cargando reseñas...</div>';

    db.collection("products").doc(prodId).collection("reviews").orderBy("date", "desc").limit(100).get()
        .then(async snap => {
            container.innerHTML = '';
            if (snap.empty) {
                container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem;font-size:.9rem">Este producto no tiene reseñas todavía.</p>';
                return;
            }
            const prodDoc = await db.collection("products").doc(prodId).get();
            const prodName = prodDoc.exists ? prodDoc.data().name : 'Producto';
            const header = document.createElement('div');
            header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:.5rem 0';
            header.innerHTML = `
                <span style="color:var(--text-primary);font-weight:600;font-size:.95rem">${prodName} — <span style="color:var(--text-secondary);font-weight:400">${snap.size} reseña(s)</span></span>
                <button class="recalc-rating-btn magnetic-btn" data-prod="${prodId}" style="background:transparent;border:1px solid var(--accent-color);color:var(--accent-color);padding:.4rem .8rem;border-radius:8px;font-size:.8rem;cursor:pointer">🔄 Recalcular rating</button>
            `;
            container.appendChild(header);

            snap.forEach(doc => {
                const r = doc.data();
                const dateStr = r.date?.toDate?.() ? r.date.toDate().toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                const card = document.createElement('div');
                card.style.cssText = 'background:rgba(255,255,255,.02);border:1px solid var(--surface-border);border-radius:10px;padding:.8rem 1rem';
                card.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:flex-start">
                        <div style="flex:1">
                            <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem">
                                <strong style="color:var(--text-primary);font-size:.9rem">${r.userName || 'Anónimo'}</strong>
                                <span style="color:var(--text-secondary);font-size:.75rem">${dateStr}</span>
                                <span style="font-size:.75rem;color:var(--text-secondary)">(ID: ${doc.id.slice(0,8)}...)</span>
                            </div>
                            <div style="margin-bottom:.3rem">${renderStarsHtml(r.rating || 0)}</div>
                            ${r.comment ? `<p style="color:var(--text-secondary);font-size:.85rem;line-height:1.4;margin:0">${r.comment}</p>` : ''}
                        </div>
                        <button class="del-review-tab-btn" data-id="${doc.id}" data-prod="${prodId}" style="background:none;border:none;color:#ff4757;cursor:pointer;font-size:1.2rem;padding:.2rem .4rem;flex-shrink:0" title="Eliminar reseña">&times;</button>
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
                        const snap2 = await db.collection("products").doc(prodId).collection("reviews").get();
                        let total = 0, count = 0;
                        snap2.forEach(d => { total += d.data().rating || 0; count++; });
                        const avg = count > 0 ? total / count : 0;
                        try { await db.collection("products").doc(prodId).update({ rating: avg, reviewCount: count }); } catch(e) {}
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
        })
        .catch(e => {
            console.error(e);
            container.innerHTML = '<p style="text-align:center;color:#ff4757;padding:2rem">Error al cargar reseñas</p>';
        });
}

document.getElementById('adminReviewsProductSelect')?.addEventListener('change', function() {
    const prodId = this.value;
    const container = document.getElementById('adminReviewsTabList');
    if (!prodId) {
        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem">Seleccioná un producto para ver sus reseñas.</p>';
        return;
    }
    renderReviewsTab(prodId);
});

document.getElementById('adminReviewsRefreshBtn')?.addEventListener('click', () => {
    const select = document.getElementById('adminReviewsProductSelect');
    const prodId = select?.value;
    loadReviewsProductSelect();
    if (prodId) renderReviewsTab(prodId);
});

document.getElementById('adminRecalcAllBtn')?.addEventListener('click', async () => {
    if (!confirm('¿Recalcular el rating de TODOS los productos según sus reseñas actuales?')) return;
    const btn = document.getElementById('adminRecalcAllBtn');
    btn.textContent = '⏳ Recalculando...';
    btn.disabled = true;
    try {
        const prods = await db.collection("products").get();
        let updated = 0;
        for (const doc of prods.docs) {
            const revSnap = await db.collection("products").doc(doc.id).collection("reviews").get();
            let total = 0, count = 0;
            revSnap.forEach(r => { total += r.data().rating || 0; count++; });
            const avg = count > 0 ? total / count : 0;
            await doc.ref.update({ rating: avg, reviewCount: count });
            updated++;
        }
        showToast(`✅ ${updated} productos actualizados con su rating real`, 'success');
        const select = document.getElementById('adminReviewsProductSelect');
        if (select?.value) renderReviewsTab(select.value);
        loadReviewsProductSelect();
    } catch(e) {
        console.error(e);
        showToast('Error al recalcular', 'error');
    }
    btn.textContent = '♻️ Recalcular todos';
    btn.disabled = false;
});
