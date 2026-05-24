const firebaseConfig = {
  apiKey: "AIzaSyCilME1Fv3Sjb6YBIBSZT3zZshCedEL9LM",
  authDomain: "tienda-mimo.firebaseapp.com",
  projectId: "tienda-mimo",
  storageBucket: "tienda-mimo.firebasestorage.app",
  messagingSenderId: "451218117227",
  appId: "1:451218117227:web:96a87214151a03db63172e",
  measurementId: "G-DQWL3HL2VG"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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
const tbody = document.getElementById('adminProductList');

async function loadProducts() {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">Cargando productos...</td></tr>';
    try {
        const querySnapshot = await db.collection("products").get({ source: 'server' });
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
    if (adminProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No hay productos. Usa "Cargar Catálogo Inicial" para iniciar.</td></tr>';
        return;
    }
    
    adminProducts.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.image}" alt="img"></td>
            <td><strong>${p.name}</strong></td>
            <td style="text-transform: capitalize;">${p.category}</td>
            <td>$${parseFloat(p.price).toFixed(2)}</td>
            <td>${p.offerPrice ? '$' + parseFloat(p.offerPrice).toFixed(2) : '-'}</td>
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
document.getElementById('cancelBtn').addEventListener('click', () => modal.classList.remove('active'));

function openModal(id = null) {
    form.reset();
    document.getElementById('prodId').value = '';
    document.getElementById('modalTitle').textContent = 'Agregar Producto';
    
    // Reset file uploads and preview
    document.getElementById('prodImgFile').value = '';
    const previewContainer = document.getElementById('imgPreviewContainer');
    const previewImg = document.getElementById('imgPreview');
    previewContainer.style.display = 'none';
    previewImg.src = '';
    
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
            
            if (p.image) {
                previewImg.src = p.image;
                previewContainer.style.display = 'flex';
            }
        }
    }
    modal.classList.add('active');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    
    const productData = {
        name: document.getElementById('prodName').value,
        category: document.getElementById('prodCategory').value,
        price: parseFloat(document.getElementById('prodPrice').value),
        offerPrice: document.getElementById('prodOffer').value ? parseFloat(document.getElementById('prodOffer').value) : null,
        badge: document.getElementById('prodBadge').value,
        description: document.getElementById('prodDesc').value,
        image: document.getElementById('prodImg').value,
        isFeatured: document.getElementById('prodFeatured').checked,
        fullImages: JSON.stringify([document.getElementById('prodImg').value])
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
document.getElementById('prodImgFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Show loading state
    const previewContainer = document.getElementById('imgPreviewContainer');
    const previewImg = document.getElementById('imgPreview');
    const statusText = previewContainer.querySelector('span');
    
    statusText.textContent = 'Cargando imagen...';
    statusText.style.color = 'var(--text-secondary)';
    previewContainer.style.display = 'flex';

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Compress using HTML5 Canvas to keep Firestore documents small (under 100KB)
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with 0.75 quality
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
            
            // Set value in the URL field
            document.getElementById('prodImg').value = compressedBase64;
            
            // Show preview
            previewImg.src = compressedBase64;
            statusText.textContent = '✓ Imagen lista';
            statusText.style.color = '#2ed573';
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

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
