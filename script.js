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
        pageProducts.forEach((p, idx) => {
            const hasDiscount = hasOffer(p);
            let priceHtml = hasDiscount 
                ? `<p class="price"><span style="text-decoration: line-through; font-size: 0.85em; color: var(--text-secondary); margin-right: 8px;">$${fmt(p.price)}</span><span class="accent">$${fmt(p.offerPrice)}</span></p>`
                : `<p class="price">$${fmt(offerVal(p))}</p>`;
                
            grid.innerHTML += `
            <div class="product-card tilt-card reveal-up" data-category="${p.category}" data-id="${p.id}" style="transition-delay:${Math.min(idx * .04, .3)}s">
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
        // Observe newly added reveal-up elements
        document.querySelectorAll('.reveal-up:not(.revealed), .section-counter:not(.revealed)').forEach(el => revealObs.observe(el));
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
            const img = card.querySelector('.product-image img');
            const info = card.querySelector('.product-info');
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                const cx2 = r.width / 2, cy2 = r.height / 2;
                if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }
                // 3D tilt
                const rotX = ((y - cy2) / cy2) * -4;
                const rotY = ((x - cx2) / cx2) * 4;
                card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
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
                y: -6, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1
            });
        }

        // ── Glow pulse for active card ──
        let glowTl = null;
        function startGlow(card) {
            if (glowTl) glowTl.kill();
            glowTl = gsap.to(card, {
                boxShadow: '0 0 50px rgba(0,240,255,.25), 0 0 100px rgba(0,240,255,.08)',
                duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1
            });
        }

        // ── Transition particles ──
        function spawnParticles(card) {
            if (isMobile()) return;
            const rect = card.getBoundingClientRect();
            const wrapRect = wrapper.getBoundingClientRect();
            const cx = rect.left + rect.width / 2 - wrapRect.left;
            const cy = rect.top + rect.height / 2 - wrapRect.top;
            for (let i = 0; i < 8; i++) {
                const p = document.createElement('div');
                p.className = 'carousel-particle';
                p.style.left = cx + 'px';
                p.style.top = cy + 'px';
                wrapper.appendChild(p);
                const angle = (Math.PI * 2 / 8) * i;
                const dist = 40 + Math.random() * 60;
                gsap.to(p, {
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: 0,
                    scale: 0,
                    duration: 0.6 + Math.random() * 0.3,
                    ease: 'power2.out',
                    onComplete: () => p.remove()
                });
            }
        }

        // ── Mouse parallax on card images ──
        function bindCardParallax(card) {
            card.addEventListener('mousemove', e => {
                const img = card.querySelector('img');
                if (!img) return;
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                gsap.to(img, { x: px * 8, y: py * 5, duration: 0.3, ease: 'power1.out' });
            });
            card.addEventListener('mouseleave', () => {
                const img = card.querySelector('img');
                if (img) gsap.to(img, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
            });
        }

        // ── Magnetic buttons ──
        [prevBtn, nextBtn].forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.2, ease: 'power1.out' });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
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

                let targetX, targetScale, targetRotateY, targetOpacity, targetZ;

                if (abs === 0) {
                    targetX = 0; targetScale = 1; targetRotateY = 0;
                    targetOpacity = 1; targetZ = 10;
                } else if (abs === 1) {
                    targetX = dir * X_STEP; targetScale = 0.82; targetRotateY = dir * -18;
                    targetOpacity = 0.55; targetZ = 5;
                } else if (abs === 2) {
                    targetX = dir * X_STEP * 2; targetScale = 0.65; targetRotateY = dir * -35;
                    targetOpacity = 0.25; targetZ = 2;
                } else {
                    targetX = dir * X_STEP * 3; targetScale = 0.5; targetRotateY = 0;
                    targetOpacity = 0; targetZ = 0;
                }

                const isCenter = abs === 0;
                const isEntering = (i === ci);
                const isLeaving = (i === prevCi && i !== ci);

                // Stagger: leaving card goes first, entering card follows
                let dur, ease, delay;
                if (isLeaving) {
                    dur = 0.45; ease = 'power3.out'; delay = 0;
                } else if (isEntering) {
                    dur = 0.7; ease = 'power2.out'; delay = 0.3;
                    card.style.zIndex = 11; // above center during transition
                } else {
                    dur = 0.5; ease = 'power2.inOut';
                    delay = abs === 1 ? 0.05 : 0.1;
                }

                tl.to(card, {
                    x: targetX, scale: targetScale, rotateY: targetRotateY,
                    opacity: targetOpacity, zIndex: targetZ,
                    duration: dur, ease: ease
                }, delay);

                card.style.pointerEvents = abs <= 2 ? 'auto' : 'none';

                if (isCenter) {
                    card.classList.add('active');
                    // Animate card info stagger
                    const info = card.querySelector('.carousel-card-info');
                    const badge = card.querySelector('.badge');
                    const title = card.querySelector('h3');
                    const price = card.querySelector('.offer-price') || card.querySelector('.old-price');
                    const btn = card.querySelector('.add-to-cart');
                    if (info) tl.fromTo(info, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.25);
                    if (badge) tl.fromTo(badge, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }, 0.3);
                    if (title) tl.fromTo(title, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.35);
                    if (price) tl.fromTo(price, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.4);
                    if (btn) tl.fromTo(btn, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.45);
                }
            });

            // Spotlight move
            tl.to(spotlight, { left: '50%', duration: 0.5, ease: 'power2.inOut' }, 0);

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
                x: abs === 0 ? 0 : dir * X_STEP * abs,
                scale: abs === 0 ? 1 : abs === 1 ? 0.82 : abs === 2 ? 0.65 : 0.5,
                rotateY: abs === 0 ? 0 : dir * (abs === 1 ? -18 : -35),
                opacity: abs === 0 ? 1 : abs === 1 ? 0.55 : abs === 2 ? 0.25 : 0,
                zIndex: abs === 0 ? 10 : abs === 1 ? 5 : abs === 2 ? 2 : 0
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
            const offset = window.innerWidth < 768 ? 80 : 70;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // ─── MOBILE BOTTOM NAVBAR ────────────────────────────────
    const mobileNav = document.getElementById('mobileNav');
    const mobileCartBtn = document.getElementById('mobileCartBtn');
    const mobileCartCount = document.getElementById('mobileCartCount');
    if (mobileCartBtn) {
        mobileCartBtn.addEventListener('click', () => {
            document.getElementById('cartSidebar').classList.add('active');
            document.getElementById('cartOverlay').classList.add('active');
            document.body.style.overflow = 'hidden';
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
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile() ? 1 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    addEventListener('resize', () => {
        w = innerWidth; h = innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
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

    // ── TV Object (Televisor Curved OLED Premium) ──
    const tvGroup = new THREE.Group();
    
    // Curved back chassis housing
    const tvBody = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.7, 0.15), tvFrameMat);
    tvGroup.add(tvBody);
    
    // Glossy OLED curved screen
    const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(4.28, 2.58, 0.05), tvScreenMat);
    tvScreen.position.z = 0.07;
    tvGroup.add(tvScreen);
    
    // Chrome bezels
    const bezelGeom = new THREE.BoxGeometry(4.34, 2.64, 0.08);
    const bezel = new THREE.Mesh(new THREE.EdgesGeometry(bezelGeom), new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.55 }));
    tvGroup.add(bezel);
    
    // Premium Arc stand
    const standArcGeom = new THREE.TorusGeometry(0.8, 0.05, 8, 32, Math.PI);
    const standArc = new THREE.Mesh(standArcGeom, tvFrameMat);
    standArc.position.set(0, -1.3, 0);
    standArc.rotation.x = Math.PI / 2;
    tvGroup.add(standArc);
    
    const standColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.4, 16), tvFrameMat);
    standColumn.position.set(0, -1.4, 0);
    tvGroup.add(standColumn);
    
    // Power LED dot indicator
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    led.position.set(0, -1.28, 0.1);
    tvGroup.add(led);
    
    // Ambient Backlight Glow behind TV
    const backGlow = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 3.2), new THREE.MeshBasicMaterial({
        color: 0x00a8ff,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    }));
    backGlow.position.z = -0.15;
    tvGroup.add(backGlow);
    
    tvGroup.visible = false;
    scene.add(tvGroup);

    // ── Speaker Object (Smart Home Hub / Parlante) ──
    const speakerGroup = new THREE.Group();
    
    // Cylindrical main mesh-textured cabinet
    const spkBody = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 3.0, 32), cabinetMat);
    speakerGroup.add(spkBody);
    
    // Premium Gold highlight rings
    const spkRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.87, 0.03, 8, 32), goldMat);
    spkRing1.rotation.x = Math.PI / 2;
    spkRing1.position.y = 1.2;
    speakerGroup.add(spkRing1);
    
    const spkRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.87, 0.03, 8, 32), goldMat);
    spkRing2.rotation.x = Math.PI / 2;
    spkRing2.position.y = -1.2;
    speakerGroup.add(spkRing2);
    
    // Reflective glass top touch controls
    const spkTop = new THREE.Mesh(new THREE.CylinderGeometry(0.83, 0.83, 0.05, 32), glassTopMat);
    spkTop.position.y = 1.5;
    speakerGroup.add(spkTop);
    
    // Glowing LED rainbow ring at the top
    const spkLedRing = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.025, 8, 64), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    spkLedRing.rotation.x = Math.PI / 2;
    spkLedRing.position.y = 1.53;
    speakerGroup.add(spkLedRing);
    
    // Active front-facing bass driver / diaphragm
    const bassDriver = new THREE.Group();
    const spkCone = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.15, 32), new THREE.MeshStandardMaterial({
        color: 0x1a2128,
        metalness: 0.7,
        roughness: 0.6
    }));
    spkCone.rotation.x = Math.PI / 2;
    bassDriver.add(spkCone);
    
    // Central copper/gold core dome
    const spkDome = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), goldMat);
    spkDome.position.z = 0.07;
    bassDriver.add(spkDome);
    bassDriver.position.set(0, 0.2, 0.78);
    speakerGroup.add(bassDriver);
    
    // Side passive bass radiators (Left and Right gold details)
    const radiatorL = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 16), goldMat);
    radiatorL.rotation.z = Math.PI / 2;
    radiatorL.position.set(-0.86, -0.3, 0);
    speakerGroup.add(radiatorL);
    
    const radiatorR = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 16), goldMat);
    radiatorR.rotation.z = Math.PI / 2;
    radiatorR.position.set(0.86, -0.3, 0);
    speakerGroup.add(radiatorR);
    
    speakerGroup.visible = false;
    scene.add(speakerGroup);

    // ── Phone Object (Smartphone Premium / Celular) ──
    const phoneGroup = new THREE.Group();
    
    // Beveled aluminum frame chassis
    const phBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.8, 0.16), phoneChassisMat);
    phoneGroup.add(phBody);
    
    // Holographic borderless physical screen
    const phScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.72, 3.72), phoneScreenMat);
    phScreen.position.z = 0.085;
    phoneGroup.add(phScreen);
    
    // Outer neon edge glow line
    const phEdge = new THREE.Mesh(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.8, 3.8, 0.16)), new THREE.LineBasicMaterial({ color: 0x8a2be2, transparent: true, opacity: 0.55 }));
    phoneGroup.add(phEdge);
    
    // Camera module mount on the back
    const camModule = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.06), glassTopMat);
    camModule.position.set(0.4, 1.1, -0.09);
    phoneGroup.add(camModule);
    
    // Triple premium camera rings (gold borders + dark glass lenses)
    for (let i = 0; i < 3; i++) {
        // Gold lens rings
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 32), goldMat);
        ring.position.set(0.4, 1.4 - i * 0.3, -0.11);
        phoneGroup.add(ring);
        
        // Dark glass lenses
        const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16), glassTopMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(0.4, 1.4 - i * 0.3, -0.1);
        phoneGroup.add(lens);
    }
    
    phoneGroup.visible = false;
    scene.add(phoneGroup);

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
    const particlesMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.05,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particleSystem);

    const objects = [tvGroup, speakerGroup, phoneGroup];
    const labels = document.querySelectorAll('.showcase-label');

    // ── Initial State Setup ──
    let currentIdx = 0;
    let progress = 0;
    objects[0].visible = true;
    objects[0].scale.set(1, 1, 1);
    if (labels[0]) labels[0].classList.add('active');

    // ── ScrollTrigger Integration ──
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
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
                    gsap.to(objects[currentIdx].scale, { 
                        x: 1, y: 1, z: 1, 
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
                obj.position.y = Math.sin(time * 0.03) * 0.1;
                obj.position.x = Math.cos(time * 0.02) * 0.05;
            }
        });

        // Pulsación suave en la intensidad de las luces de ambientación
        cyanLight.intensity = 2.5 + Math.sin(time * 0.03) * 0.6;
        purpleLight.intensity = 2.0 + Math.cos(time * 0.03) * 0.4;

        renderer.render(scene, camera);
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
