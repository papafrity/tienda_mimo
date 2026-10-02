

// ─── LOW-END DEVICE DETECTION ───
window.isLowEndDevice = () => {
    try {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
        if (navigator.deviceMemory && navigator.deviceMemory <= 3) return true;
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) return true;
        const ua = navigator.userAgent;
        const androidMatch = ua.match(/Android\s([0-9\.]+)/);
        if (androidMatch && parseFloat(androidMatch[1]) <= 8) return true;
        return false;
    } catch(e) {
        return false;
    }
};

if (window.isLowEndDevice()) {
    document.documentElement.classList.add("low-end-mode");
    console.warn("Modo Bajo Rendimiento Activado: Animaciones pesadas y 3D deshabilitados.");
}


// ─── DEFENSIVE STUBS PARA CDNs (EVITA CRASHES EN CELULARES) ───
if (typeof gsap === "undefined") {
    console.warn("GSAP no cargó. Usando stubs para evitar crasheos.");
    window.gsap = {
        to: () => {}, from: () => {}, fromTo: () => {}, set: () => {},
        registerPlugin: () => {}, killTweensOf: () => {}, quickTo: () => () => {},
        utils: { toArray: () => [], interpolate: (a) => a },
        timeline: () => ({ to: function(){return this;}, from: function(){return this;}, fromTo: function(){return this;} })
    };
}

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
    // START FETCHING CORE DATA IMMEDIATELY
    // We execute this in a setTimeout so it runs asynchronously and avoids blocking UI setup.
    // If any UI animation crashes (like GSAP missing on mobile), this will still run and load the products.
    setTimeout(() => {
        try {
            if (typeof fetchProducts === 'function') fetchProducts();
        } catch(e) { console.error('fetchProducts start error:', e); }
    }, 0);
    // ─── PRELOADER ──────────────────────────────────────────
    const preloader = document.getElementById('preloader');
    const navbar = document.getElementById('navbar');
    setTimeout(() => {
        if (preloader) preloader.classList.add('done');
        setTimeout(() => { if (navbar) navbar.classList.add('--active'); }, 110);
    }, 50);

    // ─── CUSTOM CURSOR ──────────────────────────────────────
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (ring) ring.style.display = 'none';

    if (dot && !window.isLowEndDevice()) {
        if (typeof gsap !== 'undefined') {
            gsap.set(dot, { xPercent: -50, yPercent: -50 });
        }

        let targetEl = null;

        document.addEventListener('mousemove', e => {
            if (!targetEl) {
                gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' });
            }
        });

        const interactables = document.querySelectorAll('a, button, .product-card, .carousel-card, .filter-tab, .cart-btn, .search-toggle');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                targetEl = el;
                const r = el.getBoundingClientRect();
                gsap.to(dot, { 
                    x: r.left + r.width / 2, 
                    y: r.top + r.height / 2, 
                    width: r.width + 16, 
                    height: r.height + 16, 
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0, 240, 255, 0.08)',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    duration: 0.3, 
                    ease: 'back.out(1.5)' 
                });
            });
            el.addEventListener('mouseleave', (e) => {
                targetEl = null;
                gsap.to(dot, {
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 240, 255, 0.4)',
                    border: 'none',
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.3, 
                    ease: 'power2.out'
                });
            });
        });
    }

    // SPLIT TITLE
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
            const spotlight = card.querySelector('.card-spotlight');
            let xTo = (typeof gsap !== 'undefined') ? gsap.quickTo(card, "rotateY", { duration: 0.08, ease: "power1.out" }) : null;
            let yTo = (typeof gsap !== 'undefined') ? gsap.quickTo(card, "rotateX", { duration: 0.08, ease: "power1.out" }) : null;
            let yMove = (typeof gsap !== 'undefined') ? gsap.quickTo(card, "y", { duration: 0.08, ease: "power1.out" }) : null;

            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                const cx = r.width / 2;
                const cy = r.height / 2;
                if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }
                if (spotlight) { spotlight.style.setProperty('--spot-x', x + 'px'); spotlight.style.setProperty('--spot-y', y + 'px'); }

                const rotX = ((y - cy) / cy) * -9;
                const rotY = ((x - cx) / cx) * 9;
                if (xTo && yTo && yMove) {
                    xTo(rotY);
                    yTo(rotX);
                    yMove(-6);
                } else {
                    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
                }
            });
            card.addEventListener('mouseleave', () => {
                if (xTo && yTo && yMove) {
                    xTo(0);
                    yTo(0);
                    yMove(0);
                } else {
                    card.style.transform = '';
                }
            });
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

    // ─── PRECIOS POR CANTIDAD (MAYORISTA) ───────────────
    // tiers: [{minQty, cost, price}] — el tramo alcanzado gana a la oferta.
    function validTiers(p) {
        if (!p || !Array.isArray(p.tiers)) return [];
        return p.tiers.filter(t => t && t.minQty >= 2 && t.price > 0).sort((a, b) => a.minQty - b.minQty);
    }
    function tierForQty(p, qty) {
        let best = null;
        validTiers(p).forEach(t => { if (qty >= t.minQty) best = t; });
        return best;
    }
    function unitPriceForQty(p, qty) {
        const t = tierForQty(p, qty);
        if (t) return { price: t.price, tier: t };
        return { price: offerVal(p), tier: null };
    }
    function tiersHintHtml(p) {
        const ts = validTiers(p);
        if (!ts.length) return '';
        return `<div class="tier-hint">${ts.map(t => `<span>Llevando ${t.minQty}+: $${fmt(t.price)}</span>`).join('')}</div>`;
    }

    // ─── PRECIOS DINÁMICOS CON DÓLAR ─────────────────
    // Los productos con costCurrency = 'USD' recalculan su precio en ARS
    // automáticamente con el dólar blue del momento (misma fórmula del admin).
    const MP_REAL_FEE = 0.0781; // 6.45% + IVA
    let usdRateARS = null;

    function roundPrice(v) { return v < 100 ? v : Math.ceil(v / 100) * 100; }

    function calcPriceFromUSD(costUSD, margin) {
        const costARS = costUSD * (usdRateARS || 0);
        if (!costARS) return null;
        const basePrice = costARS * (1 + (margin / 100));
        return roundPrice(basePrice / (1 - MP_REAL_FEE));
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

    async function fetchUsdRate() { try { const controller = new AbortController(); const id = setTimeout(() => controller.abort(), 3500); const resp = await fetch('https://dolarapi.com/v1/dolares/blue', { signal: controller.signal }); clearTimeout(id); const data = await resp.json(); if (data && data.venta) usdRateARS = data.venta; } catch(e) { console.warn('API timeout'); } }

        function renderStarsHtml(rating) {
        const hasRating = rating && typeof rating === 'number' && rating > 0;
        const r = hasRating ? Math.round(rating) : 0;
        let html = "<div style='display:flex;gap:2px;'>";
        for (let i = 1; i <= 5; i++) {
            if (r >= i) {
                html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="#ffd700" stroke="#ffd700" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
            } else {
                html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
            }
        }
        html += "</div>";
        return html;
    }

    // ─── SUBCATEGORÍAS CON IMÁGENES REFERENCIALES (ESTILO MERCADO LIBRE FUTURISTA) ───
    const subCategoriesMap = {
        tecnologia: [
            { id: 'celulares', label: 'Celulares', img: 'img/subcats/1790441068394.jpg' },
            { id: 'auriculares', label: 'Auriculares', img: 'img/subcats/1790365169365.jpg' },
            { id: 'relojes-fundas', label: 'Smartwatches', img: 'img/subcats/1790441077547.jpg' },
            { id: 'televisores', label: 'Smart TVs', img: 'img/subcats/1790441082430.jpg' },
            { id: 'parlantes', label: 'Parlantes', img: 'img/subcats/1790365183333.jpg' },
            { id: 'gaming', label: 'Gaming', img: 'img/subcats/1790365187178.jpg' },
            { id: 'pc', label: 'Notebooks', img: 'img/subcats/1790365190741.jpg' },
            { id: 'tvbox', label: 'TV Box / Sticks', img: 'img/subcats/1790365195074.jpg' },
            { id: 'cargadores-accesorios', label: 'Cargadores', img: 'img/subcats/1790365202104.jpg' },
            { id: 'gadgets', label: 'Gadgets', img: 'img/subcats/1790365285386.jpg' }
        ],
        hogar: [
            { id: 'hogar-muebles', label: 'Living y Comedor', img: 'img/subcats/1790365426288.jpg' },
            { id: 'cocinas', label: 'Cocina y Bazar', img: 'img/subcats/1790365538254.jpg' },
            { id: 'bano', label: 'Baño', img: 'img/subcats/1790365855682.jpg' },
            { id: 'decoracion', label: 'Decoración', img: 'img/subcats/1790366427771.jpg' },
            { id: 'iluminacion-gadgets', label: 'Iluminación', img: 'img/subcats/1790366962089.jpg' },
            { id: 'limpieza', label: 'Limpieza', img: 'img/subcats/1790367238211.jpg' },
            { id: 'exteriores', label: 'Jardín y Exterior', img: 'img/subcats/1790367536982.jpg' }
        ],
        electro: [
            { id: 'climatizacion', label: 'Aires y Clima', img: 'img/subcats/1790375730285.jpg' },
            { id: 'calefaccion', label: 'Calefacción', img: 'img/subcats/1790441467459.jpg' },
            { id: 'ventilacion', label: 'Ventilación', img: 'img/subcats/1790376565731.jpg' },
            { id: 'belleza', label: 'Belleza y Cuidado', img: 'img/subcats/1790376751069.jpg' }
        ],
        varios: [
            { id: 'herramientas', label: 'Herramientas', img: 'img/subcats/1790374642412.jpg' },
            { id: 'bicicletas', label: 'Bicicletas', img: 'img/subcats/1790376954013.jpg' },
            { id: 'movilidad', label: 'Monopatines', img: 'img/subcats/1790377061826.jpg' },
            { id: 'deportes', label: 'Fitness y Deportes', img: 'img/subcats/1790377222331.jpg' }
        ]
    };

    let currentGroup = 'all';
    let currentSubCategory = 'all';

    function renderSubcategories(group) {
        const container = document.getElementById('subcategoriesContainer');
        if (!container) return;

        if (group === 'all' || !subCategoriesMap[group]) {
            container.style.display = 'none';
            container.innerHTML = '';
            return;
        }

        const items = subCategoriesMap[group];
        container.style.display = 'flex';

        let html = `
            <div class="sub-cat-item ${currentSubCategory === 'all' ? 'active' : ''}" data-filter="all">
                <div class="sub-cat-circle sub-cat-all-circle">
                    <img src="img/subcats/1790441829833.jpg" alt="Ver Todo" loading="lazy" decoding="async">
                </div>
                <span class="sub-cat-label">Ver Todo</span>
            </div>
        `;

        html += items.map(sub => {
            const catalogProd = (products || []).find(p => p.category === sub.id && p.image && p.isActive !== false);
            const isCustomCover = sub.img && (sub.img.includes('1790') || sub.isCustom);
            const fallbackSrc = (catalogProd && catalogProd.image) ? catalogProd.image : '';
            const imgSrc = isCustomCover ? sub.img : (fallbackSrc || sub.img);
            const isActive = currentSubCategory === sub.id ? 'active' : '';

            return `
                <div class="sub-cat-item ${isActive}" data-filter="${sub.id}">
                    <div class="sub-cat-circle">
                        <img src="${imgSrc}" alt="${sub.label}" loading="lazy" decoding="async" onerror="if('${fallbackSrc}' && this.src !== '${fallbackSrc}') this.src='${fallbackSrc}';">
                    </div>
                    <span class="sub-cat-label">${sub.label}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = html;

        container.querySelectorAll('.sub-cat-item').forEach(item => {
            item.addEventListener('click', () => {
                const subFilter = item.dataset.filter;
                currentSubCategory = subFilter;

                container.querySelectorAll('.sub-cat-item').forEach(i => {
                    i.classList.toggle('active', i.dataset.filter === currentSubCategory);
                });

                renderProducts();
            });
        });
    }

    
window.getInstallmentsHtml = function(price) {
    if (typeof window.STORE_CONFIG === "undefined" || !window.STORE_CONFIG.installmentCount || window.STORE_CONFIG.installmentCount <= 0) return "";
    const cuotas = window.STORE_CONFIG.installmentCount;
    const coef = window.STORE_CONFIG.installmentMultiplier || 1.0;
    const cuotaPrice = (price * coef) / cuotas;
    return `<div class="installment-info" style="font-size: 0.85rem; color: var(--accent-color); font-weight: 600; margin-top: 2px; margin-bottom: 5px;">💳 ${cuotas} cuotas fijas de $${fmt(cuotaPrice)}</div>`;
};

    function renderProducts() {
        try {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        const sortBy = document.getElementById('sortSelect')?.value || 'default';
        const priceMin = parseFloat(document.getElementById('priceMin')?.value) || 0;
        const priceMax = parseFloat(document.getElementById('priceMax')?.value) || Infinity;
        let filtered = products.filter(p => p.isActive !== false);

        if (currentSubCategory !== 'all') {
            filtered = filtered.filter(p => p.category === currentSubCategory);
        } else if (currentGroup !== 'all' && subCategoriesMap[currentGroup]) {
            const groupCatIds = subCategoriesMap[currentGroup].map(s => s.id);
            filtered = filtered.filter(p => groupCatIds.includes(p.category));
        }

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
        document.querySelectorAll('#productGrid .product-card').forEach(c => {
            c.style.opacity = '1';
            c.style.visibility = 'visible';
        });
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();

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
                ? `<p class="price"><span class="price-old">$${fmt(p.price)}</span><span class="price-offer">$${fmt(p.offerPrice)}</span></p>`
                : `<p class="price"><span class="price-offer">$${fmt(offerVal(p))}</span></p>`;
              let basePriceForInstallments = hasDiscount ? p.offerPrice : offerVal(p);
              priceHtml += window.getInstallmentsHtml(basePriceForInstallments);
                
            grid.innerHTML += `
            <div class="product-card tilt-card" data-category="${p.category}" data-id="${p.id}" style="transition-delay:${Math.min(idx * .04, .3)}s">
                <div class="card-glow"></div>
                <div class="card-spotlight"></div>
                <div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async"></div>
                <div class="product-info">
                    
                    <h3>${p.name}</h3>
                    <div class="stars">${renderStarsHtml(p.rating)}${p.reviewCount ? `<span class="review-count">(${p.reviewCount})</span>` : ''}</div>
                    ${priceHtml}
                    ${tiersHintHtml(p)}
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
        const track = document.getElementById('carouselTrack');
        if (!track) return;
        track.innerHTML = '';
        
        const featured = products.filter(p => p.isFeatured && p.isActive !== false);
        if (featured.length === 0) {
            const allActive = products.filter(p => p.isActive !== false);
            featured.push(...allActive.slice(0, 8));
        }

        featured.forEach(p => {
            const hasDiscount = p.oldPrice && p.offerPrice && p.oldPrice !== p.offerPrice;
            let priceHtml = hasDiscount 
                ? `<p class="old-price">$${fmt(p.oldPrice)}</p><p class="offer-price">$${fmt(p.offerPrice)}</p>` 
                : `<p class="offer-price">$${fmt(offerVal(p))}</p>`;
            
            let basePriceForInstallments = hasDiscount ? p.offerPrice : offerVal(p);
            priceHtml += window.getInstallmentsHtml(basePriceForInstallments);
                
            const card = document.createElement('div');
            card.className = 'carousel-card';
            card.dataset.productId = p.id;
            
            // Add click listener to the whole card to open modal
            card.addEventListener('click', () => {
                if (typeof window.openProductModal === 'function') {
                    window.openProductModal(p.id);
                }
            });

            card.innerHTML = `
                <div class="product-image">
                    <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async">
                </div>
                <h3>${p.name}</h3>
                <div class="stars" style="margin-bottom: 0.5rem;">${renderStarsHtml(p.rating)}${p.reviewCount ? `<span class="review-count">(${p.reviewCount})</span>` : ''}</div>
                <div class="price-container">
                    ${priceHtml}
                </div>
                <button class="add-to-cart-btn magnetic-btn" data-product-id="${p.id}">Agregar al Carrito</button>
            `;
            
            const btn = card.querySelector('.add-to-cart-btn');
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (typeof window.addToCart === 'function') {
                    window.addToCart(p.id);
                }
            });

            // Re-bind magnetic effect
            if (typeof bindMagneticEffect === 'function') bindMagneticEffect(btn);

            track.appendChild(card);
        });
        
        initCarouselLogic();
    }
    window.retryFetchProducts = () => {
        const grid = document.getElementById('productGrid');
        if (grid) grid.innerHTML = '';
        if (typeof showSkeletons === 'function') showSkeletons();
        fetchProducts();
    };

    function showProductsError(msg) {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        
        const safeMsg = (msg || '').toString().toLowerCase();
        const isOffline = safeMsg.includes('offline') || safeMsg.includes('failed to fetch') || safeMsg.includes('timeout') || safeMsg.includes('network');
        const displayMsg = isOffline 
            ? "Parece que tu conexión a internet es lenta o se cortó." 
            : (safeMsg.includes('permission') ? 'Verificá las reglas de Firestore (allow read)' : msg);

        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;color:var(--text-secondary)">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin:0 auto 1.5rem;opacity:.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <h3 style="margin:0 0 .5rem;color:var(--text-primary)">Error de conexión</h3>
                <p style="margin:0 0 1.8rem;font-size:.9rem">${displayMsg}</p>
                <button onclick="window.retryFetchProducts()" class="magnetic-btn" style="padding:0.8rem 2.5rem;border-radius:50px;background:var(--gradient-glow);color:#fff;border:none;font-weight:bold;cursor:pointer;font-size:1rem;font-family:'Outfit',sans-serif;box-shadow: 0 4px 20px rgba(0, 240, 255, 0.2);">
                    Reintentar Carga
                </button>
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
        
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '¡Agregado! ✔️';
            btn.style.backgroundColor = 'rgba(46, 213, 115, 0.15)';
            btn.style.borderColor = '#2ed573';
            btn.style.color = '#2ed573';
            if (window.gsap) gsap.fromTo(btn, { scale: 0.9 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 1500);
        }

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
                const up = unitPriceForQty(item, item.qty);
                const price = up.price;
                total += price * item.qty;
                count += item.qty;

                cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${fmt(price)}${up.tier ? ` <span class="tier-badge">Mayorista ${up.tier.minQty}+</span>` : ''}</p>
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
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!track) return;

    if (prevBtn && nextBtn) {
        // Remove old listeners by cloning
        const newPrev = prevBtn.cloneNode(true);
        const newNext = nextBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        
        const scrollAmount = 350; // pixels to scroll per click
        
        newPrev.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        
        newNext.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    // Optional drag-to-scroll functionality for desktop
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
        isDown = true;
        track.style.cursor = 'grabbing';
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });
    
    track.addEventListener('mouseleave', () => {
        isDown = false;
        track.style.cursor = 'pointer';
    });
    
    track.addEventListener('mouseup', () => {
        isDown = false;
        track.style.cursor = 'pointer';
    });
    
    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 2; // scroll-fast
        track.scrollLeft = scrollLeft - walk;
    });
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
                        const up = unitPriceForQty(item, item.qty);
                        return {
                            id: item.id,
                            name: item.name,
                            price: Number(up.price),
                            qty: item.qty,
                            tierMinQty: up.tier ? up.tier.minQty : null,
                            cost: cost,
                            costCurrency: costCurrency,
                            costARS: costARS,
                            margin: (p && p.margin) || 0
                        };
                    }),
                    status: 'initiated',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    total: cart.reduce((sum, item) => sum + (Number(unitPriceForQty(item, item.qty).price) * item.qty), 0),
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
                    if (typeof fbq === "function") fbq("track", "InitiateCheckout");
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
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(btn => btn.classList.remove('active'));
                    tab.classList.add('active');

                    const group = tab.dataset.group || 'all';
                    currentGroup = group;
                    currentSubCategory = 'all';

                    renderSubcategories(group);
                    renderProducts();
                });
            });

            // Si hay un tab activo de antemano, renderizar sus subcategorías
            const activeTab = document.querySelector('.filter-tab.active');
            if (activeTab) {
                currentGroup = activeTab.dataset.group || 'all';
                renderSubcategories(currentGroup);
            }


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
            if (new URLSearchParams(window.location.search).get("p") !== prodId) history.pushState(null, "", "?p=" + encodeURIComponent(prodId));
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
            let basePriceForInstallments = hasDiscount ? p.offerPrice : offerVal(p);
            mPr.innerHTML += window.getInstallmentsHtml(basePriceForInstallments);
            const tiersToggle = document.getElementById('modalTiersToggle');
            const tiersList = document.getElementById('modalTiersList');
            if (tiersToggle && tiersList) {
                const ts = validTiers(p);
                if (!ts.length) {
                    tiersToggle.style.display = 'none';
                    tiersList.style.display = 'none';
                } else {
                    tiersToggle.style.display = '';
                    tiersToggle.classList.remove('open');
                    tiersList.style.display = 'none';
                    tiersList.innerHTML =
                        `<div class="tier-row"><span>x1</span><span>$${fmt(offerVal(p))}</span></div>` +
                        ts.map(t => `<div class="tier-row"><span>x${t.minQty}</span><span>$${fmt(t.price)}</span></div>`).join('');
                    tiersToggle.onclick = () => {
                        const isOpen = tiersList.style.display !== 'none';
                        tiersList.style.display = isOpen ? 'none' : 'block';
                        tiersToggle.classList.toggle('open', !isOpen);
                    };
                }
            }
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

        function closeM() { document.getElementById('productModal').classList.remove('active'); document.body.style.overflow = ''; if(window.location.search.includes('?p=')) history.pushState(null, '', window.location.pathname); }

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
        document.querySelectorAll('#productGrid .product-card').forEach(c => {
            c.style.opacity = '1';
            c.style.visibility = 'visible';
        });
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();

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
                searchResults.innerHTML = '<div class="search-no-results">Escribíe al menos 2 caracteres...</div>';
                return;
            }

            const matches = products
                .filter(p => p.isActive !== false)
                .filter(p =>
                    (p.name && p.name.toLowerCase().includes(query)) ||
                    (p.category && p.category.toLowerCase().includes(query)) ||
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
                    <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async">
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
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.category && p.category.toLowerCase().includes(q)) ||
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
                        <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async">
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
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();

            // Parpadeo instantáneo
            if (typeof gsap !== 'undefined') {
                gsap.killTweensOf(window);
                if (typeof smoother !== 'undefined' && smoother) gsap.killTweensOf(smoother);
            }
            
            const html = document.documentElement;
            const body = document.body;
            html.style.setProperty('scroll-behavior', 'auto', 'important');
            body.style.setProperty('scroll-behavior', 'auto', 'important');

            const isMobile = window.innerWidth < 768;
            const offset = isMobile ? 80 : 70;
            
            const currentScroll = (typeof smoother !== 'undefined' && smoother) 
                ? smoother.scrollTop() 
                : (window.pageYOffset || html.scrollTop);
            const targetScroll = Math.max(0, currentScroll + target.getBoundingClientRect().top - offset);

            if (typeof smoother !== 'undefined' && smoother) {
                try {
                    smoother.scrollTo(targetScroll, false);
                    smoother.scrollTop(targetScroll);
                } catch(err) {}
            }
            window.scrollTo(0, targetScroll);
            html.scrollTop = targetScroll;
            body.scrollTop = targetScroll;

            setTimeout(() => {
                html.style.removeProperty('scroll-behavior');
                body.style.removeProperty('scroll-behavior');
            }, 60);
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
    if (typeof ScrollSmoother !== 'undefined' && !window.isLowEndDevice()) {
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
    /* product-card ScrollTrigger.batch removed to ensure cards are always visible */
// ─── BACK TO TOP BUTTON (TELEPORT INSTANTÁNEO) ───────────
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top -400',
            end: 'top -400',
            onEnter: () => backToTop.classList.add('visible'),
            onLeaveBack: () => backToTop.classList.remove('visible')
        });

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // 1. Matar cualquier animación activa de GSAP
            if (typeof gsap !== 'undefined') {
                gsap.killTweensOf(window);
                if (typeof smoother !== 'undefined' && smoother) {
                    gsap.killTweensOf(smoother);
                }
            }

            // 2. Desactivar temporalmente el scroll-behavior smooth del navegador
            const html = document.documentElement;
            const body = document.body;
            html.style.setProperty('scroll-behavior', 'auto', 'important');
            body.style.setProperty('scroll-behavior', 'auto', 'important');

            // 3. Teletransportar ScrollSmoother instantáneamente sin transición (false)
            if (typeof smoother !== 'undefined' && smoother) {
                try {
                    smoother.scrollTo(0, false);
                    smoother.scrollTop(0);
                } catch(err) {}
            }

            // 4. Teletransportar scroll nativo a 0 instantáneamente
            window.scrollTo(0, 0);
            html.scrollTop = 0;
            body.scrollTop = 0;

            // 5. Restaurar comportamiento luego del parpadeo
            setTimeout(() => {
                html.style.removeProperty('scroll-behavior');
                body.style.removeProperty('scroll-behavior');
            }, 60);
        });
    }
})();

// ─── // INTERACTIVE BACKGROUND (THREE.JS 3D) ─────────────────
(function () {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas || typeof THREE === 'undefined' || window.isLowEndDevice()) return;
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

// INTERACTIVE BACKGROUND (THREE.JS 3D) ─────────────────
(function () {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas || typeof THREE === 'undefined' || window.isLowEndDevice()) return;
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

// ─── SHOWCASE IMAGE SEQUENCE (APPLE STYLE) ──────────────────────────────────


// INTERACTIVE BACKGROUND (THREE.JS 3D) ─────────────────
(function () {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas || typeof THREE === 'undefined' || window.isLowEndDevice()) return;
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

    // Hero title: scroll-linked parallax + glow (continuous)
    const heroTitle = document.getElementById('heroTitle');
    const heroSection = document.getElementById('home');
    if (heroTitle && heroSection) {
        // Glow pulsante permanente (vida en el título)
        gsap.to(heroTitle, {
            filter: 'drop-shadow(0 0 18px rgba(0,240,255,.45)) drop-shadow(0 0 40px rgba(138,43,226,.25))',
            duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut'
        });
        // Reacción al scroll: sube más lento (parallax) y se atenúa al salir del hero
        gsap.to(heroTitle, {
            scrollTrigger: {
                trigger: heroSection,
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: 60, opacity: 0.4,
            ease: 'none'
        });
    }

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
            gsap.fromTo(content, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out', clearProps: 'transform' });
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

// ─── CHATBOT MIMO (POLLINATIONS AI + ASISTENTE LOCAL) ───
(function () {
    const chatbotWrapper = document.getElementById('mimoChatbot');
    const chatbotBubble = document.getElementById('chatbotBubble');
    const chatbotCloseBtn = document.getElementById('chatbotCloseBtn');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotNotif = document.getElementById('chatbotNotif');
    const suggestions = document.querySelectorAll('.chatbot-chip');

    if (!chatbotWrapper || !chatbotBubble) return;

    let conversationHistory = [];
    let isWaitingResponse = false;

    // Mensaje de bienvenida
    function initWelcomeMessage() {
        if (chatbotMessages.children.length === 0) {
            appendMessage('bot', '¡Hola! 👋 Soy el asistente virtual de **Mimo!** ¿En qué te puedo ayudar hoy? Podés preguntarme sobre nuestros productos, precios, envíos o formas de pago.');
        }
    }

    // Toggle abrir/cerrar
    function toggleChat(open) {
        const isOpen = open !== undefined ? open : !chatbotWrapper.classList.contains('open');
        if (isOpen) {
            chatbotWrapper.classList.add('open');
            chatbotWrapper.setAttribute('aria-hidden', 'false');
            if (chatbotNotif) chatbotNotif.style.display = 'none';
            initWelcomeMessage();
            setTimeout(() => chatbotInput?.focus(), 200);
        } else {
            chatbotWrapper.classList.remove('open');
            chatbotWrapper.setAttribute('aria-hidden', 'true');
        }
    }

    chatbotBubble.addEventListener('click', () => toggleChat());
    if (chatbotCloseBtn) chatbotCloseBtn.addEventListener('click', () => toggleChat(false));

    // Agregar mensaje al panel
    function appendMessage(sender, text, isTyping = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chatbot-msg ${sender}${isTyping ? ' typing' : ''}`;
        
        if (isTyping) {
            msgDiv.id = 'chatbotTypingIndicator';
            msgDiv.textContent = 'Escribíiendo...';
        } else {
            // Formateo básico de markdown (negritas y listas)
            let formatted = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');
            msgDiv.innerHTML = formatted;
        }

        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        return msgDiv;
    }

    function removeTyping() {
        const el = document.getElementById('chatbotTypingIndicator');
        if (el) el.remove();
    }

    // Contexto dinámico de productos de la tienda
    function buildStoreContext() {
        const prods = window.products || [];
        if (!prods.length) {
            return 'Actualmente no hay productos cargados en catálogo.';
        }

        const categories = [...new Set(prods.map(p => p.category).filter(Boolean))];
        const productList = prods.slice(0, 150).map(p => {
            const price = p.offerPrice && p.offerPrice !== p.price ? p.offerPrice : p.price;
            return `- ${p.name} (Categoría: ${p.category || 'General'}, Precio: $${Number(price).toLocaleString('es-AR')}${p.badge ? ', Destacado: ' + p.badge : ''})`;
        }).join('\n');

        return `Eres el asistente virtual amable, profesional y conciso de "Mimo!", una tienda de tecnología premium en Argentina.
Información de la tienda:
- Categorías disponibles: ${categories.join(', ')}.
- Envíos: Envíos a todo el país. Los envíos al interior se realizan mediante empresas de encomienda/cargo a retirar en sucursal con flete a cargo del comprador.
- Pagos: Mercado Pago, tarjetas de crédito, débito y transferencias.
- Catálogo de productos disponibles ahora:
${productList}

Instrucciones:
1. Responde siempre en español rioplatense o neutro, con tono cordial y servicial.
2. Si te preguntan por un producto, usa la lista provista. Si no está en la lista, aclara con amabilidad que no lo tienes en stock actualmente pero invítalos a consultar por WhatsApp.
3. Sé breve y directo (máximo 2 a 3 oraciones por respuesta o una lista corta con viñetas •).
4. No inventes precios ni características técnicas que no estén en la lista.`;
    }

    // Llamada gratuita a Pollinations AI (sin key)
    async function askPollinations(userText) {
        const systemPrompt = buildStoreContext();
        
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-4), // últimos 2 turnos para contexto
            { role: 'user', content: userText }
        ];

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

        try {
            const res = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages,
                    model: 'openai',
                    seed: 42,
                    jsonMode: false
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const text = await res.text();
            return text.trim();
        } catch (err) {
            clearTimeout(timeout);
            console.warn('Pollinations chatbot fallback:', err);
            return localFallbackResponse(userText);
        }
    }

    // Respuestas locales inmediatas si la IA tarda o falla la red
    function localFallbackResponse(userText) {
        const q = userText.toLowerCase();
        const prods = window.products || [];

        if (q.includes('envio') || q.includes('envío') || q.includes('entregar') || q.includes('flete')) {
            return 'Realizamos envíos a todo el país. Para el interior, despachamos mediante empresas de cargo y retirás en sucursal abonando el flete al retirar. ¡Llega rápido y seguro!';
        }
        if (q.includes('pago') || q.includes('tarjeta') || q.includes('cuota') || q.includes('transferencia')) {
            return 'Aceptamos todos los medios de pago a través de Mercado Pago: tarjetas de débito, crédito en cuotas y dinero en cuenta.';
        }
        if (q.includes('oferta') || q.includes('descuento') || q.includes('promo')) {
            const offers = prods.filter(p => p.offerPrice && p.offerPrice !== p.price);
            if (offers.length) {
                const list = offers.slice(0, 3).map(p => `• **${p.name}** a $${Number(p.offerPrice).toLocaleString('es-AR')}`).join('\n');
                return `¡Sí! Tenemos estas ofertas activas ahora:\n${list}\n\nPodés verlas en la sección de ofertas.`;
            }
            return 'Podés ver las ofertas destacadas del momento en el carrusel de nuestra página principal.';
        }
        if (q.includes('producto') || q.includes('tenes') || q.includes('tienen') || q.includes('catalogo') || q.includes('stock')) {
            const categories = [...new Set(prods.map(p => p.category).filter(Boolean))];
            if (categories.length) {
                return `Tenemos productos en las siguientes categorías: **${categories.join(', ')}** (${prods.length} productos en stock). ¿Buscás algo en particular?`;
            }
            return 'Podés explorar todos nuestros productos directamente en la tienda o usar la barra de búsqueda 🔍.';
        }
        return '¡Gracias por tu consulta! Podés buscar cualquier producto en el buscador de la tienda o consultarnos lo que necesites sobre envíos, pagos y stock.';
    }

    // Enviar mensaje
    async function handleSend() {
        if (isWaitingResponse) return;
        const text = chatbotInput.value.trim();
        if (!text) return;

        // Limpiar input y agregar mensaje del usuario
        chatbotInput.value = '';
        appendMessage('user', text);
        conversationHistory.push({ role: 'user', content: text });

        // Indicador de escribiendo
        isWaitingResponse = true;
        chatbotSend.disabled = true;
        appendMessage('bot', '', true);

        try {
            const answer = await askPollinations(text);
            removeTyping();
            appendMessage('bot', answer);
            conversationHistory.push({ role: 'assistant', content: answer });
        } catch (e) {
            removeTyping();
            appendMessage('bot', localFallbackResponse(text));
        } finally {
            isWaitingResponse = false;
            chatbotSend.disabled = false;
            chatbotInput.focus();
        }
    }

    chatbotSend.addEventListener('click', handleSend);
    chatbotInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    });

    // Chips de sugerencia rápida
    suggestions.forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.dataset.msg;
            if (query) {
                chatbotInput.value = query;
                handleSend();
            }
        });
    });
})();


// ─── LIGHTWEIGHT CANVAS 2D PARTICLES ────────────────────────
(function() {
    const canvas = document.getElementById("particlesCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = window.innerWidth < 768 ? 40 : 200;
    const colors = ["#00f0ff", "#8a2be2", "#ffffff"];
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.5 + 0.1
        });
    }
    
    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
    
    
    let animationId;
    function render() {
        if (document.hidden) {
            animationId = requestAnimationFrame(render);
            return;
        }
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            // Wrap around edges
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
        });
        animationId = requestAnimationFrame(render);
    }
    render();
    
    // Pause completely if tab is hidden to save battery
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            cancelAnimationFrame(animationId);
            render();
        }
    });

})();


// ─── INTERACTIVE FAQ & SETUP FILTER HELPERS ─────────────────
window.toggleFaq = function(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const isAlreadyOpen = card.classList.contains('open');
    // Optional: close other open cards for clean accordion feel
    document.querySelectorAll('.faq-card.open').forEach(c => {
        if (c !== card) c.classList.remove('open');
    });
    card.classList.toggle('open', !isAlreadyOpen);
};

window.filterByKeyword = function(keyword) {
    const target = document.getElementById('products');
    if (target) {
        const offset = window.innerWidth < 768 ? 80 : 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        if (typeof smoother !== 'undefined' && smoother) {
            smoother.scrollTo(top, true);
        } else {
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }
    // Filter logic
    if (keyword === 'gamer' || keyword === 'office') {
        const tecTab = document.querySelector('.filter-tab[data-group="tecnologia"]');
        if (tecTab) tecTab.click();
    } else if (keyword === 'audio') {
        const heroInput = document.getElementById('heroSearchInput');
        if (heroInput) {
            heroInput.value = 'auricular';
            heroInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
};

// --- COOKIE BANNER ---
document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookieBanner');
    const btn = document.getElementById('acceptCookies');
    if (banner && btn) {
        if (!localStorage.getItem('cookiesAccepted')) {
            banner.style.display = 'flex';
        }
        btn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            banner.style.display = 'none';
        });
    }
});
