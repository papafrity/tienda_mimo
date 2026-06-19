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

document.addEventListener('DOMContentLoaded', () => {
    // ─── PRELOADER ──────────────────────────────────────────
    const preloader = document.getElementById('preloader');
    setTimeout(() => { if (preloader) preloader.classList.add('done'); }, 2200);

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

    // ─── SPLIT TITLE ANIMATION ──────────────────────────────
    const title = document.getElementById('heroTitle');
    if (title) {
        const text = title.textContent;
        const manosIdx = text.indexOf('Manos');
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
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); revealObs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal-text').forEach(el => revealObs.observe(el));

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

    // ─── RIPPLE ON CTA ──────────────────────────────────────
    document.querySelectorAll('.cta-button').forEach(btn => {
        btn.addEventListener('click', e => {
            const ripple = btn.querySelector('.btn-ripple');
            if (!ripple) return;
            const r = btn.getBoundingClientRect();
            ripple.style.left = (e.clientX - r.left) + 'px';
            ripple.style.top = (e.clientY - r.top) + 'px';
            ripple.style.width = ripple.style.height = '0px';
            ripple.style.opacity = '1';
            requestAnimationFrame(() => {
                ripple.style.transition = 'width .6s, height .6s, opacity .6s';
                ripple.style.width = ripple.style.height = '400px';
                ripple.style.opacity = '0';
            });
            setTimeout(() => { ripple.style.transition = 'none'; }, 700);
        });
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

    function fmt(n) { const v = Number(n); return v % 1 === 0 ? v.toString() : v.toFixed(2); }
    // Safe offer-price getter: handles $0 correctly (unlike `offerVal(p)`)
    function offerVal(p) { return p.offerPrice != null ? p.offerPrice : p.price; }
    function hasOffer(p) { return p.offerPrice != null && p.offerPrice !== p.price; }

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
        let filtered = activeFilter === 'all' ? [...products] : products.filter(p => p.category === activeFilter);
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
        pageProducts.forEach(p => {
            const hasDiscount = hasOffer(p);
            let priceHtml = hasDiscount 
                ? `<p class="price"><span style="text-decoration: line-through; font-size: 0.85em; color: var(--text-secondary); margin-right: 8px;">$${fmt(p.price)}</span><span class="accent">$${fmt(p.offerPrice)}</span></p>`
                : `<p class="price">$${fmt(offerVal(p))}</p>`;
                
            grid.innerHTML += `
            <div class="product-card tilt-card" data-category="${p.category}" data-id="${p.id}">
                <div class="card-glow"></div>
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
    }

    function renderCarousel() {
        const carousel = document.getElementById('carousel3d');
        if (!carousel) return;
        carousel.innerHTML = '';
        const featured = products.filter(p => p.isFeatured);
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
                window.addToCart(p.id);
            });
            
            carousel.appendChild(card);
        });
    }

    async function fetchProducts() {
        try {
            const querySnapshot = await db.collection("products").get();
            products = [];
            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });
            renderProducts();
            renderCarousel();
            initDynamicEvents();
            initCarouselLogic();
            initProductFiltersAndModals();
        } catch(e) {
            console.error("Error fetching products", e);
        }
    }

    fetchProducts();
    // Re-attach specific dynamic events
    function initDynamicEvents() {
        document.querySelectorAll('.tilt-card').forEach(card => {
            const glow = card.querySelector('.card-glow');
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }
                const cx2 = r.width / 2, cy2 = r.height / 2;
                const rotX = ((y - cy2) / cy2) * -4;
                const rotY = ((x - cx2) / cx2) * 4;
                card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });
        
        document.querySelectorAll('a, button, .product-card, .carousel-card, .filter-tab, .cart-btn').forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('hover'));
            el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
        });
    }

    // ─── CART LOGIC ─────────────────────────────────────────
    let cart = JSON.parse(localStorage.getItem('mimo_cart')) || [];

    function saveCart() {
        localStorage.setItem('mimo_cart', JSON.stringify(cart));
        renderCart();
    }

    window.addToCart = function(id) {
        const product = products.find(p => p.id === id);
        if (!product) return;
        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        saveCart();
        gtag('event', 'add_to_cart', { currency: 'ARS', value: offerVal(product), items: [{ item_id: product.id, item_name: product.name, price: offerVal(product), quantity: 1 }] });
        showToast(`${product.name} agregado al carrito`, 'success');
        
        // Bump animation
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.classList.add('bump');
            setTimeout(() => cartCount.classList.remove('bump'), 300);
        }
        
        openCart();
    };

    window.updateQty = function(id, delta) {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) {
            window.removeFromCart(id);
        } else {
            saveCart();
        }
    };

    window.removeFromCart = function(id) {
        cart = cart.filter(i => i.id !== id);
        saveCart();
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
                            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                            <span class="qty-val">${item.qty}</span>
                            <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                        </div>
                    </div>
                    <button class="cart-item-del" onclick="removeFromCart('${item.id}')">&times;</button>
                </div>
                `;
            });
        }
        
        if (cartTotalValue) cartTotalValue.textContent = `$${fmt(total)}`;
        if (cartCount) cartCount.textContent = count;
    }

    // Attach cart UI events
    const cartBtn = document.getElementById('cartBtn');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
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

        dotsC.innerHTML = '';
        for (let i = 0; i < realCount; i++) {
            const d = document.createElement('div');
            d.classList.add('carousel-dot');
            if (i === 0) d.classList.add('active');
            d.addEventListener('click', () => goTo(i));
            dotsC.appendChild(d);
        }

        function updateCards(smooth = true) {
            cards.forEach((card, i) => {
                let diff = i - ci;
                if (diff > realCount / 2) diff -= realCount;
                else if (diff < -realCount / 2) diff += realCount;

                const abs = Math.abs(diff);
                const dir = diff > 0 ? 1 : -1;

                let transform, opacity, zIndex;

                if (abs === 0) {
                    transform = 'translateX(0) scale(1)';
                    opacity = 1;
                    zIndex = 10;
                } else if (abs === 1) {
                    transform = `translateX(${dir * 320}px) scale(0.85) rotateY(${dir * 15}deg)`;
                    opacity = 0.65;
                    zIndex = 5;
                } else if (abs === 2) {
                    transform = `translateX(${dir * 640}px) scale(0.7) rotateY(${dir * 30}deg)`;
                    opacity = 0.3;
                    zIndex = 2;
                } else {
                    transform = `translateX(${dir * 960}px) scale(0.55)`;
                    opacity = 0;
                    zIndex = 0;
                }

                card.style.transition = smooth ? 'transform .6s cubic-bezier(.25,1,.5,1), opacity .6s ease' : 'none';
                card.style.transform = transform;
                card.style.opacity = opacity;
                card.style.zIndex = zIndex;
                card.style.pointerEvents = abs <= 2 ? 'auto' : 'none';
                card.classList.toggle('active', abs === 0);
            });

            dotsC.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === ci));
        }

        function goTo(index) {
            if (animating || index === ci) return;
            animating = true;
            ci = index;
            updateCards(true);
            function onEnd(e) {
                track.removeEventListener('transitionend', onEnd);
                animating = false;
            }
            track.addEventListener('transitionend', onEnd, { once: true });
        }

        function next() { goTo((ci + 1) % realCount); }
        function prev() { goTo((ci - 1 + realCount) % realCount); }

        cards.forEach((card, i) => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart')) return;
                if (i !== ci) { goTo(i); return; }
                const btn = card.querySelector('.add-to-cart');
                if (btn) window.openProductModal(btn.dataset.productId);
            });
        });

        nextBtn.addEventListener('click', next);
        prevBtn.addEventListener('click', prev);

        updateCards(false);

        let ap = setInterval(next, 4000);
        wrapper.addEventListener('mouseenter', () => clearInterval(ap));
        wrapper.addEventListener('mouseleave', () => { ap = setInterval(next, 4000); });

        let tsx = 0;
        wrapper.addEventListener('touchstart', e => { tsx = e.changedTouches[0].screenX; clearInterval(ap); }, { passive: true });
        wrapper.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].screenX - tsx;
            if (Math.abs(dx) > 50) { dx > 0 ? prev() : next(); }
            wrapper.addEventListener('mouseleave', () => { ap = setInterval(next, 4000); }, { once: true });
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
                    cart: cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: Number(offerVal(item)),
                        qty: item.qty
                    })),
                    status: 'pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    total: cart.reduce((sum, item) => sum + (Number(offerVal(item)) * item.qty), 0),
                    shippingCost: shippingCost,
                    shippingProvince: provName
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
            
            // Re-bind the "Añadir al Carrito" inside modal
            const addBtn = modalEl.querySelector('.modal-add-cart');
            const newAddBtn = addBtn.cloneNode(true);
            addBtn.parentNode.replaceChild(newAddBtn, addBtn);
            
            newAddBtn.addEventListener('click', () => {
                window.addToCart(p.id);
                closeM();
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
            } catch(e) { console.error('Error en openProductModal:', e); }
        };

        function closeM() { document.getElementById('productModal').classList.remove('active'); document.body.style.overflow = ''; }

        // Modal global listeners
        const liveModal = document.getElementById('productModal');
        const newModal = liveModal.cloneNode(true);
        liveModal.parentNode.replaceChild(newModal, liveModal);
        newModal.addEventListener('click', e => { if (e.target === newModal || e.target.closest('#modalClose')) { closeM(); } });
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
                if (typeof window.addToCart === 'function') window.addToCart(id); else console.warn('addToCart no disponible');
                return;
            }
            if (typeof window.openProductModal === 'function') window.openProductModal(id); else console.warn('openProductModal no disponible, esperá a que carguen los productos');
            } catch(e) { console.error('Error al hacer clic en tarjeta:', e); }
        });
    }

    function initDynamicEvents() {
        document.querySelectorAll('.tilt-card').forEach(card => {
            const glow = card.querySelector('.card-glow');
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }
                const cx2 = r.width / 2, cy2 = r.height / 2;
                const rotX = ((y - cy2) / cy2) * -4;
                const rotY = ((x - cx2) / cx2) * 4;
                card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });
    }
    initDynamicEvents();
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
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                searchDropdown.classList.remove('active');
            }
        });

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            searchResults.innerHTML = '';

            if (query.length < 2) {
                searchResults.innerHTML = '<div class="search-no-results">Escribe al menos 2 caracteres...</div>';
                return;
            }

            const matches = products.filter(p =>
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
                    window.openProductModal(p.id);
                });
                searchResults.appendChild(item);
            });
        });
    }

    // ─── NAVBAR HIDE/SHOW ON SCROLL ─────────────────────────
    const navbar = document.getElementById('navbar');
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
    const outlineSection = document.querySelector('.outline-text-section');
    if (outlineSection) {
        const texts = outlineSection.querySelectorAll('.outline-text');
        window.addEventListener('scroll', () => {
            const r = outlineSection.getBoundingClientRect();
            if (r.top < window.innerHeight && r.bottom > 0) {
                const p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
                const multiplier = window.innerWidth < 768 ? 40 : 150;
                texts.forEach((t, i) => {
                    const dir = i === 0 ? 1 : -1;
                    t.style.transform = `translateX(${(p - 0.5) * multiplier * dir}px)`;
                });
            }
        });
    }
});

// Keyframes injection
const st = document.createElement('style');
st.textContent = `@keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`;
document.head.appendChild(st);

// ─── INTERACTIVE BACKGROUND ─────────────────────────────
(function () {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, mx = -1000, my = -1000;
    let s, draw_s, dx, dy;

    function resize() { 
        w = canvas.width = innerWidth; 
        h = canvas.height = innerHeight; 
        // Fit roughly 4.5 hexagons across the screen width (Massive size)
        dx = w / 4.5;
        // The width of a hexagon is dx, so s = dx / sqrt(3)
        s = dx / Math.sqrt(3);
        // Smaller draw_s to leave gaps so they don't touch
        draw_s = s * 0.75; 
        dy = s * 1.5;
    }
    resize(); addEventListener('resize', resize);
    
    // Add touch support for mobile
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('touchstart', e => { mx = e.touches[0].clientX; my = e.touches[0].clientY; }, {passive: true});
    document.addEventListener('touchmove', e => { mx = e.touches[0].clientX; my = e.touches[0].clientY; }, {passive: true});
    document.addEventListener('touchend', e => { mx = -1000; my = -1000; }, {passive: true});

    function anim() {
        ctx.clearRect(0, 0, w, h);
        
        // No background glow, just empty space

        const cols = Math.ceil(w / dx) + 1;
        const rows = Math.ceil(h / dy) + 1;

        ctx.beginPath();
        for (let row = -1; row <= rows; row++) {
            for (let col = -1; col <= cols; col++) {
                let x = col * dx;
                let y = row * dy;
                // Shift every other row to create the interlocking hex pattern
                if (Math.abs(row) % 2 === 1) x += dx / 2;
                
                // Draw rounded hexagon
                for (let i = 0; i < 6; i++) {
                    const a0 = Math.PI / 3 * (i - 1) - Math.PI / 6;
                    const a1 = Math.PI / 3 * i - Math.PI / 6;
                    const a2 = Math.PI / 3 * (i + 1) - Math.PI / 6;
                    
                    const p0x = x + draw_s * Math.cos(a0);
                    const p0y = y + draw_s * Math.sin(a0);
                    const p1x = x + draw_s * Math.cos(a1);
                    const p1y = y + draw_s * Math.sin(a1);
                    const p2x = x + draw_s * Math.cos(a2);
                    const p2y = y + draw_s * Math.sin(a2);
                    
                    if (i === 0) {
                        ctx.moveTo((p0x + p1x) / 2, (p0y + p1y) / 2);
                    }
                    // arcTo creates the rounded corners perfectly
                    ctx.arcTo(p1x, p1y, p2x, p2y, draw_s * 0.15);
                }
                ctx.closePath();
            }
        }
        
        // 1. Draw base grid (very dim, empty interior)
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 2. Draw the "circuit electricity" effect
        // A radial gradient that only lights up paths near the mouse
        const R = w < 768 ? Math.min(100, w * 0.25) : Math.min(180, w * 0.4); // Dynamic radius for mobile
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, R);
        grad.addColorStop(0, 'rgba(0, 240, 255, 1)');      // Bright center
        grad.addColorStop(0.3, 'rgba(0, 240, 255, 0.8)');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0)');      // Fades out completely
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3; // Make the lit part slightly thicker for a glowing wire effect
        ctx.stroke();

        requestAnimationFrame(anim);
    }
    anim();
})();
