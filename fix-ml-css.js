const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const overrides = \
/* =========================================================
   MERCADO LIBRE COMPACT GRID & GLOBAL TWEAKS
   ========================================================= */
/* Hide Category Badges on all cards */
.product-card .badge, .carousel-card-info .badge { display: none !important; }

/* Hide Add to Cart button on grid and carousel, only show in modal */
.product-card .add-to-cart, .carousel-card-info .add-to-cart { display: none !important; }

/* Improve Stars visual */
.stars { color: #ffb800 !important; font-size: 0.95rem; }
.product-card .stars, .carousel-card-info .stars { font-size: 0.8rem !important; letter-spacing: -1px; margin-bottom: 0.1rem; }

@media(max-width: 480px) {
    /* Ultra-compact mobile cards */
    .product-grid { gap: 0.8rem !important; padding: 0 0.8rem !important; }
    .product-card { 
        padding: 0 !important; 
        background: transparent !important; 
        border: none !important; 
        box-shadow: none !important;
    }
    .product-image { 
        height: 160px !important; 
        margin-bottom: 0.5rem !important; 
        border-radius: 8px !important; 
        background: rgba(255,255,255,0.03) !important; 
        padding: 0.5rem !important;
    }
    .product-info { padding: 0 !important; }
    
    .product-card h3 { 
        font-size: 0.85rem !important; 
        color: #e0e0e0 !important;
        white-space: normal !important; 
        display: -webkit-box !important; 
        -webkit-line-clamp: 2 !important; 
        -webkit-box-orient: vertical !important; 
        margin-bottom: 0.3rem !important;
        line-height: 1.2 !important;
        font-weight: 500 !important;
    }
    
    .product-card .offer-price { font-size: 1.25rem !important; font-weight: 700 !important; color: #fff !important; background: none !important; -webkit-text-fill-color: initial !important; }
    .product-card .old-price { font-size: 0.75rem !important; color: #888 !important; }
    
    .product-card .card-glow, .product-card .card-spotlight { display: none !important; }
}
\;

if(!css.includes('MERCADO LIBRE COMPACT GRID')) {
    fs.writeFileSync('styles.css', css + '\\n' + overrides);
    console.log('Mobile UI updated');
} else {
    console.log('Already updated');
}
