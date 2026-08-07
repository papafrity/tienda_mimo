// ─── TOAST NOTIFICATION SYSTEM ──────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-text">${message}</span>
        <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 300);">&times;</button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}
window.showToast = showToast;

// Shared smooth-scroll instance (created after GSAP/ScrollSmoother load)
let smoother = null;

document.addEventListener('DOMContentLoaded', () => {
    // ─── PRELOADER ──────────────────────────────────────────
    const preloader = document.getElementById('preloader');
    const navbar = document.getElementById('navbar');
    setTimeout(() => {
        if (preloader) preloader.classList.add('done');
        setTimeout(() => { if (navbar) navbar.classList.add('--active'); }, 110);
    }, 2000);

    // ─── CUSTOM CURSOR ──────────────────────────────────────
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let cx = 0, cy = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });

    function animateCursor() {
        if (!dot || !ring) return;
        rx += (cx - rx) * 0.15;
        ry += (cy - ry) * 0.15;
        dot.style.transform = `translate(${cx - 4}px, ${cy - 4}px)`;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover grow effect
    document.querySelectorAll('a, button, .product-card, .carousel-card, .filter-tab, .cart-btn').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
    // Card-specific hover (glow ring)
    document.querySelectorAll('.product-card, .carousel-card').forEach(el => {
        el.addEventListener('mouseenter', () => { ring.classList.remove('hover'); ring.classList.add('hover-card'); });
        el.addEventListener('mouseleave', () => ring.classList.remove('hover-card'));
    });

    // ─── SPLIT TITLE ANIMATION ──────────────────────────────
    const title = document.getElementById('heroTitle');
    if (title) {
        const text = title.textContent;
        const manosIdx = text.indexOf('en');
        title.innerHTML = '';
        text.split('').forEach((ch, i) => {
            if (i === manosIdx && manosIdx !== -1) {
                title.appendChild(document.createElement('br'));
            }
            const span = document.createElement('span');
            span.classList.add('char');
            span.textContent = ch === ' ' ? '\u00A0\u200B' : ch;
            span.style.animationDelay = `${0.3 + i * 0.04}s`;
            title.appendChild(span);
        });
    }

    // ─── REVEAL ON SCROLL ───────────────────────────────────
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('revealed');
                // Stagger siblings within same parent
                const parent = e.target.parentElement;
                if (parent) {
                    const siblings = parent.querySelectorAll('.reveal-text:not(.revealed), .reveal-up:not(.revealed), .section-counter:not(.revealed)');
                    siblings.forEach((sib, i) => {
                        setTimeout(() => sib.classList.add('revealed'), i * 80);
                    });
                }
                revealObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal-text, .reveal-up, .section-counter').forEach(el => revealObs.observe(el));

    // ─── MAGNETIC BUTTONS ───────────────────────────────────
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            const x = e.clientX - r.left - r.width / 2;
            const y = e.clientY - r.top - r.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    // ─── CARD GLOW FOLLOW MOUSE ─────────────────────────────
    document.querySelectorAll('.tilt-card').forEach(card => {
        const glow = card.querySelector('.card-glow');
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }
            // Subtle 3D tilt
            const cx2 = r.width / 2, cy2 = r.height / 2;
            const rotX = ((y - cy2) / cy2) * -4;
            const rotY = ((x - cx2) / cx2) * 4;
            card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    // ─── HAMBURGER MENU ─────────────────────────────────────
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
        hamburger.classList.remove('active'); navLinks.classList.remove('open'); document.body.style.overflow = '';
    }));
    }

    // ─── PRODUCT DATABASE (Fase 3: Firebase) ────────
    let products = [];

    function fmt(n) { return Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
    // Safe offer-price getter: handles $0 correctly (unlike `offerVal(p)`)
    function offerVal(p) { return p.offerPrice != null ? p.offerPrice : p.price; }
    function hasOffer(p) { return p.offerPrice != null && p.offerPrice !== p.price; }

    // ─── PRECIOS DINÁMICOS CON DÓLAR ─────────────────
    // Los productos con costCurrency = 'USD' recalculan su precio en ARS
    // automáticamente con el dólar blue del momento (misma fórmula del admin).
    const MP_FEE = 0.0649;
    let usdRateARS = null;

    function roundPrice(v) { return v < 100 ? v : Math.ceil(v / 100) * 100; }

    function calcPriceFromUSD(costUSD, margin) {
        const costARS = costUSD * (usdRateARS || 0);
        if (!costARS) return null;
        const basePrice = costARS * (1 + (margin / 100));
        return roundPrice(basePrice * (1 + MP_FEE));
    }

    function applyDynamicPrices() {
        let changed = false;
        products.forEach(p => {
            if (p.costCurrency === 'USD' && p.cost > 0 && usdRateARS) {
                const dynamicPrice = calcPriceFromUSD(p.cost, p.margin || 30);
                if (dynamicPrice != null) {
                    p.price = dynamicPrice;
                    changed = true;
                }
            }
        });
        return changed;
    }

    async function fetchUsdRate() {
        try {
            const resp = await fetch('https://dolarapi.com/v1/dolares/blue');
            const data = await resp.json();
            if (data && data.venta) usdRateARS = data.venta;
        } catch(e) { /* ignore */ }
    }

    function renderStarsHtml(rating) {
        const r = Math.round((rating || 0) * 2) / 2;
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (r >= i) html += '<span class="star">★</span>';
            else if (r >= i - 0.5) html += '<span class="star half">★</span>';
            else html += '<span class="star empty">★</span>';
        }
        return html;
    }

    function renderProducts() {
        try {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        const activeFilter = document.querySelector('.filter-tab.active')?.dataset?.filter || 'all';
        const sortBy = document.getElementById('sortSelect')?.value || 'default';
        const priceMin = parseFloat(document.getElementById('priceMin')?.value) || 0;
        const priceMax = parseFloat(document.getElementById('priceMax')?.value) || Infinity;
        let filtered = products.filter(p => p.isActive !== false); // Solo productos activos
        filtered = activeFilter === 'all' ? [...filtered] : filtered.filter(p => p.category === activeFilter);
        filtered = filtered.filter(p => {
            const dp = hasOffer(p) ? p.offerPrice : p.price;
            return dp >= priceMin && dp <= priceMax;
        });
        switch (sortBy) {
            case 'price-asc': filtered.sort((a, b) => (offerVal(a)||0) - (offerVal(b)||0)); break;
            case 'price-desc': filtered.sort((a, b) => (offerVal(b)||0) - (offerVal(a)||0)); break;
            case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
            case 'rating': filtered.sort((a, b) => (b.rating||0) - (a.rating||0) || (b.reviewCount||0) - (a.reviewCount||0)); break;
        }
        filteredProducts = filtered;
        productPage = 1;
        renderPage();
        } catch(e) { console.error('Error en renderProducts:', e); }
    }

    let productPage = 1;
    const productsPerPage = 12;
    let filteredProducts = [];

    function renderPage() {
        const grid = document.getElementById('productGrid');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (!grid) return;

        const end = productPage * productsPerPage;
        const pageProducts = filteredProducts.slice(0, end);

        grid.innerHTML = '';
        pageProducts.forEach((p, idx) => {
            const hasDiscount = hasOffer(p);
            let priceHtml = hasDiscount 
                ? `<p class="price"><span style="text-decoration: line-through; font-size: 0.85em; color: var(--text-secondary); margin-right: 8px;">$${fmt(p.price)}</span><span class="accent">$${fmt(p.offerPrice)}</span></p>`
                : `<p class="price">$${fmt(offerVal(p))}</p>`;
                
            grid.innerHTML += `
            <div class="product-card tilt-card reveal-up" data-category="${p.category}" data-id="${p.id}" style="transition-delay:${Math.min(idx * .04, .3)}s">
                <div class="card-glow"></div>
                <div class="card-spotlight"></div>
                <div class="product-image"><img src="${p.image}" alt="${p.name}"></div>
                <div class="product-info">
                    <span class="category">${p.category}</span>
                    <h3>${p.name}</h3>
                    <div class="stars">${renderStarsHtml(p.rating)}${p.reviewCount ? `<span class="review-count">(${p.reviewCount})</span>` : ''}</div>
                    ${priceHtml}
                    <button class="add-to-cart magnetic-btn">Agregar al Carrito</button>
                </div>
            </div>`;
        });

        if (loadMoreContainer) {
            loadMoreContainer.style.display = end >= filteredProducts.length ? 'none' : '';
        }

        initDynamicEvents();
        // Observe newly added reveal-up elements
        document.querySelectorAll('.reveal-up:not(.revealed), .section-counter:not(.revealed)').forEach(el => revealObs.observe(el));
    }

    function renderCarousel() {
        const carousel = document.getElementById('carousel3d');
        if (!carousel) return;
        carousel.innerHTML = '';
        const featured = products.filter(p => p.isFeatured && p.isActive !== false);
        featured.forEach(p => {
            const hasDiscount = p.oldPrice && p.offerPrice && p.oldPrice !== p.offerPrice;
            let priceHtml = hasDiscount 
                ? `<p class="old-price">$${fmt(p.oldPrice)}</p><p class="offer-price">$${fmt(p.offerPrice)}</p>` 
                : `<p class="offer-price">$${fmt(offerVal(p))}</p>`;
                
            const card = document.createElement('div');
            card.className = 'carousel-card';
            card.dataset.productId = p.id;
            card.innerHTML = `
                <img src="${p.image}" alt="${p.name}">
                <div class="carousel-card-info">
                    <span class="badge">${p.badge || ''}</span>
                    <h3>${p.name}</h3>
                    ${priceHtml}
                    <button class="add-to-cart magnetic-btn" data-product-id="${p.id}" style="margin-top: 10px; width: 100%; border-radius: 20px; font-size: 0.85rem;">Agregar al Carrito</button>
                </div>`;
            
            const btn = card.querySelector('.add-to-cart');
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                window.addToCart(p.id, btn);
            });
            
            carousel.appendChild(card);
        });
    }

    async function fetchProducts() {
        try {
            await fetchUsdRate();
            const querySnapshot = await db.collection("products").get();
            products = [];
            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });
            applyDynamicPrices();
            if (products.length === 0) {
                showEmptyProductsMessage();
            } else {
                renderProducts();
                renderCarousel();
            }
            initDynamicEvents();
            initCarouselLogic();
            initProductFiltersAndModals();

            // Recalcular precios cada 10 min con el dólar del momento
            setInterval(async () => {
                await fetchUsdRate();
                if (applyDynamicPrices()) {
                    renderProducts();
                    renderCarousel();
                }
            }, 10 * 60 * 1000);
        } catch(e) {
            console.error("Error fetching products", e);
            showProductsError(e.message);
        }
    }

    function showProductsError(msg) {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;color:var(--text-secondary)">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin:0 auto 1rem;opacity:.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3 style="margin:0 0 .5rem;color:var(--text-primary)">No se pudieron cargar los productos</h3>
                <p style="margin:0;font-size:.9rem">${msg.includes('permission') || msg.includes('Permission') ? 'Verificá las reglas de Firestore (allow read)' : msg}</p>
            </div>`;
    }

    function showEmptyProductsMessage() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;color:var(--text-secondary)">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin:0 auto 1rem;opacity:.5">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <h3 style="margin:0 0 .5rem;color:var(--text-primary)">No hay productos publicados</h3>
                <p style="margin:0;font-size:.9rem">Agregá productos desde el panel de administración</p>
            </div>`;
    }

    // ─── SKELETON LOADING ───────────────────────────────────
    function showSkeletons() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        grid.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            grid.innerHTML += `
            <div class="skeleton-card" style="animation-delay:${i * .05}s">
                <div class="skeleton-img"></div>
                <div class="skeleton-line w-60"></div>
                <div class="skeleton-line w-80"></div>
                <div class="skeleton-line w-40"></div>
                <div class="skeleton-btn"></div>
            </div>`;
        }
    }
    showSkeletons();

    fetchProducts();
    function initDynamicEvents() {
        document.querySelectorAll('.tilt-card').forEach(card => {
            const glow = card.querySelector('.card-glow');
            const spotlight = card.querySelector('.card-spotlight');
            const img = card.querySelector('.product-image img');
            const info = card.querySelector('.product-info');
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                const cx2 = r.width / 2, cy2 = r.height / 2;
                if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }
                if (spotlight) { spotlight.style.setProperty('--spot-x', x + 'px'); spotlight.style.setProperty('--spot-y', y + 'px'); }
                // 3D tilt (increased intensity)
                const rotX = ((y - cy2) / cy2) * -6;
                const rotY = ((x - cx2) / cx2) * 6;
                card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
                // Image parallax
                const px = (x - cx2) / cx2;
                const py = (y - cy2) / cy2;
                if (img) {
                    card.style.setProperty('--img-x', `${px * 10}px`);
                    card.style.setProperty('--img-y', `${py * 6}px`);
                }
                if (info) {
                    card.style.setProperty('--info-x', `${px * 4}`);
                    card.style.setProperty('--info-y', `${py * 3}`);
                }
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.setProperty('--img-x', '0px');
                card.style.setProperty('--img-y', '0px');
                card.style.setProperty('--info-x', '0');
                card.style.setProperty('--info-y', '0');
            });
        });
        
        document.querySelectorAll('a, button, .product-card, .carousel-card, .filter-tab, .cart-btn').forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('hover'));
            el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
        });
        document.querySelectorAll('.product-card, .carousel-card').forEach(el => {
            el.addEventListener('mouseenter', () => { ring.classList.remove('hover'); ring.classList.add('hover-card'); });
            el.addEventListener('mouseleave', () => ring.classList.remove('hover-card'));
        });
    }

    let cart = [];
    try {
        const storedCart = localStorage.getItem('mimo_cart');
        console.log("Carrito cargado desde localStorage:", storedCart);
        if (storedCart) {
            cart = JSON.parse(storedCart);
            if (!Array.isArray(cart)) {
                cart = [];
            }
        }
    } catch (e) {
        console.error("Error al inicializar el carrito:", e);
        cart = [];
    }

    function saveCart() {
        console.log("Guardando carrito en localStorage:", cart);
        localStorage.setItem('mimo_cart', JSON.stringify(cart));
        renderCart();
    }

    // Global Confetti particle spawner
    function spawnConfetti(btn) {
        const rect = btn.getBoundingClientRect();
        const colors = ['#00f0ff','#8a2be2','#2ed573','#ffd700','#ff6b6b','#fff'];
        const container = document.body;
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            const angle = (Math.PI * 2 * i) / 20;
            const dist = 50 + Math.random() * 70;
            particle.style.setProperty('--cx', `${Math.cos(angle) * dist}px`);
            particle.style.setProperty('--cy', `${Math.sin(angle) * dist}px`);
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.width = (4 + Math.random() * 5) + 'px';
            particle.style.height = particle.style.width;
            
            const x = rect.left + window.scrollX + rect.width / 2;
            const y = rect.top + window.scrollY + rect.height / 2;
            particle.style.position = 'absolute';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.animationDelay = (Math.random() * 0.1) + 's';
            particle.style.zIndex = '99999';
            
            container.appendChild(particle);
            setTimeout(() => particle.remove(), 1200);
        }
    }

    window.addToCart = function(id, btn) {
        console.log("window.addToCart llamado con id:", id, "Carrito actual:", JSON.stringify(cart));
        const product = products.find(p => p.id === id);
        if (!product) {
            console.error("Producto no encontrado en products para ID:", id);
            return;
        }
        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        saveCart();
        gtag('event', 'add_to_cart', { currency: 'ARS', value: offerVal(product), items: [{ item_id: product.id, item_name: product.name, price: offerVal(product), quantity: 1 }] });
        showToast(`${product.name} agregado al carrito`, 'success');

        // Button morph + flying image to cart
        if (btn && btn.classList && btn.classList.contains('add-to-cart')) {
            const orig = btn.innerHTML;
            btn.classList.add('added');
            btn.innerHTML = '✓ Agregado';
            spawnConfetti(btn);
            setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = orig; }, 1200);
            flyToCart(btn);
        } else {
            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                cartCount.classList.add('bump');
                setTimeout(() => cartCount.classList.remove('bump'), 400);
            }
        }

        setTimeout(openCart, 650);
    };

    function flyToCart(btn) {
        const card = btn.closest('.product-card, .carousel-card, .modal-content');
        const img = card ? card.querySelector('img') : null;
        const cartBtnEl = document.getElementById('cartBtn');
        if (!img || !cartBtnEl) return;
        const ir = img.getBoundingClientRect();
        const cr = cartBtnEl.getBoundingClientRect();
        const fly = img.cloneNode(true);
        fly.className = 'fly-to-cart-premium';
        fly.style.position = 'fixed';
        fly.style.left = ir.left + 'px';
        fly.style.top = ir.top + 'px';
        fly.style.width = Math.min(ir.width, 200) + 'px';
        fly.style.height = Math.min(ir.height, 200) + 'px';
        document.body.appendChild(fly);
        
        const isModal = btn.classList.contains('modal-add-cart');
        const delay = isModal ? 0.3 : 0.05;
        
        gsap.to(fly, {
            left: cr.left + cr.width / 2 - 20,
            top: cr.top + cr.height / 2 - 20,
            width: 35, height: 35, opacity: 0, duration: 0.85, ease: 'power3.in', delay: delay,
            onComplete: () => {
                fly.remove();
                const cc = document.getElementById('cartCount');
                if (cc) { cc.classList.add('bump'); setTimeout(() => cc.classList.remove('bump'), 400); }
            }
        });
    }

    window.updateQty = function(id, delta, btn) {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) {
            window.removeFromCart(id, btn);
        } else {
            saveCart();
        }
    };

    window.removeFromCart = function(id, btn) {
        const itemEl = btn ? btn.closest('.cart-item') : null;
        if (itemEl && typeof gsap !== 'undefined') {
            itemEl.style.overflow = 'hidden';
            gsap.to(itemEl, {
                x: 120,
                opacity: 0,
                scale: 0.9,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    gsap.to(itemEl, {
                        height: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                        marginTop: 0,
                        marginBottom: -24, // collapses the 1.5rem (24px) gap of the container
                        borderWidth: 0,
                        duration: 0.25,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            cart = cart.filter(i => i.id !== id);
                            saveCart();
                        }
                    });
                }
            });
        } else {
            cart = cart.filter(i => i.id !== id);
            saveCart();
        }
    };

    function openCart() {
        document.getElementById('cartSidebar').classList.add('active');
        document.getElementById('cartOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        document.getElementById('cartSidebar').classList.remove('active');
        document.getElementById('cartOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    function renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotalValue = document.getElementById('cartTotalValue');
        const cartCount = document.getElementById('cartCount');
        
        if (!cartItems) return;
        
        cartItems.innerHTML = '';
        let total = 0;
        let count = 0;
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
        } else {
            cart.forEach(item => {
                const price = offerVal(item);
                total += price * item.qty;
                count += item.qty;
                
                cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${fmt(price)}</p>
                        <div class="cart-item-qty">
                            <button class="qty-btn" onclick="updateQty('${item.id}', -1, this)">-</button>
                            <span class="qty-val">${item.qty}</span>
                            <button class="qty-btn" onclick="updateQty('${item.id}', 1, this)">+</button>
                        </div>
                    </div>
                    <button class="cart-item-del" onclick="removeFromCart('${item.id}', this)">&times;</button>
                </div>
                `;
            });
        }
        
        if (cartTotalValue) cartTotalValue.textContent = `$${fmt(total)}`;
        if (cartCount) cartCount.textContent = count;
    }

    function toggleCart() {
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            closeCart();
        } else {
            openCart();
        }
    }
    window.toggleCart = toggleCart;

    // Attach cart UI events
    const cartBtn = document.getElementById('cartBtn');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartBtn) cartBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleCart(); });
    if (cartClose) cartClose.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closeCart(); });
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Initial render
    renderCart();

    function initCarouselLogic() {
        const track = document.getElementById('carousel3d');
        const wrapper = track.parentElement;
        const cards = [...track.querySelectorAll('.carousel-card')];
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const dotsC = document.getElementById('carouselDots');
        if (cards.length === 0) return;

        const realCount = cards.length;
        let ci = 0;
        let animating = false;
        const isMobile = () => innerWidth < 768;
        const X_STEP = isMobile() ? 260 : 320;

        // ── Spotlight element ──
        let spotlight = wrapper.querySelector('.carousel-spotlight');
        if (!spotlight) {
            spotlight = document.createElement('div');
            spotlight.className = 'carousel-spotlight';
            wrapper.appendChild(spotlight);
        }

        // ── Progress bar ──
        let progressFill = document.querySelector('.carousel-progress-fill');
        let progressText = document.querySelector('.carousel-progress-text');
        if (!progressFill && !isMobile()) {
            const progWrap = document.createElement('div');
            progWrap.className = 'carousel-progress';
            progressFill = document.createElement('div');
            progressFill.className = 'carousel-progress-fill';
            progWrap.appendChild(progressFill);
            wrapper.parentElement.appendChild(progWrap);
            progressText = document.createElement('div');
            progressText.className = 'carousel-progress-text';
            wrapper.parentElement.appendChild(progressText);
        }

        // ── Build dots ──
        dotsC.innerHTML = '';
        for (let i = 0; i < realCount; i++) {
            const d = document.createElement('div');
            d.classList.add('carousel-dot');
            if (i === 0) d.classList.add('active');
            d.addEventListener('click', () => goTo(i));
            dotsC.appendChild(d);
        }

        // ── Floating animation for active card ──
        let floatingTl = null;
        function startFloating(card) {
            if (floatingTl) floatingTl.kill();
            floatingTl = gsap.to(card, {
                y: '+=8', duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1
            });
        }

        // ── Glow pulse for active card ──
        let glowTl = null;
        function startGlow(card) {
            if (glowTl) glowTl.kill();
            glowTl = gsap.to(card, {
                boxShadow: '0 0 60px rgba(0,240,255,.3), 0 0 120px rgba(0,240,255,.1)',
                duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1
            });
        }

        // ── Transition particles — elegant burst ──
        function spawnParticles(card) {
            if (isMobile()) return;
            const rect = card.getBoundingClientRect();
            const wrapRect = wrapper.getBoundingClientRect();
            const cx = rect.left + rect.width / 2 - wrapRect.left;
            const cy = rect.top + rect.height / 2 - wrapRect.top;
            const count = 12;
            for (let i = 0; i < count; i++) {
                const p = document.createElement('div');
                p.className = 'carousel-particle';
                p.style.left = cx + 'px';
                p.style.top = cy + 'px';
                wrapper.appendChild(p);
                const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
                const dist = 50 + Math.random() * 80;
                gsap.to(p, {
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: 0,
                    scale: 0,
                    duration: 0.8 + Math.random() * 0.4,
                    ease: 'power2.out',
                    onComplete: () => p.remove()
                });
            }
        }

        // ── Mouse parallax on card images — silky follow ──
        function bindCardParallax(card) {
            card.addEventListener('mousemove', e => {
                const img = card.querySelector('img');
                if (!img) return;
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                gsap.to(img, { x: px * 12, y: py * 8, duration: 0.6, ease: 'power2.out' });
                // Subtle card tilt following mouse
                gsap.to(card, { rotateY: px * 6, rotateX: py * -4, duration: 0.6, ease: 'power2.out', transformPerspective: 1000, force3D: true });
            });
            card.addEventListener('mouseleave', () => {
                const img = card.querySelector('img');
                if (img) gsap.to(img, { x: 0, y: 0, duration: 0.8, ease: 'expo.out' });
                gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'expo.out' });
            });
        }

        // ── Magnetic buttons — springy feel ──
        [prevBtn, nextBtn].forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.3, ease: 'power2.out' });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
            });
        });

        // ── Update progress ──
        function updateProgress() {
            if (progressFill) progressFill.style.width = ((ci + 1) / realCount * 100) + '%';
            if (progressText) progressText.textContent = (ci + 1) + ' / ' + realCount;
        }

        // ── GSAP transition to card index ──
        function goTo(index) {
            if (animating || index === ci) return;
            animating = true;
            const prevCi = ci;
            ci = index;

            // Kill previous animations
            if (floatingTl) floatingTl.kill();
            if (glowTl) glowTl.kill();

            // Remove active class from old card
            cards[prevCi].classList.remove('active');

            const tl = gsap.timeline({
                onComplete: () => {
                    animating = false;
                    startFloating(cards[ci]);
                    startGlow(cards[ci]);
                    bindCardParallax(cards[ci]);
                }
            });

            cards.forEach((card, i) => {
                let diff = i - ci;
                if (diff > realCount / 2) diff -= realCount;
                else if (diff < -realCount / 2) diff += realCount;

                const abs = Math.abs(diff);
                const dir = diff > 0 ? 1 : -1;

                let targetX, targetScale, targetRotateY, targetRotateX, targetBlur, targetOpacity, targetZ;

                if (abs === 0) {
                    targetX = 0; targetScale = 1; targetRotateY = 0; targetRotateX = 0; targetBlur = 'blur(0px)';
                    targetOpacity = 1; targetZ = 10;
                } else if (abs === 1) {
                    targetX = dir * X_STEP; targetScale = 0.82; targetRotateY = dir * -22; targetRotateX = 0; targetBlur = 'blur(1.5px)';
                    targetOpacity = 0.5; targetZ = 5;
                } else if (abs === 2) {
                    targetX = dir * X_STEP * 1.9; targetScale = 0.62; targetRotateY = dir * -38; targetRotateX = 0; targetBlur = 'blur(3.5px)';
                    targetOpacity = 0.2; targetZ = 2;
                } else {
                    targetX = dir * X_STEP * 2.6; targetScale = 0.45; targetRotateY = 0; targetRotateX = 0; targetBlur = 'blur(5px)';
                    targetOpacity = 0; targetZ = 0;
                }

                const isCenter = abs === 0;
                const isEntering = (i === ci);
                const isLeaving = (i === prevCi && i !== ci);

                // Cinematic timing: smooth cascade with premium easings
                let dur, ease, delay;
                if (isLeaving) {
                    // Card leaving center: quick elegant exit
                    dur = 0.5; ease = 'expo.in'; delay = 0;
                } else if (isEntering) {
                    // Card entering center: dramatic, satisfying arrival
                    dur = 0.95; ease = 'expo.out'; delay = 0.18;
                    card.style.zIndex = 11; // above center during transition
                } else {
                    // Side cards: fluid repositioning
                    dur = 0.85; ease = 'power3.inOut';
                    delay = abs === 1 ? 0.06 : 0.12;
                }

                tl.to(card, {
                    x: targetX, scale: targetScale, rotateY: targetRotateY, rotateX: targetRotateX,
                    filter: targetBlur, opacity: targetOpacity, zIndex: targetZ,
                    duration: dur, ease: ease,
                    force3D: true, transformPerspective: 1000
                }, delay);

                card.style.pointerEvents = abs <= 2 ? 'auto' : 'none';

                if (isCenter) {
                    card.classList.add('active');
                    // Animate card info stagger — silky reveal sequence
                    const info = card.querySelector('.carousel-card-info');
                    const badge = card.querySelector('.badge');
                    const title = card.querySelector('h3');
                    const price = card.querySelector('.offer-price') || card.querySelector('.old-price');
                    const btn = card.querySelector('.add-to-cart');
                    const baseEase = 'expo.out';
                    if (info) tl.fromTo(info, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: baseEase }, 0.35);
                    if (badge) tl.fromTo(badge, { scale: 0.6, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2.2)' }, 0.4);
                    if (title) tl.fromTo(title, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: baseEase }, 0.46);
                    if (price) tl.fromTo(price, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: baseEase }, 0.53);
                    if (btn) tl.fromTo(btn, { y: 14, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, 0.6);
                }
            });

            // Spotlight move — smooth follow
            tl.to(spotlight, { left: '50%', duration: 0.9, ease: 'expo.out' }, 0);

            // Particles
            spawnParticles(cards[ci]);

            // Dots
            dotsC.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === ci));

            // Progress
            updateProgress();
        }

        function next() { goTo((ci + 1) % realCount); }
        function prev() { goTo((ci - 1 + realCount) % realCount); }

        // ── Card click ──
        cards.forEach((card, i) => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart')) return;
                if (i !== ci) { goTo(i); return; }
                const btn = card.querySelector('.add-to-cart');
                if (btn) window.openProductModal(btn.dataset.productId);
            });
        });

        // ── Button listeners ──
        nextBtn.addEventListener('click', next);
        prevBtn.addEventListener('click', prev);

        // ── Keyboard navigation ──
        document.addEventListener('keydown', e => {
            if (document.getElementById('productModal')?.classList.contains('active')) return;
            if (e.key === 'ArrowRight') next();
            else if (e.key === 'ArrowLeft') prev();
        });

        // ── Initial render (no animation) ──
        cards.forEach((card, i) => {
            let diff = i - ci;
            if (diff > realCount / 2) diff -= realCount;
            else if (diff < -realCount / 2) diff += realCount;
            const abs = Math.abs(diff);
            const dir = diff > 0 ? 1 : -1;
            gsap.set(card, {
                x: abs === 0 ? 0 : dir * X_STEP * (abs === 1 ? 1 : abs === 2 ? 1.9 : 2.6),
                scale: abs === 0 ? 1 : abs === 1 ? 0.82 : abs === 2 ? 0.62 : 0.45,
                rotateY: abs === 0 ? 0 : dir * (abs === 1 ? -22 : -38),
                opacity: abs === 0 ? 1 : abs === 1 ? 0.5 : abs === 2 ? 0.2 : 0,
                zIndex: abs === 0 ? 10 : abs === 1 ? 5 : abs === 2 ? 2 : 0,
                force3D: true,
                transformPerspective: 1000
            });
            card.style.pointerEvents = abs <= 2 ? 'auto' : 'none';
            card.classList.toggle('active', abs === 0);
        });
        updateProgress();
        startFloating(cards[0]);
        startGlow(cards[0]);
        bindCardParallax(cards[0]);

        // ── Auto-play ──
        let ap = setInterval(next, 5000);
        wrapper.addEventListener('mouseenter', () => clearInterval(ap));
        wrapper.addEventListener('mouseleave', () => { ap = setInterval(next, 5000); });

        // ── Touch swipe ──
        let tsx = 0;
        wrapper.addEventListener('touchstart', e => { tsx = e.changedTouches[0].screenX; clearInterval(ap); }, { passive: true });
        wrapper.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].screenX - tsx;
            if (Math.abs(dx) > 50) { dx > 0 ? prev() : next(); }
            wrapper.addEventListener('mouseleave', () => { ap = setInterval(next, 5000); }, { once: true });
        }, { passive: true });
    }

    // ─── CHECKOUT LOGIC ──────────────────────────────────────
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutModalClose = document.getElementById('checkoutModalClose');
    const checkoutForm = document.getElementById('checkoutForm');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');

    if (checkoutBtn && checkoutModal && checkoutModalClose && checkoutForm) {
        let shippingRates = {};
        async function loadRates() {
            try { const d = await db.collection('config').doc('shipping').get(); if (d.exists) shippingRates = d.data().rates || {}; } catch(e) {}
        }

        checkoutBtn.addEventListener('click', async () => {
            if (cart.length === 0) {
                showToast('Tu carrito está vacío', 'warning');
                return;
            }
            // Close cart sidebar and overlay
            document.getElementById('cartSidebar').classList.remove('active');
            document.getElementById('cartOverlay').classList.remove('active');
            
            // Open checkout modal
            checkoutModal.classList.add('active');
            gtag('event', 'begin_checkout', { currency: 'ARS', value: cart.reduce((s,i) => s + (Number(offerVal(i)) * i.qty), 0), items: cart.map(i => ({ item_id: i.id, item_name: i.name, price: Number(offerVal(i)), quantity: i.qty })) });
            await loadRates();
        });

        checkoutModalClose.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
        });

        // Close modal on clicking outside content
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                checkoutModal.classList.remove('active');
            }
        });

        function findRateForProvince(provName) {
            if (!provName) return null;
            const normSearch = provName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            
            // 1. Intentar coincidencia exacta normalizada (sin acentos, minúsculas)
            for (const key of Object.keys(shippingRates)) {
                const normKey = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                if (normKey === normSearch) {
                    return shippingRates[key];
                }
            }
            
            // 2. Intentar coincidencia con tarifa general o comodín configurado por el admin
            for (const key of Object.keys(shippingRates)) {
                const normKey = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                if (normKey === 'general' || normKey === 'default' || normKey === 'resto del pais' || normKey === 'resto del país') {
                    return shippingRates[key];
                }
            }
            
            // 3. Fallback seguro por defecto si no configuró nada en Firestore
            return { base: 6500, perKg: 1200 };
        }

        document.getElementById('checkoutProvince').addEventListener('change', function() {
            const prov = this.value;
            const display = document.getElementById('shippingEstimate');
            const costEl = document.getElementById('shippingCostDisplay');
            const rate = findRateForProvince(prov);
            if (rate) {
                const totalKg = cart.reduce((s, i) => {
                    const p = products.find(x => x.id === i.id);
                    return s + ((p && p.peso) || 0.5) * i.qty;
                }, 0);
                const cost = rate.base + rate.perKg * totalKg;
                costEl.textContent = '$' + cost.toLocaleString('es-AR', { minimumFractionDigits: 2 });
                display.style.display = 'block';
            } else {
                display.style.display = 'none';
            }
        });

        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (cart.length === 0) {
                showToast('Tu carrito está vacío', 'warning');
                return;
            }

            confirmPaymentBtn.textContent = 'Procesando...';
            confirmPaymentBtn.disabled = true;

            try {
                // Extract client shipping info
                const customer = {
                    name: document.getElementById('checkoutName').value.trim(),
                    dni: document.getElementById('checkoutDni').value.trim(),
                    phone: document.getElementById('checkoutPhone').value.trim(),
                    email: document.getElementById('checkoutEmail').value.trim(),
                    province: document.getElementById('checkoutProvince').value.trim(),
                    city: document.getElementById('checkoutCity').value.trim(),
                    address: document.getElementById('checkoutAddress').value.trim(),
                    zip: document.getElementById('checkoutZip').value.trim()
                };

                // Check if running on GitHub Pages
                if (window.location.hostname.includes('github.io')) {
                    showToast('El servidor de pagos funciona a través de Vercel.', 'warning');
                    confirmPaymentBtn.textContent = 'Confirmar y Continuar al Pago';
                    confirmPaymentBtn.disabled = false;
                    return;
                }

                // Calculate shipping if rate available
                const provField = document.getElementById('checkoutProvince').value.trim();
                const rate = findRateForProvince(provField);
                let shippingCost = 0;
                if (rate) {
                    const totalKg = cart.reduce((s, i) => {
                        const p = products.find(x => x.id === i.id);
                        return s + ((p && p.peso) || 0.5) * i.qty;
                    }, 0);
                    shippingCost = rate.base + rate.perKg * totalKg;
                }

                // Save pending order to Firestore
                const orderRef = await db.collection('orders').add({
                    customer: customer,
                    cart: cart.map(item => {
                        const p = products.find(x => x.id === item.id);
                        const costCurrency = (p && p.costCurrency) || 'ARS';
                        const cost = (p && p.cost) || 0;
                        const costARS = costCurrency === 'USD' ? cost * (usdRateARS || 0) : cost;
                        return {
                            id: item.id,
                            name: item.name,
                            price: Number(offerVal(item)),
                            qty: item.qty,
                            cost: cost,
                            costCurrency: costCurrency,
                            costARS: costARS,
                            margin: (p && p.margin) || 0
                        };
                    }),
                    status: 'initiated',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    total: cart.reduce((sum, item) => sum + (Number(offerVal(item)) * item.qty), 0),
                    shippingCost: shippingCost,
                    shippingProvince: provField
                });

                const orderId = orderRef.id;

                // Send orderId and cart to Vercel checkout API
                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cart, orderId })
                });

                const data = await response.json();

                if (response.ok && data.init_point) {
                    // Redirect to Mercado Pago checkout
                    window.location.href = data.init_point;
                } else {
                    console.error('Error de Mercado Pago:', data);
                    showToast('No se pudo procesar el pago: ' + (data.message || 'Error desconocido'), 'error', 5000);
                    confirmPaymentBtn.textContent = 'Confirmar y Continuar al Pago';
                    confirmPaymentBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error de red/db:', error);
                showToast('Error al registrar el pedido o conectar con el servidor de pagos.', 'error', 5000);
                confirmPaymentBtn.textContent = 'Confirmar y Continuar al Pago';
                confirmPaymentBtn.disabled = false;
            }
        });
    }

    // ─── FILTER TABS & MODALS (Dynamic Initialization) ────────
    function initProductFiltersAndModals() {
        try {
        const tabs = document.querySelectorAll('.filter-tab');
        
        // Remove old active states
        tabs.forEach(tab => {
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
        });
        const freshTabs = document.querySelectorAll('.filter-tab');

        freshTabs.forEach(tab => tab.addEventListener('click', () => {
            freshTabs.forEach(btn => btn.classList.remove('active'));
            tab.classList.add('active');
            renderProducts();
        }));

        // ─── SORT & PRICE FILTER EVENTS ──────────────────────────────
        const sortSelect = document.getElementById('sortSelect');
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        [sortSelect].forEach(el => { if (el) el.addEventListener('change', renderProducts); });
        [priceMin, priceMax].forEach(el => { if (el) el.addEventListener('input', renderProducts); });

        // ─── PRODUCT MODAL BINDINGS ─────────────────────────────
        const modal = document.getElementById('productModal');
        const mImg = document.getElementById('modalMainImg');
        const mTh = document.getElementById('modalThumbs');
        const mCat = document.getElementById('modalCategory');
        const mTit = document.getElementById('modalTitle');
        const mPr = document.getElementById('modalPrice');
        const mDesc = document.getElementById('modalDescription');

        window.openProductModal = function(prodId) {
            try {
            const p = products.find(x => x.id === prodId);
            if (!p) return;
            const modalEl = document.getElementById('productModal');
            const mImg = document.getElementById('modalMainImg');
            const mTh = document.getElementById('modalThumbs');
            const mCat = document.getElementById('modalCategory');
            const mTit = document.getElementById('modalTitle');
            const mPr = document.getElementById('modalPrice');
            const mDesc = document.getElementById('modalDescription');
            const prevBtn = document.getElementById('modalPrev');
            const nextBtn = document.getElementById('modalNext');

            mCat.textContent = p.category;
            mTit.textContent = p.name;
            const hasDiscount = hasOffer(p);
            mPr.innerHTML = hasDiscount 
                ? `<span style="text-decoration: line-through; font-size: 0.85em; color: var(--text-secondary); margin-right: 8px;">$${fmt(p.price)}</span><span class="accent">$${fmt(p.offerPrice)}</span>`
                : `$${fmt(offerVal(p))}`;
            mDesc.textContent = p.description || '';
            const descWrap = document.getElementById('modalDescWrap');
            const descToggle = document.getElementById('modalDescToggle');
            // Reiniciar estado: recortar si la descripción supera el alto visible
            descWrap.classList.remove('collapsed');
            descWrap.classList.toggle('has-more', mDesc.scrollHeight > 150);
            if (mDesc.scrollHeight > 150) {
                descWrap.classList.add('collapsed');
                descToggle.textContent = 'Ver más';
            }
            
            let imgs;
            try { imgs = p.fullImages ? JSON.parse(p.fullImages) : null; } catch(e) { imgs = null; }
            if (!imgs || !imgs.length) imgs = [p.image];
            
            mImg.src = imgs[0];
            mTh.innerHTML = '';
            if (imgs.length > 1) {
                imgs.forEach((s, i) => {
                    const t = document.createElement('div'); t.classList.add('modal-thumb'); if (i === 0) t.classList.add('active');
                    const im = document.createElement('img'); im.src = s; t.appendChild(im);
                    t.addEventListener('click', () => { mImg.src = s; mTh.querySelectorAll('.modal-thumb').forEach(x => x.classList.remove('active')); t.classList.add('active'); });
                    mTh.appendChild(t);
                });
            }
            modalEl.classList.add('active'); document.body.style.overflow = 'hidden';
            try { gtag('event', 'view_item', { currency: 'ARS', value: offerVal(p), items: [{ item_id: p.id, item_name: p.name, price: offerVal(p) }] }); } catch(e) {}
            
            // Re-bind the "Añadir al Carrito" inside modal with premium animation
            const addBtn = modalEl.querySelector('.modal-add-cart');
            const newAddBtn = addBtn.cloneNode(true);
            addBtn.parentNode.replaceChild(newAddBtn, addBtn);
            
            // Setup button inner structure for animation
            newAddBtn.classList.remove('cart-adding', 'cart-added-success');
            newAddBtn.style.position = 'relative';
            newAddBtn.style.overflow = 'visible';
            newAddBtn.innerHTML = `<span class="cart-btn-text">Agregar al Carrito</span><span class="cart-check-icon"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></span>`;
            
            // Ensure modal-content has position:relative for the overlay
            const modalContent = modalEl.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.position = 'relative';
                const existingOverlay = modalContent.querySelector('.modal-cart-success-overlay');
                if (existingOverlay) {
                    existingOverlay.classList.remove('active');
                }
            }
            
            newAddBtn.addEventListener('click', () => {
                console.log("Agregar al carrito desde modal para ID:", p.id, "Carrito actual:", JSON.stringify(cart));
                // Prevent double-click
                if (newAddBtn.classList.contains('cart-adding') || newAddBtn.classList.contains('cart-added-success')) return;
                
                // 1. Add to cart (data)
                const product = products.find(x => x.id === p.id);
                if (!product) {
                    console.error("Producto no encontrado en products para ID en modal:", p.id);
                    return;
                }
                const existing = cart.find(item => item.id === p.id);
                if (existing) { existing.qty++; } else { cart.push({ ...product, qty: 1 }); }
                saveCart();
                try { gtag('event', 'add_to_cart', { currency: 'ARS', value: offerVal(product), items: [{ item_id: product.id, item_name: product.name, price: offerVal(product), quantity: 1 }] }); } catch(e) {}
                showToast(`${product.name} agregado al carrito`, 'success');
                
                // 2. Button morph: adding state (sparkle ring)
                newAddBtn.classList.add('cart-adding');
                
                // 3. Spawn confetti particles from button
                spawnConfetti(newAddBtn);
                
                // 4. After short delay, transition to success state
                setTimeout(() => {
                    newAddBtn.classList.remove('cart-adding');
                    newAddBtn.classList.add('cart-added-success');
                }, 350);
                
                // 5. Show success overlay inside modal
                let overlay = modalContent.querySelector('.modal-cart-success-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'modal-cart-success-overlay';
                    overlay.innerHTML = `
                        <div class="success-ring"></div>
                        <div class="success-text">¡Agregado al carrito!</div>
                        <div class="success-subtext">${product.name}</div>
                    `;
                    modalContent.appendChild(overlay);
                } else {
                    overlay.querySelector('.success-subtext').textContent = product.name;
                    // Reset animations by re-cloning inner elements
                    const ring = overlay.querySelector('.success-ring');
                    const newRing = ring.cloneNode(true);
                    ring.parentNode.replaceChild(newRing, ring);
                    const txt = overlay.querySelector('.success-text');
                    const newTxt = txt.cloneNode(true);
                    txt.parentNode.replaceChild(newTxt, txt);
                    const sub = overlay.querySelector('.success-subtext');
                    const newSub = sub.cloneNode(true);
                    sub.parentNode.replaceChild(newSub, sub);
                }
                
                setTimeout(() => overlay.classList.add('active'), 450);
                
                // 6. Launch flying image to cart using unified flyToCart
                flyToCart(newAddBtn);
                
                // 7. Close modal and open cart after the full animation plays
                setTimeout(() => {
                    overlay.classList.remove('active');
                    closeM();
                    setTimeout(openCart, 350);
                }, 1800);
            });

            // Navigation between visible products
            const activeFilter = document.querySelector('.filter-tab.active')?.dataset?.filter || 'all';
            const visibleProducts = activeFilter === 'all'
                ? products
                : products.filter(x => x.category === activeFilter);
            const currentIdx = visibleProducts.findIndex(x => x.id === prodId);

            if (visibleProducts.length <= 1) {
                prevBtn.classList.add('hidden');
                nextBtn.classList.add('hidden');
            } else {
                prevBtn.classList.remove('hidden');
                nextBtn.classList.remove('hidden');
                const prevId = visibleProducts[(currentIdx - 1 + visibleProducts.length) % visibleProducts.length].id;
                const nextId = visibleProducts[(currentIdx + 1) % visibleProducts.length].id;
                prevBtn.onclick = (e) => { e.stopPropagation(); window.openProductModal(prevId); };
                nextBtn.onclick = (e) => { e.stopPropagation(); window.openProductModal(nextId); };
            }

            // Load reviews for this product
            loadPublicReviews(prodId);
            initReviewForm(prodId);

            } catch(e) { console.error('Error en openProductModal:', e); }
        };

        // ─── PUBLIC REVIEWS SYSTEM ──────────────────────────────
        let currentReviewProductId = null;
        let selectedStars = 0;

        // ─── BAD WORD FILTER ───────────────────────────────────
        const BAD_WORDS = [
            'puto', 'puta', 'putas', 'putos', 'p3t0', 'p3ta',
            'mierda', 'm13rd4',
            'pendejo', 'pendeja',
            'culo', 'kulo', 'cul0',
            'choto', 'chota',
            'pelotudo', 'pelotuda', 'pelotudo', 'pelotudez', 'p3l0tud0',
            'concha', 'conchudo', 'conchuda', 'c0nch4',
            'verga', 'v3rg4', 'verg4',
            'pija', 'pij4', 'p1ja',
            'coño', 'c0ñ0', 'conyo',
            'hijueputa', 'hijoputa', 'hijaputa', 'hdp',
            'marica', 'maricon', 'maricón', 'maric0n',
            'estupido', 'estupida', 'estúpido', 'estúpida',
            'idiota', 'id10ta',
            'imbecil', 'imbécil', '1mb3c1l',
            'tarado', 'tarada',
            'boludo', 'boluda', 'b0lud0',
            'forro', 'f0rr0',
            'mogólico', 'mogolica',
            'subnormal',
            'trolo', 'trola',
            'putazo', 'putaza',
            'cagar', 'cagaste', 'cagon', 'cagón', 'cagona',
            'recontra', 'la concha', 'la ctm', 'ctm',
            'chupame', 'chupamela', 'chupame la',
            'sorete',
            'caca', 'pedo', 'pis',
            'cerdo', 'cerda',
            'hijo de puta', 'hija de puta',
            'la reputa', 'reputa',
            'burgués', 'burguesa',
            'negro de mierda', 'negra de mierda',
            'muérete', 'muere', 'matate', 'mátate'
        ];

        function normalizeText(text) {
            let t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            t = t.replace(/@/g, 'a').replace(/4/g, 'a').replace(/3/g, 'e').replace(/1/g, 'i').replace(/0/g, 'o').replace(/5/g, 's').replace(/7/g, 't').replace(/2/g, 'z');
            t = t.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
            return t;
        }

        function containsBadWords(text) {
            const normalized = normalizeText(text);
            return BAD_WORDS.some(bw => normalized.includes(bw));
        }

        function loadPublicReviews(prodId) {
            const list = document.getElementById('modalReviewsList');
            const empty = document.getElementById('modalReviewsEmpty');
            const countEl = document.getElementById('modalReviewCount');
            if (!list) return;
            list.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:.85rem;padding:.5rem">Cargando opiniones...</div>';
            if (empty) empty.style.display = 'none';

            db.collection("products").doc(prodId).collection("reviews").orderBy("date", "desc").limit(30).get()
                .then(snap => {
                    list.innerHTML = '';
                    if (snap.empty) {
                        if (empty) empty.style.display = '';
                        if (countEl) countEl.textContent = '';
                        return;
                    }
                    if (countEl) countEl.textContent = `(${snap.size})`;
                    snap.forEach(doc => {
                        const r = doc.data();
                        const dateStr = r.date?.toDate?.() ? r.date.toDate().toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                        const card = document.createElement('div');
                        card.className = 'review-card';
                        card.innerHTML = `
                            <div class="review-card-header">
                                <strong>${r.userName || 'Anónimo'}</strong>
                                <span>${dateStr}</span>
                            </div>
                            <div class="stars">${renderStarsHtml(r.rating)}</div>
                            ${r.comment ? `<p>${r.comment}</p>` : ''}
                        `;
                        list.appendChild(card);
                    });
                })
                .catch(e => {
                    console.error(e);
                    list.innerHTML = '<div style="text-align:center;color:#ff4757;font-size:.85rem;padding:.5rem">Error al cargar opiniones</div>';
                });
        }

        function initReviewForm(prodId) {
            currentReviewProductId = prodId;
            selectedStars = 0;

            // Reset form
            const formContainer = document.getElementById('reviewFormContainer');
            const form = document.getElementById('publicReviewForm');
            const toggleBtn = document.getElementById('toggleReviewForm');
            if (formContainer) formContainer.style.display = 'none';
            if (toggleBtn) toggleBtn.textContent = 'Dejar mi reseña';
            if (form) form.reset();

            // Reset stars
            document.querySelectorAll('#starPicker .pick-star').forEach(s => s.classList.remove('active'));

            // Toggle button
            if (toggleBtn) {
                const newToggle = toggleBtn.cloneNode(true);
                toggleBtn.parentNode.replaceChild(newToggle, toggleBtn);
                newToggle.addEventListener('click', () => {
                    const isHidden = formContainer.style.display === 'none';
                    formContainer.style.display = isHidden ? '' : 'none';
                    newToggle.textContent = isHidden ? 'Cancelar' : 'Dejar mi reseña';
                });
            }

            // Form submission
            if (form) {
                const newForm = form.cloneNode(true);
                form.parentNode.replaceChild(newForm, form);
                // Re-init star picker on cloned form
                document.querySelectorAll('#starPicker .pick-star').forEach(star => {
                    star.addEventListener('click', () => {
                        selectedStars = parseInt(star.dataset.star);
                        document.querySelectorAll('#starPicker .pick-star').forEach(s => {
                            s.classList.toggle('active', parseInt(s.dataset.star) <= selectedStars);
                        });
                    });
                    star.addEventListener('mouseenter', () => {
                        const val = parseInt(star.dataset.star);
                        document.querySelectorAll('#starPicker .pick-star').forEach(s => {
                            s.classList.toggle('hover', parseInt(s.dataset.star) <= val);
                        });
                    });
                    star.addEventListener('mouseleave', () => {
                        document.querySelectorAll('#starPicker .pick-star').forEach(s => s.classList.remove('hover'));
                    });
                });

                newForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    if (selectedStars === 0) {
                        showToast('Elegí una calificación de 1 a 5 estrellas.', 'warning');
                        return;
                    }

                    const userName = document.getElementById('reviewUserName').value.trim() || 'Anónimo';
                    const comment = document.getElementById('reviewComment').value.trim();
                    const submitBtn = newForm.querySelector('.submit-review-btn');

                    // Bad word filter
                    if (containsBadWords(userName) || containsBadWords(comment)) {
                        showToast('Tu reseña contiene lenguaje inapropiado. Por favor, editá tu mensaje.', 'error');
                        return;
                    }

                    submitBtn.textContent = 'Enviando...';
                    submitBtn.disabled = true;

                    // Sign in anonymously (anti-spam)
                    const auth = firebase.auth();
                    let user = auth.currentUser;
                    if (!user) {
                        try { const cred = await auth.signInAnonymously(); user = cred.user; }
                        catch(e) { console.error('Auth error:', e); showToast('Error de autenticación', 'error'); submitBtn.textContent = 'Enviar reseña'; submitBtn.disabled = false; return; }
                    }

                    // Check if user already reviewed this product
                    const existingDoc = await db.collection("products").doc(currentReviewProductId).collection("reviews").doc(user.uid).get();
                    if (existingDoc.exists) {
                        showToast('Ya opinaste sobre este producto.', 'warning');
                        submitBtn.textContent = 'Enviar reseña';
                        submitBtn.disabled = false;
                        return;
                    }

                    // Create review using userId as doc ID (prevents duplicates at DB level)
                    try {
                        await db.collection("products").doc(currentReviewProductId).collection("reviews").doc(user.uid).set({
                            userId: user.uid,
                            userName: userName,
                            rating: selectedStars,
                            comment: comment,
                            date: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    } catch(err) {
                        console.error('Error guardando reseña:', err);
                        showToast('Hubo un error al enviar tu reseña. Intentá de nuevo.', 'error');
                        submitBtn.textContent = 'Enviar reseña';
                        submitBtn.disabled = false;
                        return;
                    }

                    // Show success immediately
                    showToast('¡Gracias por tu opinión!', 'success');
                    document.getElementById('reviewFormContainer').style.display = 'none';
                    const togBtn = document.getElementById('toggleReviewForm');
                    if (togBtn) togBtn.textContent = 'Dejar mi reseña';

                    // Refresh reviews and recalculate (fire-and-forget, can't fail the UX)
                    try {
                        loadPublicReviews(currentReviewProductId);
                        const snap = await db.collection("products").doc(currentReviewProductId).collection("reviews").get();
                        let total = 0, count = 0;
                        snap.forEach(d => { total += d.data().rating || 0; count++; });
                        const avg = count > 0 ? total / count : 0;
                        const localProd = products.find(x => x.id === currentReviewProductId);
                        if (localProd) { localProd.rating = avg; localProd.reviewCount = count; }
                        renderProducts();
                        try { await db.collection("products").doc(currentReviewProductId).update({ rating: avg, reviewCount: count }); } catch(e) {}
                    } catch(e) { console.error('Review post-processing error:', e); }

                    submitBtn.textContent = 'Enviar reseña';
                    submitBtn.disabled = false;
                });
            }
        }

        function closeM() { document.getElementById('productModal').classList.remove('active'); document.body.style.overflow = ''; }

        // Modal global listeners
        const liveModal = document.getElementById('productModal');
        const newModal = liveModal.cloneNode(true);
        liveModal.parentNode.replaceChild(newModal, liveModal);
        newModal.addEventListener('click', e => { if (e.target === newModal || e.target.closest('#modalClose')) { closeM(); } });

        // "Ver más" en la descripción del modal: expande/colapsa con fade
        const descToggle = document.getElementById('modalDescToggle');
        if (descToggle) {
            descToggle.addEventListener('click', () => {
                const wrap = document.getElementById('modalDescWrap');
                const isCollapsed = wrap.classList.contains('collapsed');
                wrap.classList.toggle('collapsed');
                descToggle.textContent = isCollapsed ? 'Ver menos' : 'Ver más';
            });
        }
        } catch(e) { console.error('Error en initProductFiltersAndModals:', e); }
    }
    
    document.addEventListener('keydown', e => { 
        const m = document.getElementById('productModal'); 
        if (!m || !m.classList.contains('active')) return;
        if (e.key === 'Escape') { 
            m.classList.remove('active'); document.body.style.overflow = '';
        } else if (e.key === 'ArrowLeft') {
            const prev = document.getElementById('modalPrev');
            if (prev && !prev.classList.contains('hidden')) prev.click();
        } else if (e.key === 'ArrowRight') {
            const next = document.getElementById('modalNext');
            if (next && !next.classList.contains('hidden')) next.click();
        }
    });

    document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
        productPage++;
        renderPage();
    });

    // Event delegation for product grid (card click and add-to-cart)
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        productGrid.addEventListener('click', function(e) {
            try {
            const card = e.target.closest('.product-card');
            if (!card) return;
            const id = card.dataset.id;
            if (!id) return;
            if (e.target.closest('.add-to-cart')) {
                if (typeof window.addToCart === 'function') window.addToCart(id, e.target.closest('.add-to-cart')); else console.warn('addToCart no disponible');
                return;
            }
            if (typeof window.openProductModal === 'function') window.openProductModal(id); else console.warn('openProductModal no disponible, esperá a que carguen los productos');
            } catch(e) { console.error('Error al hacer clic en tarjeta:', e); }
        });
    }
    // ─── MOBILE NAV HIDE/HELPER FOR SEARCH ──────────────
    function setMNav(h) {
        const e = document.getElementById('mobileNav');
        if (e) e.style.display = h ? 'none' : '';
    }

    // ─── SEARCH BAR LOGIC ───────────────────────────────────
    const searchToggle = document.getElementById('searchToggle');
    const searchDropdown = document.getElementById('searchDropdown');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (searchToggle) {
        searchToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            searchDropdown.classList.toggle('active');
            if (searchDropdown.classList.contains('active')) {
                setTimeout(() => searchInput.focus(), 100);
                setMNav(1);
            } else {
                setMNav(0);
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                searchDropdown.classList.remove('active');
                setMNav(0);
            }
        });

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            searchResults.innerHTML = '';

            if (query.length < 2) {
                searchResults.innerHTML = '<div class="search-no-results">Escribe al menos 2 caracteres...</div>';
                return;
            }

            const matches = products
                .filter(p => p.isActive !== false)
                .filter(p =>
                    p.name.toLowerCase().includes(query) ||
                    p.category.toLowerCase().includes(query) ||
                    (p.description && p.description.toLowerCase().includes(query))
                );

            if (matches.length === 0) {
                searchResults.innerHTML = '<div class="search-no-results">No se encontraron productos 😕</div>';
                return;
            }

            matches.slice(0, 8).forEach(p => {
                const item = document.createElement('div');
                item.classList.add('search-result-item');
                const displayPrice = (hasOffer(p)) ? p.offerPrice : p.price;
                item.innerHTML = `
                    <img src="${p.image}" alt="${p.name}">
                    <div class="search-result-info">
                        <h4>${p.name}</h4>
                        <p>$${fmt(displayPrice)}</p>
                    </div>
                `;
                item.addEventListener('click', () => {
                    searchDropdown.classList.remove('active');
                    searchInput.value = '';
                    setMNav(0);
                    window.openProductModal(p.id);
                });
                searchResults.appendChild(item);
            });
        });
    }

    // ─── HERO SEARCH BAR ───────────────────────────────────
    const heroSearchInput = document.getElementById('heroSearchInput');
    const heroSearchResults = document.getElementById('heroSearchResults');
    const heroSearchForm = document.getElementById('heroSearch');
    if (heroSearchInput && heroSearchResults) {
        const renderHeroResults = (q) => {
            q = q.toLowerCase().trim();
            heroSearchResults.innerHTML = '';
            if (q.length < 2) { heroSearchResults.classList.remove('active'); setMNav(0); return; }
            const matches = products.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                (p.description && p.description.toLowerCase().includes(q))
            );
            if (matches.length === 0) {
                heroSearchResults.innerHTML = '<div class="search-no-results">No se encontraron productos 😕</div>';
            } else {
                matches.slice(0, 8).forEach(p => {
                    const item = document.createElement('div');
                    item.classList.add('search-result-item');
                    const displayPrice = (hasOffer(p)) ? p.offerPrice : p.price;
                    item.innerHTML = `
                        <img src="${p.image}" alt="${p.name}">
                        <div class="search-result-info"><h4>${p.name}</h4><p>$${fmt(displayPrice)}</p></div>
                    `;
                    item.addEventListener('click', () => {
                        heroSearchResults.classList.remove('active');
                        heroSearchInput.value = '';
                        setMNav(0);
                        if (typeof window.openProductModal === 'function') window.openProductModal(p.id);
                    });
                    heroSearchResults.appendChild(item);
                });
            }
            heroSearchResults.classList.add('active');
            setMNav(1);
        };
        heroSearchInput.addEventListener('input', () => renderHeroResults(heroSearchInput.value));
        heroSearchInput.addEventListener('focus', () => { if (heroSearchInput.value.trim().length >= 2) { heroSearchResults.classList.add('active'); setMNav(1); } });
        document.addEventListener('click', (e) => { if (!e.target.closest('.hero-search')) { heroSearchResults.classList.remove('active'); setMNav(0); } });
        if (heroSearchForm) {
            heroSearchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                heroSearchResults.classList.remove('active');
                setMNav(0);
                const target = document.getElementById('products');
                if (target) {
                    const offset = window.innerWidth < 768 ? 80 : 70;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    if (typeof smoother !== 'undefined' && smoother) smoother.scrollTo(top, true); else window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        }
    }

    // ─── NAVBAR HIDE/SHOW ON SCROLL ─────────────────────────
    let lastSY = 0;
    window.addEventListener('scroll', () => {
        const sy = window.scrollY;
        if (sy > lastSY && sy > 100) {
            navbar.classList.add('nav-hidden');
        } else {
            navbar.classList.remove('nav-hidden');
        }
        lastSY = sy;
    });

    // ─── SMOOTH SCROLL OFFSET (navbar fixed) ─────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const isInstant = this.hasAttribute('data-instant');
            const offset = window.innerWidth < 768 ? 80 : 70;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            if (smoother) {
                smoother.scrollTo(top, !isInstant);
            } else {
                if (isInstant) window.scrollTo(0, top);
                else window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ─── MOBILE BOTTOM NAVBAR ────────────────────────────────
    const mobileNav = document.getElementById('mobileNav');
    const mobileCartBtn = document.getElementById('mobileCartBtn');
    const mobileCartCount = document.getElementById('mobileCartCount');
    if (mobileCartBtn) {
        mobileCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCart();
        });
    }
    // Active section tracking for mobile nav
    function updateMobileNav() {
        if (!mobileNav) return;
        const sections = ['home', 'carousel', 'products', 'contact'];
        const scrollY = window.scrollY + 150;
        let current = 'home';
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.offsetTop <= scrollY) current = id;
        });
        mobileNav.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === current);
        });
    }
    window.addEventListener('scroll', updateMobileNav);
    // Sync mobile cart count
    const origRenderCart = renderCart;
    renderCart = function() {
        origRenderCart();
        if (mobileCartCount) mobileCartCount.textContent = document.getElementById('cartCount')?.textContent || '0';
    };

    // ─── ANIMATED STAT COUNTERS ──────────────────────────────
    const statNums = document.querySelectorAll('.stat-number');
    const countObs = new IntersectionObserver(es => {
        es.forEach(e => {
            if (e.isIntersecting) {
                const el = e.target;
                const target = +el.dataset.target;
                const dur = 2000;
                const start = performance.now();
                function tick(now) {
                    const p = Math.min((now - start) / dur, 1);
                    const ease = 1 - Math.pow(1 - p, 3);
                    el.textContent = Math.floor(ease * target).toLocaleString();
                    if (p < 1) requestAnimationFrame(tick);
                    else el.textContent = target.toLocaleString();
                }
                requestAnimationFrame(tick);
                countObs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    statNums.forEach(n => countObs.observe(n));

    // ─── PARALLAX OUTLINE TEXT ───────────────────────────────
    // Handled by ScrollSmoother via data-speed="0.92" on .outline-text-section
});

// Keyframes injection
const st = document.createElement('style');
st.textContent = `@keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`;
document.head.appendChild(st);

// ─── SMOOTH SCROLL + PARALLAX + SCROLL GRADIENT ───────────
(function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollSmoother !== 'undefined') {
        gsap.registerPlugin(ScrollSmoother);
        const isMobile = () => window.innerWidth < 768;
        smoother = ScrollSmoother.create({
            wrapper: '#smooth-wrapper',
            content: '#smooth-content',
            smooth: isMobile() ? 0 : 1.2,
            smoothTouch: 0,
            effects: !isMobile(),
            normalizeScroll: false
        });
    }

    // ── Scroll-linked background gradient (visual journey) ──
    const bgGradient = document.getElementById('bgGradient');
    if (bgGradient) {
        // Color stops: [progress, topColor, bottomColor] — subtle dark tints
        const stops = [
            { p: 0.00, a: '#050507', b: '#0a0e1a' }, // hero (cyan deep)
            { p: 0.16, a: '#050507', b: '#0a0a14' }, // showcase
            { p: 0.34, a: '#0a0712', b: '#140a1f' }, // categorías (purple)
            { p: 0.50, a: '#050507', b: '#0a0e1a' }, // carousel
            { p: 0.66, a: '#0a0712', b: '#140a1f' }, // stats (purple)
            { p: 0.84, a: '#05070a', b: '#0a141a' }, // products (cyan)
            { p: 1.00, a: '#050507', b: '#070710' }  // footer
        ];
        const lerp = (c1, c2, t) => gsap.utils.interpolate(c1, c2, t);
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            onUpdate: (self) => {
                const p = self.progress;
                let i = 0;
                while (i < stops.length - 1 && p > stops[i + 1].p) i++;
                const seg = stops[i];
                const next = stops[Math.min(i + 1, stops.length - 1)];
                const localT = seg.p === next.p ? 0 : (p - seg.p) / (next.p - seg.p);
                const c1 = lerp(seg.a, next.a, localT);
                const c2 = lerp(seg.b, next.b, localT);
                bgGradient.style.background = `linear-gradient(180deg, ${c1} 0%, ${c2} 100%)`;
            }
        });
    }

    // ─── PREMIUM SCROLL ANIMATIONS ─────────────────────────
    const isMobileGsap = () => window.innerWidth < 768;

    // Hero orbs parallax
    document.querySelectorAll('.hero-visual [data-speed]').forEach(el => {
        const speed = parseFloat(el.dataset.speed) || 1;
        gsap.to(el, {
            y: () => (1 - speed) * 200,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5
            }
        });
    });

    // Product cards stagger reveal with GSAP ScrollTrigger
    ScrollTrigger.batch('.product-card', {
        onEnter: (elements) => {
            gsap.fromTo(elements,
                { opacity: 0, y: 50, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out', overwrite: true }
            );
        },
        start: 'top 90%',
        once: true
    });

    // Stats section stagger
    ScrollTrigger.batch('.stat-card', {
        onEnter: (elements) => {
            gsap.fromTo(elements,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out' }
            );
        },
        start: 'top 85%',
        once: true
    });

    // ─── BACK TO TOP BUTTON ─────────────────────────────────
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top -400',
            end: 'top -400',
            onEnter: () => backToTop.classList.add('visible'),
            onLeaveBack: () => backToTop.classList.remove('visible')
        });
        backToTop.addEventListener('click', () => {
            if (smoother) {
                smoother.scrollTo(0, { duration: 0, ease: 'none' });
            } else {
                window.scrollTo({ top: 0, behavior: 'instant' });
            }
        });
    }
})();

// ─── INTERACTIVE BACKGROUND (THREE.JS 3D) ─────────────────
(function () {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas || typeof THREE === 'undefined') return;
    const isMobile = () => innerWidth < 768;

    let w = innerWidth, h = innerHeight;
    let mx = 0, my = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile() ? 1 : 2));
    renderer.setClearColor(0x000000, 0);

    addEventListener('resize', () => {
        w = innerWidth; h = innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    document.addEventListener('mousemove', e => {
        mx = (e.clientX / w - 0.5) * 2;
        my = (e.clientY / h - 0.5) * 2;
    });

    // ── Particle system ──
    const count = isMobile() ? 50 : 120;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = [];

    const palette = [
        [0, 0.94, 1],      // cyan
        [0.54, 0.17, 0.89], // purple
        [1, 1, 1],           // white
        [0, 0.94, 1],       // cyan
        [1, 1, 1],           // white
    ];

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 100;
        positions[i3 + 1] = (Math.random() - 0.5) * 100;
        positions[i3 + 2] = (Math.random() - 0.5) * 60;
        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i3] = c[0];
        colors[i3 + 1] = c[1];
        colors[i3 + 2] = c[2];
        sizes[i] = 0.5 + Math.random() * 2.5;
        speeds.push({
            vx: (Math.random() - 0.5) * 0.02,
            vy: (Math.random() - 0.5) * 0.015,
            vz: (Math.random() - 0.5) * 0.01,
            phase: Math.random() * Math.PI * 2,
            twinkle: 0.003 + Math.random() * 0.01
        });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const vertexShader = `
        attribute float size;
        varying vec3 vColor;
        void main() {
            vColor = color;
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (55.0 / -mvPos.z);
            gl_Position = projectionMatrix * mvPos;
        }
    `;
    const fragmentShader = `
        varying vec3 vColor;
        void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float alpha = 1.0 - smoothstep(0.0, 0.5, d);
            gl_FragColor = vec4(vColor, alpha * 0.7);
        }
    `;

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ── Nebula blobs (desktop only) ──
    const nebulae = [];
    if (!isMobile()) {
        for (let i = 0; i < 3; i++) {
            const geo = new THREE.SphereGeometry(8 + Math.random() * 12, 16, 16);
            const col = i % 2 === 0 ? 0x00f0ff : 0x8a2be2;
            const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.015 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, -20 - Math.random() * 20);
            scene.add(mesh);
            nebulae.push({ mesh, vx: (Math.random() - 0.5) * 0.01, vy: (Math.random() - 0.5) * 0.008 });
        }
    }

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time++;

        // Camera follows mouse smoothly
        camera.position.x += (mx * 4 - camera.position.x) * 0.03;
        camera.position.y += (-my * 3 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);

        // Animate particles
        const pos = geometry.attributes.position.array;
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const s = speeds[i];
            pos[i3] += s.vx;
            pos[i3 + 1] += s.vy;
            pos[i3 + 2] += s.vz;
            if (pos[i3] < -55) pos[i3] = 55;
            if (pos[i3] > 55) pos[i3] = -55;
            if (pos[i3 + 1] < -55) pos[i3 + 1] = 55;
            if (pos[i3 + 1] > 55) pos[i3 + 1] = -55;
            if (pos[i3 + 2] < -35) pos[i3 + 2] = 35;
            if (pos[i3 + 2] > 35) pos[i3 + 2] = -35;
        }
        geometry.attributes.position.needsUpdate = true;

        // Animate nebulae
        for (const n of nebulae) {
            n.mesh.position.x += n.vx;
            n.mesh.position.y += n.vy;
            if (n.mesh.position.x < -40) n.mesh.position.x = 40;
            if (n.mesh.position.x > 40) n.mesh.position.x = -40;
        }

        // Subtle rotation
        points.rotation.y = time * 0.0003;
        points.rotation.x = Math.sin(time * 0.001) * 0.05;

        renderer.render(scene, camera);
    }
    animate();
})();

// ─── SHOWCASE 3D ────────────────────────────────────────
(function () {
    const canvas = document.getElementById('showcaseCanvas');
    const section = document.getElementById('showcase3d');
    if (!canvas || !section || typeof THREE === 'undefined') return;

    const isMobile = () => innerWidth < 768;
    let w = innerWidth, h = innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.set(0, -0.5, 8);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile() ? 1 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    let composer = null;
    addEventListener('resize', () => {
        w = innerWidth; h = innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        if (composer) composer.setSize(w, h);
    });

    // ── Lights ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 3, 25);
    cyanLight.position.set(3, 2, 5);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x8a2be2, 2.5, 25);
    purpleLight.position.set(-3, -1, 4);
    scene.add(purpleLight);

    const rimLight = new THREE.PointLight(0xffffff, 1.2, 18);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);

    // ── Materials ──
    const tvFrameMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x181a22, 
        metalness: 0.95, 
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });

    const tvScreenMat = new THREE.MeshPhysicalMaterial({
        color: 0x050c18,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.45,
        thickness: 0.5,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.35,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
    });

    const cabinetMat = new THREE.MeshPhysicalMaterial({
        color: 0x0f1118,
        metalness: 0.8,
        roughness: 0.35,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2
    });

    const goldMat = new THREE.MeshPhysicalMaterial({
        color: 0xd4af37, // premium metallic gold
        metalness: 1.0,
        roughness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
    });

    const glassTopMat = new THREE.MeshPhysicalMaterial({
        color: 0x05070a,
        metalness: 0.9,
        roughness: 0.05,
        clearcoat: 1.0
    });

    const phoneChassisMat = new THREE.MeshPhysicalMaterial({
        color: 0x222633, // premium dark aluminum
        metalness: 0.95,
        roughness: 0.2,
        clearcoat: 1.0
    });

    const phoneScreenMat = new THREE.MeshPhysicalMaterial({
        color: 0x04060c,
        metalness: 0.1,
        roughness: 0.03,
        transmission: 0.6,
        thickness: 0.4,
        emissive: 0x8a2be2,
        emissiveIntensity: 0.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02
    });

    const cyanEdge = new THREE.MeshStandardMaterial({ 
        color: 0x00f0ff, 
        emissive: 0x00f0ff, 
        emissiveIntensity: 0.8, 
        metalness: 0.9, 
        roughness: 0.1 
    });

    // ── PROCEDURAL ENVIRONMENT (real reflections on metal/glass) ──
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512; envCanvas.height = 256;
    const ectx = envCanvas.getContext('2d');
    const egrad = ectx.createLinearGradient(0, 0, 0, 256);
    egrad.addColorStop(0, '#0a0e1a'); egrad.addColorStop(0.55, '#10131f'); egrad.addColorStop(1, '#05060a');
    ectx.fillStyle = egrad; ectx.fillRect(0, 0, 512, 256);
    const eblob = (x, y, r, c) => { const g = ectx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ectx.fillStyle = g; ectx.fillRect(0, 0, 512, 256); };
    eblob(110, 70, 100, 'rgba(0,240,255,0.55)');
    eblob(400, 190, 120, 'rgba(138,43,226,0.5)');
    eblob(256, 30, 80, 'rgba(255,255,255,0.22)');
    const envTex = new THREE.CanvasTexture(envCanvas);
    envTex.encoding = THREE.sRGBEncoding;
    const envMesh = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 32), new THREE.MeshBasicMaterial({ map: envTex, side: THREE.BackSide }));
    envScene.add(envMesh);
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;
    [tvFrameMat, cabinetMat, goldMat, glassTopMat, phoneChassisMat].forEach(m => { m.envMapIntensity = 1.4; });

    // ── Screen textures (powered-on displays) ──
    function makeScreenTexture(kind) {
        const c = document.createElement('canvas'); c.width = 512; c.height = 512;
        const x = c.getContext('2d');
        if (kind === 'tv') {
            const g = x.createLinearGradient(0, 0, 512, 512);
            g.addColorStop(0, '#04121f'); g.addColorStop(1, '#0a2a3a');
            x.fillStyle = g; x.fillRect(0, 0, 512, 512);
            x.strokeStyle = 'rgba(0,240,255,0.18)'; x.lineWidth = 1;
            for (let i = 0; i <= 512; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); }
            const rg = x.createRadialGradient(256, 256, 0, 256, 256, 200);
            rg.addColorStop(0, 'rgba(0,240,255,0.35)'); rg.addColorStop(1, 'rgba(0,240,255,0)');
            x.fillStyle = rg; x.fillRect(0, 0, 512, 512);
            x.fillStyle = '#00f0ff'; x.font = 'bold 64px sans-serif'; x.textAlign = 'center';
            x.fillText('Mimo', 256, 280);
            x.font = '22px sans-serif'; x.fillStyle = 'rgba(255,255,255,0.7)';
            x.fillText('PREMIUM TECH', 256, 320);
        } else {
            const g = x.createLinearGradient(0, 0, 0, 512);
            g.addColorStop(0, '#1a0a2e'); g.addColorStop(1, '#05060a');
            x.fillStyle = g; x.fillRect(0, 0, 512, 512);
            const rg = x.createRadialGradient(256, 200, 0, 256, 200, 260);
            rg.addColorStop(0, 'rgba(138,43,226,0.4)'); rg.addColorStop(1, 'rgba(138,43,226,0)');
            x.fillStyle = rg; x.fillRect(0, 0, 512, 512);
            x.fillStyle = '#fff'; x.font = 'bold 90px sans-serif'; x.textAlign = 'center';
            x.fillText('9:41', 256, 170);
            x.font = '26px sans-serif'; x.fillStyle = 'rgba(255,255,255,0.8)';
            x.fillText('Mimo OS', 256, 220);
            x.fillStyle = 'rgba(0,240,255,0.85)';
            for (let r = 0; r < 4; r++) for (let col = 0; col < 4; col++) { x.beginPath(); x.arc(120 + col * 90, 330 + r * 55, 14, 0, Math.PI * 2); x.fill(); }
        }
        const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
    }
    const tvScreenTex = makeScreenTexture('tv');
    const phoneScreenTex = makeScreenTexture('phone');
    tvScreenMat.transmission = 0; tvScreenMat.thickness = 0;
    tvScreenMat.map = tvScreenTex; tvScreenMat.emissiveMap = tvScreenTex; tvScreenMat.emissiveIntensity = 0.9;
    phoneScreenMat.transmission = 0; phoneScreenMat.thickness = 0;
    phoneScreenMat.map = phoneScreenTex; phoneScreenMat.emissiveMap = phoneScreenTex; phoneScreenMat.emissiveIntensity = 0.8;

    // ── Speaker fabric/mesh grille texture ──
    const fabCanvas = document.createElement('canvas'); fabCanvas.width = fabCanvas.height = 256;
    const fx = fabCanvas.getContext('2d');
    fx.fillStyle = '#0f1118'; fx.fillRect(0, 0, 256, 256);
    fx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let y = 0; y < 256; y += 8) for (let xx = 0; xx < 256; xx += 8) { fx.beginPath(); fx.arc(xx + 4, y + 4, 2, 0, Math.PI * 2); fx.fill(); }
    const fabricTex = new THREE.CanvasTexture(fabCanvas);
    fabricTex.wrapS = fabricTex.wrapT = THREE.RepeatWrapping; fabricTex.repeat.set(4, 6); fabricTex.encoding = THREE.sRGBEncoding;
    cabinetMat.map = fabricTex; cabinetMat.metalness = 0.5; cabinetMat.roughness = 0.55;

    // ── Studio pedestal + contact shadow (shared, static) ──
    const pedestal = new THREE.Group();
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 0.18, 64), new THREE.MeshStandardMaterial({ color: 0x0a0c12, metalness: 0.85, roughness: 0.25 }));
    platform.position.y = -2.0; pedestal.add(platform);
    const pedRim = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.025, 8, 80), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    pedRim.rotation.x = Math.PI / 2; pedRim.position.y = -1.91; pedestal.add(pedRim);
    const shCanvas = document.createElement('canvas'); shCanvas.width = shCanvas.height = 256;
    const sx = shCanvas.getContext('2d');
    const sg = sx.createRadialGradient(128, 128, 10, 128, 128, 128);
    sg.addColorStop(0, 'rgba(0,0,0,0.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    sx.fillStyle = sg; sx.fillRect(0, 0, 256, 256);
    const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shCanvas), transparent: true, depthWrite: false, opacity: 0.85 }));
    contactShadow.rotation.x = -Math.PI / 2; contactShadow.position.y = -1.89; pedestal.add(contactShadow);
    scene.add(pedestal);

    const updatePedestalScale = () => {
        if (isMobile()) {
            pedestal.scale.set(0.65, 0.65, 0.65);
        } else {
            pedestal.scale.set(1, 1, 1);
        }
    };
    updatePedestalScale();
    window.addEventListener('resize', updatePedestalScale);

    // ── GLB model slots (drop real models in /models/) ──
    const MODEL_URLS = { tv: 'models/tv.glb', speaker: 'models/speaker.glb', phone: 'models/phone.glb' };
    const MODEL_ROT = { tv: { x: 0, y: 0, z: 0 }, speaker: { x: 0, y: 0, z: 0 }, phone: { x: 0, y: 0, z: 0 } };
    const gltfLoader = (typeof THREE.GLTFLoader !== 'undefined') ? new THREE.GLTFLoader() : null;
    if (gltfLoader && typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        gltfLoader.setDRACOLoader(dracoLoader);
    }
    function applyModel(slot, group) {
        const url = MODEL_URLS[slot];
        if (!url || !gltfLoader) return;
        gltfLoader.load(url, (gltf) => {
            group.clear();
            const inner = new THREE.Group();
            const model = gltf.scene;
            inner.add(model);
            // Center model on its own bbox (inner at identity → offset is correct regardless of GLB native transform)
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            // Fit-box: scale to ~4.2 wide / ~3.8 tall so TVs/phones aren't grotesquely large
            const s = Math.min(4.2 / (size.x || 1), 3.8 / (size.y || 1), 4.2 / (size.z || 1));
            // Cap horizontal footprint so the model stays within the platform radius (3.2) and never overhangs
            const SAFE_R = 2.7;
            const horizR = Math.max(size.x, size.z) * s / 2;
            const sFinal = horizR > SAFE_R ? s * (SAFE_R / horizR) : s;
            inner.scale.setScalar(sFinal);
            const rot = MODEL_ROT[slot] || { x: 0, y: 0, z: 0 };
            model.rotation.set(rot.x, rot.y, rot.z);
            model.traverse(o => { if (o.isMesh && o.material) { o.material.envMapIntensity = 1.3; } });
            group.add(inner);
        }, undefined, (err) => { console.warn('Modelo GLB no cargó (' + slot + '):', err); });
    }

    // ── Object factories ──
    let bassDriver = null, spkLedRing = null;

    function createTV() {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.7, 0.15), tvFrameMat); g.add(body);
        const screen = new THREE.Mesh(new THREE.BoxGeometry(4.28, 2.58, 0.05), tvScreenMat); screen.position.z = 0.07; g.add(screen);
        const bezel = new THREE.Mesh(new THREE.EdgesGeometry(new THREE.BoxGeometry(4.34, 2.64, 0.08)), new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.55 })); g.add(bezel);
        const standArc = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 8, 32, Math.PI), tvFrameMat); standArc.position.set(0, -1.3, 0); standArc.rotation.x = Math.PI / 2; g.add(standArc);
        const standColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.4, 16), tvFrameMat); standColumn.position.set(0, -1.4, 0); g.add(standColumn);
        const led = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00f0ff })); led.position.set(0, -1.28, 0.1); g.add(led);
        const backGlow = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 3.2), new THREE.MeshBasicMaterial({ color: 0x00a8ff, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); backGlow.position.z = -0.15; g.add(backGlow);
        g.visible = false; return g;
    }
    function createSpeaker() {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 3.0, 32), cabinetMat); g.add(body);
        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.87, 0.03, 8, 32), goldMat); ring1.rotation.x = Math.PI / 2; ring1.position.y = 1.2; g.add(ring1);
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.87, 0.03, 8, 32), goldMat); ring2.rotation.x = Math.PI / 2; ring2.position.y = -1.2; g.add(ring2);
        const top = new THREE.Mesh(new THREE.CylinderGeometry(0.83, 0.83, 0.05, 32), glassTopMat); top.position.y = 1.5; g.add(top);
        const led = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.025, 8, 64), new THREE.MeshBasicMaterial({ color: 0x00f0ff })); led.rotation.x = Math.PI / 2; led.position.y = 1.53; g.add(led); spkLedRing = led;
        const bd = new THREE.Group();
        const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.15, 32), new THREE.MeshStandardMaterial({ color: 0x1a2128, metalness: 0.7, roughness: 0.6 })); cone.rotation.x = Math.PI / 2; bd.add(cone);
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), goldMat); dome.position.z = 0.07; bd.add(dome);
        bd.position.set(0, 0.2, 0.78); g.add(bd); bassDriver = bd;
        const rL = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 16), goldMat); rL.rotation.z = Math.PI / 2; rL.position.set(-0.86, -0.3, 0); g.add(rL);
        const rR = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 16), goldMat); rR.rotation.z = Math.PI / 2; rR.position.set(0.86, -0.3, 0); g.add(rR);
        g.visible = false; return g;
    }
    function createPhone() {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.8, 0.16), phoneChassisMat); g.add(body);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.72, 3.72), phoneScreenMat); screen.position.z = 0.085; g.add(screen);
        const edge = new THREE.Mesh(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.8, 3.8, 0.16)), new THREE.LineBasicMaterial({ color: 0x8a2be2, transparent: true, opacity: 0.55 })); g.add(edge);
        const cam = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.06), glassTopMat); cam.position.set(0.4, 1.1, -0.09); g.add(cam);
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 32), goldMat); ring.position.set(0.4, 1.4 - i * 0.3, -0.11); g.add(ring);
            const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16), glassTopMat); lens.rotation.x = Math.PI / 2; lens.position.set(0.4, 1.4 - i * 0.3, -0.1); g.add(lens);
        }
        g.visible = false; return g;
    }

    const FLOAT_Y = { tv: -0.3, speaker: 0.4, phone: 0.4 };
    const tvGroup = createTV(); tvGroup.userData.baseY = FLOAT_Y.tv; scene.add(tvGroup);
    const speakerGroup = createSpeaker(); speakerGroup.userData.baseY = FLOAT_Y.speaker; scene.add(speakerGroup);
    const phoneGroup = createPhone(); phoneGroup.userData.baseY = FLOAT_Y.phone; scene.add(phoneGroup);
    applyModel('tv', tvGroup); applyModel('speaker', speakerGroup); applyModel('phone', phoneGroup);

    // ── Background Digital Particle Field (Polvo Cyber) ──
    const particleCount = 250;
    const particlesGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 16;
        particlePositions[i + 1] = (Math.random() - 0.5) * 10;
        particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    // Crear textura circular para las partículas
    const circleCanvas = document.createElement('canvas');
    circleCanvas.width = 16;
    circleCanvas.height = 16;
    const context = circleCanvas.getContext('2d');
    context.beginPath();
    context.arc(8, 8, 8, 0, Math.PI * 2);
    context.fillStyle = '#FFF';
    context.fill();
    const circleTexture = new THREE.CanvasTexture(circleCanvas);

    const particlesMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.05,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        map: circleTexture,
        alphaTest: 0.1
    });
    const particleSystem = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particleSystem);

    const objects = [tvGroup, speakerGroup, phoneGroup];
    const labels = document.querySelectorAll('.showcase-label');

    // Dynamic scale helper based on screen size (keeps the wide TV fully visible on mobile)
    const getTargetScale = (idx) => {
        if (isMobile()) {
            if (idx === 0) return 0.65; // TV (wide screen object needs to scale down to fit portrait)
            if (idx === 1) return 0.8;  // Speaker
            if (idx === 2) return 0.85; // Phone
        }
        return 1.0;
    };

    // ── Initial State Setup ──
    let currentIdx = 0;
    let progress = 0;
    objects[0].visible = true;
    const initialScale = getTargetScale(0);
    objects[0].scale.set(initialScale, initialScale, initialScale);
    if (labels[0]) labels[0].classList.add('active');

    // ── ScrollTrigger Integration ──
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
            pin: !isMobile() ? '#showcasePin' : false,
            pinSpacing: !isMobile(),
            anticipatePin: 1,
            onUpdate: (self) => {
                progress = self.progress;
                
                // Nuevos rangos de scroll optimizados para darle más espacio al televisor al inicio
                let idx = 0;
                if (progress > 0.38) idx = 1;
                if (progress > 0.72) idx = 2;

                if (idx !== currentIdx) {
                    const prevIdx = currentIdx;
                    currentIdx = idx;

                    // Desvanecer objeto anterior
                    if (prevIdx >= 0 && prevIdx < 3) {
                        gsap.to(objects[prevIdx].scale, { 
                            x: 0, y: 0, z: 0, 
                            duration: 0.4, 
                            ease: 'power2.in', 
                            onComplete: () => { objects[prevIdx].visible = false; } 
                        });
                        if (labels[prevIdx]) labels[prevIdx].classList.remove('active');
                    }
                    
                    // Mostrar objeto actual
                    objects[currentIdx].visible = true;
                    objects[currentIdx].scale.set(0, 0, 0);
                    const targetScale = getTargetScale(currentIdx);
                    gsap.to(objects[currentIdx].scale, { 
                        x: targetScale, y: targetScale, z: targetScale, 
                        duration: 0.7, 
                        ease: 'back.out(1.5)', 
                        delay: 0.1 
                    });
                    if (labels[currentIdx]) labels[currentIdx].classList.add('active');
                }

                // Calcular progreso local escalado para cada segmento para una rotación perfecta
                let localProgress = 0;
                if (idx === 0) {
                    localProgress = progress / 0.38;
                } else if (idx === 1) {
                    localProgress = (progress - 0.38) / 0.34;
                } else {
                    localProgress = (progress - 0.72) / 0.28;
                }

                // Rotación continua fluida basada en el scroll local
                objects.forEach((obj, i) => {
                    if (obj.visible) {
                        obj.rotation.y = localProgress * Math.PI * 2;
                        // Efecto de inclinación 3D al escrolear
                        obj.rotation.x = Math.sin(localProgress * Math.PI) * 0.15;
                    }
                });

                // Movimiento de luz según el progreso
                cyanLight.position.x = Math.sin(progress * Math.PI * 2) * 4;
                cyanLight.position.y = Math.cos(progress * Math.PI * 2) * 2;
            }
        });
    }

    // ── Post-processing (Bloom removido a petición del usuario) ──
    composer = null;

    // ── Animation Loop ──
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time++;

        // Rotación lenta de partículas
        particleSystem.rotation.y = time * 0.0004;
        particleSystem.rotation.x = time * 0.0002;

        // Vibración de subwoofer del parlante
        if (speakerGroup.visible) {
            const beatScale = 1.0 + Math.sin(time * 0.18) * 0.035;
            bassDriver.scale.set(beatScale, beatScale, 1.0);
        }

        // Rotación de tono del anillo LED superior del parlante
        if (speakerGroup.visible && spkLedRing) {
            const hue = (time * 0.5) % 360;
            spkLedRing.material.color.setHSL(hue / 360, 1, 0.5);
        }

        // Flotación lenta y natural para los objetos activos
        objects.forEach(obj => {
            if (obj.visible) {
                const by = obj.userData.baseY || 0;
                obj.position.y = by + Math.sin(time * 0.03) * 0.1;
                obj.position.x = Math.cos(time * 0.02) * 0.05;
            }
        });

        // Pulsación suave en la intensidad de las luces de ambientación
        cyanLight.intensity = 2.5 + Math.sin(time * 0.03) * 0.6;
        purpleLight.intensity = 2.0 + Math.cos(time * 0.03) * 0.4;

        if (composer) composer.render(); else renderer.render(scene, camera);
    }
    animate();
})();

// ─── GSAP SCROLL ANIMATIONS ─────────────────────────────
(function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Scroll reveals for product cards
    function initScrollReveals() {
        gsap.utils.toArray('.product-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
                y: 50, opacity: 0, duration: 0.6, delay: (i % 4) * 0.08, ease: 'power2.out'
            });
        });
    }

    // Reveal section titles
    gsap.utils.toArray('.section-label, .section-counter').forEach(el => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 90%' },
            x: -30, opacity: 0, duration: 0.5, ease: 'power2.out'
        });
    });

    // Carousel section parallax
    const carouselSection = document.querySelector('.carousel-section');
    if (carouselSection) {
        gsap.to(carouselSection, {
            scrollTrigger: { trigger: carouselSection, start: 'top bottom', end: 'bottom top', scrub: 1 },
            backgroundPositionY: '20%', ease: 'none'
        });
    }

    // Stats counter animation
    gsap.utils.toArray('.stat-item strong').forEach(el => {
        const target = parseInt(el.textContent.replace(/\D/g, ''), 10);
        if (isNaN(target) || target === 0) return;
        const suffix = el.textContent.replace(/[\d.]/g, '');
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 85%' },
            textContent: 0, duration: 1.5, ease: 'power1.out',
            snap: { textContent: 1 },
            onUpdate: function () { el.textContent = Math.round(parseFloat(el.textContent)) + suffix; }
        });
    });

    // Hero content entrance
    gsap.from('.hero-content', {
        y: 40, opacity: 0, duration: 1, delay: 0.5, ease: 'power3.out'
    });

    // Init after products render
    if (typeof renderPage === 'function') {
        const origRender = renderPage;
        window.renderPage = function () {
            origRender.apply(this, arguments);
            setTimeout(initScrollReveals, 100);
        };
    } else {
        setTimeout(initScrollReveals, 500);
    }
    initScrollReveals();
})();

// ─── MODAL 3D ANIMATION (GSAP) ──────────────────────────
(function () {
    if (typeof gsap === 'undefined') return;

    const modal = document.getElementById('productModal');
    if (!modal) return;

    const origOpen = window.openProductModal;
    window.openProductModal = function (prodId) {
        origOpen.call(this, prodId);

        // 3D entrance animation
        const content = modal.querySelector('.modal-content');
        if (content) {
            gsap.fromTo(content,
                { opacity: 0, scale: 0.85, rotateY: -12, transformPerspective: 1200, transformOrigin: 'center center' },
                { opacity: 1, scale: 1, rotateY: 0, duration: 0.5, ease: 'back.out(1.4)', clearProps: 'transform' }
            );
        }

        // Gallery images stagger
        const images = modal.querySelectorAll('.modal-main-image, .modal-thumb');
        if (images.length) {
            gsap.fromTo(images,
                { scale: 1.1, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, stagger: 0.06, delay: 0.2, ease: 'power2.out' }
            );
        }

        // Details slide up
        const details = modal.querySelector('.modal-details');
        if (details) {
            gsap.fromTo(details,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, delay: 0.15, ease: 'power2.out' }
            );
        }
    };

    // 3D exit animation
    const closeBtn = document.getElementById('modalClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const content = modal.querySelector('.modal-content');
            if (content) {
                gsap.to(content, {
                    opacity: 0, scale: 0.9, rotateY: 8, duration: 0.25, ease: 'power2.in',
                    onComplete: () => { modal.classList.remove('active'); document.body.style.overflow = ''; }
                });
            }
        });
    }
})();

// ─── SEARCH ANIMATION (GSAP) ────────────────────────────
(function () {
    if (typeof gsap === 'undefined') return;

    const searchToggle = document.getElementById('searchToggle');
    const searchDropdown = document.getElementById('searchDropdown');
    const searchInput = document.getElementById('searchInput');

    if (searchToggle && searchDropdown) {
        searchToggle.addEventListener('click', () => {
            setTimeout(() => {
                if (searchDropdown.classList.contains('active')) {
                    gsap.fromTo(searchDropdown,
                        { y: -15, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
                    );
                }
            }, 10);
        });
    }

    // Animate search results as they appear
    if (searchInput) {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('search-result-item')) {
                        gsap.fromTo(node,
                            { x: -15, opacity: 0 },
                            { x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }
                        );
                    }
                });
            });
        });
        const resultsEl = document.getElementById('searchResults');
        if (resultsEl) observer.observe(resultsEl, { childList: true });
    }
})();
