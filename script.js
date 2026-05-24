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

document.addEventListener('DOMContentLoaded', () => {
    // ─── PRELOADER ──────────────────────────────────────────
    const preloader = document.getElementById('preloader');
    setTimeout(() => { preloader.classList.add('done'); }, 2200);

    // ─── CUSTOM CURSOR ──────────────────────────────────────
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let cx = 0, cy = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });

    function animateCursor() {
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
        title.innerHTML = '';
        text.split('').forEach((ch, i) => {
            const span = document.createElement('span');
            span.classList.add('char');
            span.textContent = ch === ' ' ? '\u00A0' : ch;
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
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
        hamburger.classList.remove('active'); navLinks.classList.remove('open'); document.body.style.overflow = '';
    }));

    // ─── PRODUCT DATABASE (Fase 3: Firebase) ────────
    let products = [];

    function renderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        grid.innerHTML = '';
        products.forEach(p => {
            const hasDiscount = p.offerPrice && p.offerPrice !== p.price;
            let priceHtml = hasDiscount 
                ? `<p class="price"><span style="text-decoration: line-through; font-size: 0.85em; color: var(--text-secondary); margin-right: 8px;">$${p.price.toFixed(2)}</span><span class="accent">$${p.offerPrice.toFixed(2)}</span></p>`
                : `<p class="price">$${(p.offerPrice || p.price).toFixed(2)}</p>`;
                
            grid.innerHTML += `
            <div class="product-card tilt-card" data-category="${p.category}" data-description="${p.description}" data-images='${p.fullImages}'>
                <div class="card-glow"></div>
                <div class="product-image"><img src="${p.image}" alt="${p.name}"></div>
                <div class="product-info">
                    <span class="category">${p.category}</span>
                    <h3>${p.name}</h3>
                    ${priceHtml}
                    <button class="add-to-cart magnetic-btn" onclick="addToCart('${p.id}')">Agregar al Carrito</button>
                </div>
            </div>`;
        });
    }

    function renderCarousel() {
        const carousel = document.getElementById('carousel3d');
        if (!carousel) return;
        carousel.innerHTML = '';
        const featured = products.filter(p => p.isFeatured);
        featured.forEach(p => {
            const hasDiscount = p.oldPrice && p.offerPrice && p.oldPrice !== p.offerPrice;
            let priceHtml = hasDiscount 
                ? `<p class="old-price">$${p.oldPrice.toFixed(2)}</p><p class="offer-price">$${p.offerPrice.toFixed(2)}</p>` 
                : `<p class="offer-price">$${(p.offerPrice || p.price).toFixed(2)}</p>`;
                
            const card = document.createElement('div');
            card.className = 'carousel-card';
            card.innerHTML = `
                <img src="${p.image}" alt="${p.name}">
                <div class="carousel-card-info">
                    <span class="badge">${p.badge || ''}</span>
                    <h3>${p.name}</h3>
                    ${priceHtml}
                    <button class="add-to-cart magnetic-btn" data-product-id="${p.id}" style="margin-top: 10px; width: 100%; border-radius: 20px; font-size: 0.85rem;">Agregar al Carrito</button>
                </div>`;
            
            // Attach click directly to button element
            const btn = card.querySelector('.add-to-cart');
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                addToCart(p.id);
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
                const price = item.offerPrice || item.price;
                total += price * item.qty;
                count += item.qty;
                
                cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${price.toFixed(2)}</p>
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
        
        if (cartTotalValue) cartTotalValue.textContent = `$${total.toFixed(2)}`;
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
        const carousel = document.getElementById('carousel3d');
        const cards = carousel.querySelectorAll('.carousel-card');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const dotsC = document.getElementById('carouselDots');
        
        if(cards.length === 0) return; // No featured products
        
        dotsC.innerHTML = '';
        let ci = 0; const tc = cards.length;
        const bt = new Array(tc).fill('');

        cards.forEach((_, i) => {
            const d = document.createElement('div'); d.classList.add('carousel-dot');
            if (i === 0) d.classList.add('active');
            d.addEventListener('click', () => { ci = i; upC(); });
            dotsC.appendChild(d);
        });

        function upC() {
            const dots = dotsC.querySelectorAll('.carousel-dot');
            cards.forEach((c, i) => {
                let o = i - ci;
                if (o > Math.floor(tc / 2)) o -= tc;
                if (o < -Math.floor(tc / 2)) o += tc;
                const a = Math.abs(o);
                const tz = -a * 150, tx = o * 300, ry2 = o * -30;
                const s = Math.max(1 - a * .15, .6), op = a > 2 ? 0 : Math.max(1 - a * .3, 0);
                const t = `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry2}deg) scale(${s})`;
                bt[i] = t; c.style.transform = t; c.style.opacity = op;
                c.style.zIndex = tc - a; c.style.pointerEvents = 'auto';
            });
            dots.forEach((d, i) => d.classList.toggle('active', i === ci));
        }

        function nS() { ci = (ci + 1) % tc; upC(); }
        function pS() { ci = (ci - 1 + tc) % tc; upC(); }
        
        nextBtn.addEventListener('click', nS);
        prevBtn.addEventListener('click', pS);

        let ap = setInterval(nS, 4000);
        const cw = document.querySelector('.carousel-wrapper');
        cw.addEventListener('mouseenter', () => clearInterval(ap));
        cw.addEventListener('mouseleave', () => { ap = setInterval(nS, 4000); });
        
        let tsx = 0;
        cw.addEventListener('touchstart', e => { tsx = e.changedTouches[0].screenX; clearInterval(ap); }, { passive: true });
        cw.addEventListener('touchend', e => { const d = tsx - e.changedTouches[0].screenX; if (Math.abs(d) > 50) { d > 0 ? nS() : pS(); } ap = setInterval(nS, 4000); }, { passive: true });

        upC();

        // Carousel parallax (clamped)
        const MT = 6;
        cw.addEventListener('mousemove', e => {
            if (e.target.closest('.add-to-cart') || e.target.closest('.carousel-btn')) return; // Allow clicks without recalculating transforms
            const r = cw.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - .5;
            const y = (e.clientY - r.top) / r.height - .5;
            const tx2 = Math.max(-MT, Math.min(MT, -y * MT * 2));
            const ty2 = Math.max(-MT, Math.min(MT, x * MT * 2));
            cards.forEach((c, i) => { if (bt[i]) c.style.transform = bt[i] + ` rotateX(${tx2}deg) rotateY(${ty2}deg)`; });
        });
        cw.addEventListener('mouseleave', () => { cards.forEach((c, i) => { if (bt[i]) c.style.transform = bt[i]; }); });

        // ─── CHECKOUT LOGIC ──────────────────────────────────────
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', async () => {
                if (cart.length === 0) {
                    alert('Tu carrito está vacío');
                    return;
                }

                checkoutBtn.textContent = 'Procesando...';
                checkoutBtn.disabled = true;

                try {
                    // Check if running on GitHub Pages and alert user about Vercel (Temp handling)
                    if(window.location.hostname.includes('github.io')) {
                        alert('Atención: El servidor de pagos Mercado Pago funciona a través de Vercel. Ve al paso de configuración de Vercel en la guía.');
                        checkoutBtn.textContent = 'Ir a Pagar';
                        checkoutBtn.disabled = false;
                        return;
                    }

                    const response = await fetch('/api/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(cart)
                    });

                    const data = await response.json();

                    if (response.ok && data.init_point) {
                        window.location.href = data.init_point;
                    } else {
                        console.error('Error de Mercado Pago:', data);
                        alert('No se pudo procesar el pago: ' + (data.message || 'Error desconocido'));
                    }
                } catch (error) {
                    console.error('Error de red:', error);
                    alert('Error de conexión con el servidor de pagos.');
                }

                checkoutBtn.textContent = 'Ir a Pagar';
                checkoutBtn.disabled = false;
            });
        }
    }

    // ─── FILTER TABS & MODALS (Dynamic Initialization) ────────
    function initProductFiltersAndModals() {
        const pCards = document.querySelectorAll('.product-card');
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
            const f = tab.dataset.filter;
            pCards.forEach(c => {
                if (f === 'all' || c.dataset.category === f) { c.classList.remove('hidden'); c.style.animation = 'fadeInUp .5s ease forwards'; }
                else c.classList.add('hidden');
            });
        }));

        // ─── SCROLL REVEAL PRODUCTS ─────────────────────────────
        const sObs = new IntersectionObserver(es => {
            es.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; sObs.unobserve(e.target); } });
        }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
        pCards.forEach((el, i) => {
            el.style.opacity = '0'; el.style.transform = 'translateY(40px)';
            el.style.transition = `opacity .5s ease ${(i % 6) * .08}s, transform .5s ease ${(i % 6) * .08}s`;
            sObs.observe(el);
        });

        // ─── PRODUCT MODAL BINDINGS ─────────────────────────────
        const modal = document.getElementById('productModal');
        const mImg = document.getElementById('modalMainImg');
        const mTh = document.getElementById('modalThumbs');
        const mCat = document.getElementById('modalCategory');
        const mTit = document.getElementById('modalTitle');
        const mPr = document.getElementById('modalPrice');
        const mDesc = document.getElementById('modalDescription');

        function openM(card) {
            mCat.textContent = card.querySelector('.category').textContent;
            mTit.textContent = card.querySelector('h3').textContent;
            mPr.textContent = card.querySelector('.price').textContent;
            mDesc.textContent = card.dataset.description || '';
            let imgs = JSON.parse(card.dataset.images || '[]');
            mImg.src = imgs[0];
            mTh.innerHTML = '';
            if (imgs.length > 1) imgs.forEach((s, i) => {
                const t = document.createElement('div'); t.classList.add('modal-thumb'); if (i === 0) t.classList.add('active');
                const im = document.createElement('img'); im.src = s; t.appendChild(im);
                t.addEventListener('click', () => { mImg.src = s; mTh.querySelectorAll('.modal-thumb').forEach(x => x.classList.remove('active')); t.classList.add('active'); });
                mTh.appendChild(t);
            });
            modal.classList.add('active'); document.body.style.overflow = 'hidden';
            
            // Re-bind the "Añadir al Carrito" inside modal
            const addBtn = modal.querySelector('.modal-add-cart');
            const newAddBtn = addBtn.cloneNode(true);
            addBtn.parentNode.replaceChild(newAddBtn, addBtn);
            
            const prodId = card.querySelector('.add-to-cart').getAttribute('onclick').match(/'([^']+)'/)[1];
            newAddBtn.addEventListener('click', () => {
                window.addToCart(prodId);
                closeM();
            });
        }
        function closeM() { modal.classList.remove('active'); document.body.style.overflow = ''; }

        pCards.forEach(c => c.addEventListener('click', e => { if (!e.target.closest('.add-to-cart')) openM(c); }));
        
        // Modal global listeners (only need to bind once, but replacing clone prevents dupes if called multiple times)
        const newModal = modal.cloneNode(true);
        modal.parentNode.replaceChild(newModal, modal);
        newModal.addEventListener('click', e => { if (e.target === newModal || e.target === document.getElementById('modalClose')) { newModal.classList.remove('active'); document.body.style.overflow = ''; } });
    }
    
    document.addEventListener('keydown', e => { 
        if (e.key === 'Escape') { 
            const m = document.getElementById('productModal'); 
            if(m && m.classList.contains('active')) { m.classList.remove('active'); document.body.style.overflow = ''; }
        } 
    });

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
                texts.forEach((t, i) => {
                    const dir = i === 0 ? 1 : -1;
                    t.style.transform = `translateX(${(p - 0.5) * 150 * dir}px)`;
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
    document.addEventListener('touchmove', e => { mx = e.touches[0].clientX; my = e.touches[0].clientY; }, {passive: true});

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
        const R = Math.min(180, w * 0.4); // Dynamic radius for mobile
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
