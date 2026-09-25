const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const newTabsHTML = `            <div class="filter-tabs" id="filterTabs">
                <button class="filter-tab active magnetic-btn" data-group="all">Todos</button>
                <button class="filter-tab magnetic-btn" data-group="tecnologia">Tecnología</button>
                <button class="filter-tab magnetic-btn" data-group="hogar">Hogar</button>
                <button class="filter-tab magnetic-btn" data-group="electro">Electro</button>
                <button class="filter-tab magnetic-btn" data-group="varios">Varios</button>
            </div>
            <!-- Subcategories row -->
            <div class="subcategories-container" id="subcategoriesContainer"></div>`;

html = html.replace(/<div class="filter-tabs" id="filterTabs">[\s\S]*?<\/div>/, newTabsHTML);
fs.writeFileSync('index.html', html);

// JS Update
let js = fs.readFileSync('script.js', 'utf8');

const subcatLogic = `
    const subCategoriesMap = {
        tecnologia: [
            { id: 'celulares', label: 'Celulares', icon: '📱' },
            { id: 'televisores', label: 'TVs', icon: '📺' },
            { id: 'tvbox', label: 'TV Box', icon: '📦' },
            { id: 'parlantes', label: 'Parlantes', icon: '🔊' },
            { id: 'auriculares', label: 'Auriculares', icon: '🎧' },
            { id: 'gaming', label: 'Gaming', icon: '🎮' },
            { id: 'pc', label: 'PC', icon: '💻' },
            { id: 'relojes-fundas', label: 'Smartwatches', icon: '⌚' },
            { id: 'cargadores-accesorios', label: 'Cargadores', icon: '🔋' },
            { id: 'gadgets', label: 'Gadgets', icon: '🔌' }
        ],
        hogar: [
            { id: 'hogar-muebles', label: 'Living / Comedor', icon: '🛋️' },
            { id: 'bano', label: 'Baño', icon: '🚿' },
            { id: 'decoracion', label: 'Decoración', icon: '🖼️' },
            { id: 'iluminacion-gadgets', label: 'Iluminación', icon: '💡' },
            { id: 'limpieza', label: 'Limpieza', icon: '🧹' },
            { id: 'exteriores', label: 'Exteriores', icon: '🏡' }
        ],
        electro: [
            { id: 'cocinas', label: 'Cocinas', icon: '🍳' },
            { id: 'calefaccion', label: 'Calefacción', icon: '🔥' },
            { id: 'climatizacion', label: 'Aires', icon: '❄️' },
            { id: 'ventilacion', label: 'Ventilación', icon: '💨' },
            { id: 'belleza', label: 'Belleza', icon: '💇‍♀️' }
        ],
        varios: [
            { id: 'herramientas', label: 'Herramientas', icon: '🛠️' },
            { id: 'bicicletas', label: 'Bicicletas', icon: '🚲' },
            { id: 'movilidad', label: 'Movilidad', icon: '🛴' },
            { id: 'deportes', label: 'Deportes', icon: '⚽' }
        ]
    };

    function renderSubcategories(group) {
        const container = document.getElementById('subcategoriesContainer');
        if (!container) return;
        
        if (group === 'all' || !subCategoriesMap[group]) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'flex';
        container.innerHTML = subCategoriesMap[group].map(sub => \`
            <div class="sub-cat-item" data-filter="\${sub.id}">
                <div class="sub-cat-circle">\${sub.icon}</div>
                <span class="sub-cat-label">\${sub.label}</span>
            </div>
        \`).join('');

        // Attach events to new sub-category items
        container.querySelectorAll('.sub-cat-item').forEach(item => {
            item.addEventListener('click', () => {
                container.querySelectorAll('.sub-cat-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                window.currentFilter = item.dataset.filter;
                renderProducts();
            });
        });
    }
`;

if (!js.includes('renderSubcategories(group)')) {
    js = js.replace('function initProductFiltersAndModals() {', 'function initProductFiltersAndModals() {\n' + subcatLogic);
    
    // Replace the event listeners explicitly
    const oldLogicRegex = /const filterBtns = document\.querySelectorAll\('\.filter-tab'\);[\s\S]*?renderProducts\(\);\s*\}\);\s*\}\);/;
    const newLogic = `const filterBtns = document.querySelectorAll('.filter-tab');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const group = btn.dataset.group;
            
            if (group === 'all') {
                window.currentFilter = 'all';
            } else {
                const allowedCats = subCategoriesMap[group].map(s => s.id);
                window.currentFilter = allowedCats;
            }
            
            renderSubcategories(group);
            renderProducts();
        });
    });`;

    js = js.replace(oldLogicRegex, newLogic);

    // Modify renderProducts
    js = js.replace(/if \(window\.currentFilter !== 'all' && p\.category !== window\.currentFilter\)/, `if (window.currentFilter !== 'all') {
            if (Array.isArray(window.currentFilter)) {
                if (!window.currentFilter.includes(p.category)) return false;
            } else {
                if (p.category !== window.currentFilter) return false;
            }
        }`);
        
    fs.writeFileSync('script.js', js);
}

// UPDATE CSS
let css = fs.readFileSync('styles.css', 'utf8');
const subcatCss = `
/* SUBCATEGORIES UI */
.subcategories-container {
    display: none;
    gap: 1.5rem;
    overflow-x: auto;
    padding: 1rem 0 1.5rem 0;
    scrollbar-width: none;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}
.subcategories-container::-webkit-scrollbar { display: none; }
.sub-cat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    cursor: pointer;
    min-width: 75px;
    -webkit-tap-highlight-color: transparent;
}
.sub-cat-circle {
    width: 65px;
    height: 65px;
    border-radius: 50%;
    background: rgba(10,12,18,0.8);
    border: 1px solid rgba(0, 240, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: inset 0 0 15px rgba(0, 240, 255, 0.05);
}
.sub-cat-item:hover .sub-cat-circle, .sub-cat-item.active .sub-cat-circle {
    border-color: #00f0ff;
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.3), inset 0 0 15px rgba(0, 240, 255, 0.15);
    transform: translateY(-4px);
    background: rgba(0, 240, 255, 0.05);
}
.sub-cat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
    text-align: center;
    transition: all 0.3s ease;
}
.sub-cat-item:hover .sub-cat-label, .sub-cat-item.active .sub-cat-label {
    color: #fff;
    text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}
@media(max-width: 480px) {
    .subcategories-container {
        gap: 1rem;
        padding: 0.5rem 1rem 1rem 1rem;
    }
    .sub-cat-circle {
        width: 55px;
        height: 55px;
        font-size: 1.5rem;
    }
    .sub-cat-label {
        font-size: 0.7rem;
    }
}
`;

if (!css.includes('SUBCATEGORIES UI')) {
    css += "\n" + subcatCss;
    fs.writeFileSync('styles.css', css);
}

// BTT FIX
const bttFix = `
.back-to-top {
    z-index: 99999 !important;
    pointer-events: auto !important;
}
`;
if (!css.includes('z-index: 99999 !important;')) {
    fs.writeFileSync('styles.css', css + "\n" + bttFix);
}
