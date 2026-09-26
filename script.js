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
    if (ring) ring.style.display = 'none';

    if (dot) {
        gsap.set(dot, { xPercent: -50, yPercent: -50 });

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
            { id: 'celulares', label: 'Celulares', img: 'img/subcats/celulares.jpg' },
            { id: 'auriculares', label: 'Auriculares', img: 'img/subcats/1790365169365.jpg' },
            { id: 'relojes-fundas', label: 'Smartwatches', img: 'img/subcats/relojes-fundas.jpg' },
            { id: 'televisores', label: 'Smart TVs', img: 'img/subcats/televisores.jpg' },
            { id: 'parlantes', label: 'Parlantes', img: 'img/subcats/parlantes.jpg' },
            { id: 'gaming', label: 'Gaming', img: 'img/subcats/gaming.jpg' },
            { id: 'pc', label: 'Notebooks', img: 'img/subcats/pc.jpg' },
            { id: 'tvbox', label: 'TV Box / Sticks', img: 'img/subcats/tvbox.jpg' },
            { id: 'cargadores-accesorios', label: 'Cargadores', img: 'img/subcats/cargadores-accesorios.jpg' },
            { id: 'gadgets', label: 'Gadgets', img: 'img/subcats/gadgets.jpg' }
        ],
        hogar: [
            { id: 'hogar-muebles', label: 'Living y Comedor', img: 'img/subcats/hogar-muebles.jpg' },
            { id: 'cocinas', label: 'Cocina y Bazar', img: 'img/subcats/cocinas.jpg' },
            { id: 'bano', label: 'Baño', img: 'img/subcats/bano.jpg' },
            { id: 'decoracion', label: 'Decoración', img: 'img/subcats/decoracion.jpg' },
            { id: 'iluminacion-gadgets', label: 'Iluminación', img: 'img/subcats/iluminacion-gadgets.jpg' },
            { id: 'limpieza', label: 'Limpieza', img: 'img/subcats/limpieza.jpg' },
            { id: 'exteriores', label: 'Jardín y Exterior', img: 'img/subcats/exteriores.jpg' }
        ],
        electro: [
            { id: 'climatizacion', label: 'Aires y Clima', img: 'img/subcats/climatizacion.jpg' },
            { id: 'calefaccion', label: 'Calefacción', img: 'img/subcats/calefaccion.jpg' },
            { id: 'ventilacion', label: 'Ventilación', img: 'img/subcats/ventilacion.jpg' },
            { id: 'belleza', label: 'Belleza y Cuidado', img: 'img/subcats/belleza.jpg' }
        ],
        varios: [
            { id: 'herramientas', label: 'Herramientas', img: 'img/subcats/herramientas.jpg' },
            { id: 'bicicletas', label: 'Bicicletas', img: 'img/subcats/bicicletas.jpg' },
            { id: 'movilidad', label: 'Monopatines', img: 'img/subcats/movilidad.jpg' },
            { id: 'deportes', label: 'Fitness y Deportes', img: 'img/subcats/deportes.jpg' }
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
                    <span class="sub-cat-all-icon">⚡</span>
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
        const carousel = document.getElementById('carousel3d');
        if (!carousel) return;
        carousel.innerHTML = '';
        const featured = products.filter(p => p.isFeatured && p.isActive !== false);
        if (featured.length === 0) { const allActive = products.filter(p => p.isActive !== false); featured.push(...allActive.slice(0, 8)); }
        featured.forEach(p => {
            const hasDiscount = p.oldPrice && p.offerPrice && p.oldPrice !== p.offerPrice;
            let priceHtml = hasDiscount 
                ? `<p class="old-price">$${fmt(p.oldPrice)}</p><p class="offer-price">$${fmt(p.offerPrice)}</p>` 
                : `<p class="offer-price">$${fmt(offerVal(p))}</p>`;
                
            const card = document.createElement('div');
            card.className = 'carousel-card product-card';
            card.dataset.productId = p.id;
            card.innerHTML = `
                <div class="card-glow"></div>
                <div class="card-spotlight"></div>
                <div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async"></div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <div class="stars">${renderStarsHtml(p.rating)}${p.reviewCount ? `<span class="review-count">(${p.reviewCount})</span>` : ''}</div>
                    ${priceHtml}
                    ${tiersHintHtml(p)}
                    <button class="add-to-cart magnetic-btn" data-product-id="${p.id}">Agregar al Carrito</button>
                </div>`;
            
            const btn = card.querySelector('.add-to-cart');
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                window.addToCart(p.id, btn);
                setTimeout(initCarouselLogic, 50);
    });
            
            carousel.appendChild(card);
        });
    }

    async function fetchProducts(retries = 3) {
        try {
            // Ensure Firebase is loaded
            if (typeof db === 'undefined' || !db) {
                if (retries > 0) {
                    console.warn('Firebase not ready, retrying in 500ms...');
                    setTimeout(() => fetchProducts(retries - 1), 500);
                    return;
                }
                showProductsError('Firebase no se pudo cargar. Recargá la página.');
                return;
            }
            // Fetch USD rate in parallel (don't block product loading)
            fetchUsdRate().then(() => {
                if (applyDynamicPrices()) { renderProducts(); renderCarousel(); }
            }).catch(() => {});
            const querySnapshot = await db.collection("products").get();
            products = [];
            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });
            applyDynamicPrices();
            window.products = products;
            if (products.length === 0) {
                showEmptyProductsMessage();
            } else {
                renderProducts();
                renderCarousel();
            }
            initDynamicEvents();
            initCarouselLogic();
            initProductFiltersAndModals();

            // SEO: check if a product is in URL
            const urlParams = new URLSearchParams(window.location.search);
            const pId = urlParams.get("p");
            if (pId) {
                setTimeout(() => { if(typeof window.openProductModal === "function") window.openProductModal(pId); }, 300);
            }

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
        const track = document.getElementById('carousel3d');
        if (!track) return;
        const wrapper = track.parentElement;
        if (!wrapper) return;
        const cards = [...track.querySelectorAll('.carousel-card')];
        
        // Clean up previous event listeners by cloning the buttons
        let prevBtn = document.getElementById('prevBtn');
        let nextBtn = document.getElementById('nextBtn');
        if (prevBtn) { const clone = prevBtn.cloneNode(true); prevBtn.parentNode.replaceChild(clone, prevBtn); prevBtn = clone; }
        if (nextBtn) { const clone = nextBtn.cloneNode(true); nextBtn.parentNode.replaceChild(clone, nextBtn); nextBtn = clone; }
        
        // Clean up old GSAP and intervals
        if (window._carouselInterval) clearInterval(window._carouselInterval);
        
        const dotsC = document.getElementById('carouselDots');

        if (cards.length === 0) return;

        const realCount = cards.length;
        const isMobile = () => innerWidth < 768;

        // ── MODO MOBILE: scroll nativo fluido tipo app ──
        if (isMobile()) {
            // Quitar el posicionamiento absoluto/3D que deja el CSS desktop
            cards.forEach(c => c.style.cssText = 'position:relative;flex:0 0 260px;width:260px;height:auto;min-height:330px;padding-bottom:1.5rem;opacity:1;pointer-events:auto;transform:none;filter:none');

            // Dots
            dotsC.innerHTML = '';
            for (let i = 0; i < realCount; i++) {
                const d = document.createElement('div');
                d.classList.add('carousel-dot');
                if (i === 0) d.classList.add('active');
                d.addEventListener('click', () => scrollToCard(i));
                dotsC.appendChild(d);
            }

            let activeIdx = 0;
            function scrollToCard(i) {
                const card = cards[i];
                if (!card) return;
                track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
            }

            function updateDots() {
                dotsC.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === activeIdx));
            }

            function onScroll() {
                const center = track.scrollLeft + track.clientWidth / 2;
                let best = 0, bestDist = Infinity;
                cards.forEach((c, i) => {
                    const cCenter = c.offsetLeft + c.offsetWidth / 2;
                    const dist = Math.abs(cCenter - center);
                    if (dist < bestDist) { bestDist = dist; best = i; }
                });
                if (best !== activeIdx) { activeIdx = best; updateDots(); }
            }

            track.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });

            nextBtn.addEventListener('click', () => scrollToCard(Math.min(activeIdx + 1, realCount - 1)));
            prevBtn.addEventListener('click', () => scrollToCard(Math.max(activeIdx - 1, 0)));

            cards.forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.add-to-cart')) return;
                    const btn = card.querySelector('.add-to-cart');
                    if (btn) window.openProductModal(btn.dataset.productId);
                });
            });

            // Auto-play + pausa al tocar
            window._carouselInterval = setInterval(() => nextBtn.click(), 8000);
            track.addEventListener('touchstart', () => clearInterval(window._carouselInterval), { passive: true });
            track.addEventListener('touchend', () => { if (!window._carouselInterval) window._carouselInterval = setInterval(() => nextBtn.click(), 8000); }, { passive: true });

            onScroll();
            return;
        }

        const X_STEP = isMobile() ? 260 : 320;
        let ci = 0;
        let animating = false;

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
            // Disabled to ensure 100% instant mouse tracking
        }
        function startGlow(card) {
            // No-op — visual glow is handled via CSS :hover
        }

        // ── Mouse parallax on card images — silky follow ──
        function bindCardParallax(card) {
            let xTo = gsap.quickTo(card, "rotateY", { duration: 0.08, ease: "power1.out" });
            let yTo = gsap.quickTo(card, "rotateX", { duration: 0.08, ease: "power1.out" });

            card.addEventListener('mousemove', e => {
                if (!card.classList.contains('active')) return;
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                const cx = r.width / 2;
                const cy = r.height / 2;

                const glow = card.querySelector('.card-glow');
                const spotlight = card.querySelector('.card-spotlight');
                if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }
                if (spotlight) { spotlight.style.setProperty('--spot-x', x + 'px'); spotlight.style.setProperty('--spot-y', y + 'px'); }

                const rotX = ((y - cy) / cy) * -14;
                const rotY = ((x - cx) / cx) * 14;

                xTo(rotY);
                yTo(rotX);
            });
            card.addEventListener('mouseleave', () => {
                xTo(0);
                yTo(0);
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
            if (typeof floatingTl !== 'undefined' && floatingTl) floatingTl.kill();
            if (typeof glowTl !== 'undefined' && glowTl) glowTl.kill();

            // Remove active class from old card
            cards[prevCi].classList.remove('active');

            const tl = gsap.timeline({
                onComplete: () => {
                    animating = false;
                    startFloating(cards[ci]);
                    startGlow(cards[ci]);
                    /* parallax already bound */
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

                // Timing simplificado: movimiento sincronico
                let dur = 0.65;
                let ease = 'power3.out';
                let delay = 0;
                
                if (isEntering) card.style.zIndex = 11;

                tl.to(card, {
                    x: targetX, scale: targetScale, rotateY: targetRotateY, rotateX: targetRotateX,
                    filter: targetBlur, opacity: targetOpacity, zIndex: targetZ,
                    duration: dur, ease: ease,
                    force3D: true, transformPerspective: 1000
                }, delay);

                card.style.pointerEvents = abs <= 2 ? 'auto' : 'none';

                if (isCenter) {
                    card.classList.add('active');
                    const info = card.querySelector('.carousel-card-info');
                    const badge = card.querySelector('.badge');
                    const title = card.querySelector('h3');
                    const price = card.querySelector('.offer-price') || card.querySelector('.old-price');
                    const btn = card.querySelector('.add-to-cart');
                    const baseEase = 'expo.out';
                    
                    const baseTime = 0.15;
                    if (info) tl.fromTo(info, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: baseEase }, baseTime);
                    if (badge) tl.fromTo(badge, { scale: 0.6, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2.2)' }, baseTime + 0.05);
                    if (title) tl.fromTo(title, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: baseEase }, baseTime + 0.1);
                    if (price) tl.fromTo(price, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: baseEase }, baseTime + 0.15);
                    if (btn) tl.fromTo(btn, { y: 14, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, baseTime + 0.2);
                }
            });

            // Spotlight move
            tl.to(spotlight, { left: '50%', duration: 0.65, ease: 'power3.out' }, 0);            // Particles
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
        cards.forEach(c => bindCardParallax(c));

        // ── Auto-play más lento y con pausa en hover ──
        if (window._carouselInterval) clearInterval(window._carouselInterval);
        window._carouselInterval = setInterval(next, 8000);
        wrapper.addEventListener('mouseenter', () => clearInterval(window._carouselInterval));
        wrapper.addEventListener('mouseleave', () => {
            clearInterval(window._carouselInterval);
            window._carouselInterval = setInterval(next, 8000);
        });

        // ── Touch swipe ──
        let tsx = 0;
        wrapper.addEventListener('touchstart', e => {
            tsx = e.changedTouches[0].screenX;
            clearInterval(window._carouselInterval);
        }, { passive: true });
        wrapper.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].screenX - tsx;
            if (Math.abs(dx) > 50) { dx > 0 ? prev() : next(); }
            clearInterval(window._carouselInterval);
            window._carouselInterval = setInterval(next, 8000);
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

    // (Pedestal removido: las figuras flotan libres; la cámara apunta al centro real del objeto activo)

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
            // Guardar la media altura real del modelo escalado para centrar la flotación
            group.userData.halfH = (size.y * sFinal) / 2;
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

    const tvGroup = createTV(); tvGroup.userData.slot = 'tv'; tvGroup.userData.halfH = 1.6; tvGroup.userData.baseY = 0; scene.add(tvGroup);
    const speakerGroup = createSpeaker(); speakerGroup.userData.slot = 'speaker'; speakerGroup.userData.halfH = 1.55; speakerGroup.userData.baseY = 0; scene.add(speakerGroup);
    const phoneGroup = createPhone(); phoneGroup.userData.slot = 'phone'; phoneGroup.userData.halfH = 1.95; phoneGroup.userData.baseY = 0; scene.add(phoneGroup);
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

    // ── Cámara cinematográfica ──
    // La cámara se mantiene frontal y estable (la base no "gira" con la órbita);
    // la rotación completa la hace el objeto. El último tramo es un dolly-zoom épico.
    const CAM_SEG = [
        { t: 0.00, ang: 0.15, r: 7.8, h: 0.0, fov: 50, lookY: 0 },   // Entrada: TV frontal amplio
        { t: 0.38, ang: 0.55, r: 6.6, h: 0.3, fov: 50, lookY: 0 },   // Parlante: sutil lateral
        { t: 0.72, ang: 1.00, r: 6.5, h: 0.4, fov: 46, lookY: 0.2 },  // Celular: ligero ángulo
        { t: 1.00, ang: 0.80, r: 5.0, h: 1.4, fov: 42, lookY: 0.45 } // Zoom final: mira por encima, objeto abajo = no tapa label
    ];
    const smoothStep = (t) => t * t * (3 - 2 * t);
    let camProgress = 0;
    let camActiveIdx = 0;

    function updateCamera() {
        const obj = objects[camActiveIdx];
        if (!obj || !obj.visible || typeof THREE === 'undefined') return;
        const box = new THREE.Box3().setFromObject(obj);
        if (box.isEmpty()) return;
        const c = box.getCenter(new THREE.Vector3());

        let a = CAM_SEG[0], b = CAM_SEG[CAM_SEG.length - 1];
        for (let i = 0; i < CAM_SEG.length - 1; i++) {
            if (camProgress >= CAM_SEG[i].t && camProgress <= CAM_SEG[i + 1].t) {
                a = CAM_SEG[i]; b = CAM_SEG[i + 1]; break;
            }
        }
        const local = smoothStep(Math.max(0, Math.min(1, (camProgress - a.t) / (b.t - a.t))));
        const ang = a.ang + (b.ang - a.ang) * local;
        const r = a.r + (b.r - a.r) * local;
        const h = a.h + (b.h - a.h) * local;
        const fov = a.fov + (b.fov - a.fov) * local;
        const lookY = a.lookY + (b.lookY - a.lookY) * local;

        camera.position.set(
            c.x + Math.sin(ang) * r,
            c.y + h,
            c.z + Math.cos(ang) * r
        );
        camera.lookAt(c.clone().setY(c.y + lookY));
        // En desktop el objeto queda a la derecha (texto a la izquierda); el pan es horizontal
        // constante en pantalla usando el eje right real de la cámara (consistente en toda la órbita).
        const PAN_DESKTOP = -1.8;
        if (!isMobile()) {
            const camRight = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
            camera.lookAt(c.clone().setY(c.y + lookY).addScaledVector(camRight, PAN_DESKTOP));
        }
        if (Math.abs(camera.fov - fov) > 0.01) {
            camera.fov = fov;
            camera.updateProjectionMatrix();
        }
    }

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
                camProgress = progress;
                
                // Nuevos rangos de scroll optimizados para darle más espacio al televisor al inicio
                let idx = 0;
                if (progress > 0.38) idx = 1;
                if (progress > 0.72) idx = 2;

                if (idx !== currentIdx) {
                    const prevIdx = currentIdx;
                    currentIdx = idx;
                    camActiveIdx = idx;

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

                // El objeto activo da una vuelta completa para exhibirse entero; la cámara
                // se mantiene estable y frontal (la base no rota).
                objects.forEach((obj, i) => {
                    if (obj.visible) {
                        obj.rotation.y = localProgress * Math.PI * 2;
                        obj.rotation.x = Math.sin(localProgress * Math.PI) * 0.12;
                    }
                });

                // Movimiento de luz según el progreso
                cyanLight.position.x = Math.sin(progress * Math.PI * 2) * 4;
                cyanLight.position.y = Math.cos(progress * Math.PI * 2) * 2;
            }
        });
    }

    // ── Post-processing (bloom removido a petición del usuario; sin render extra por rendimiento) ──
    composer = null;

    // ── Animation Loop ──
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time++;

        // La cámara sigue la coreografía según el scroll (mantiene al objeto activo centrado)
        updateCamera();

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

