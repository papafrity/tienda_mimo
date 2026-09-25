
const fs = require("fs");
let css = fs.readFileSync("styles.css", "utf8");

const igAndMLCss = `
/* =========================================
   INSTAGRAM PROFILE STYLES
   ========================================= */
.ig-profile-container {
    max-width: 600px;
    margin: 0 auto 2rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #fff;
    padding: 0 1rem;
}
.ig-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
}
.ig-avatar {
    width: 85px;
    height: 85px;
    border-radius: 50%;
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    padding: 3px;
    flex-shrink: 0;
}
.ig-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #000;
    object-fit: cover;
    border: 3px solid #06080d;
}
.ig-stats {
    display: flex;
    justify-content: space-between;
    flex: 1;
}
.stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.9rem;
}
.stat-box strong {
    font-size: 1.1rem;
    font-weight: 700;
}
.ig-bio h2 {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
}
.ig-bio p {
    font-size: 0.95rem;
    margin-bottom: 0.1rem;
    color: #f5f5f5;
    line-height: 1.4;
}
.ig-bio a {
    color: #e0f1ff;
    text-decoration: none;
    font-weight: 600;
}
.ig-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.2rem;
}
.ig-btn {
    flex: 1;
    padding: 0.5rem;
    border-radius: 8px;
    border: none;
    background: #262626;
    color: #fff;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
}
.ig-btn-primary {
    background: #0095f6;
}
.ig-highlights {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding: 1.5rem 0;
    scrollbar-width: none;
}
.ig-highlights::-webkit-scrollbar { display: none; }
.highlight-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
}
.highlight-ring {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 1px solid #555;
    padding: 3px;
}
.highlight-ring img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background: #111;
}
.highlight-item span {
    font-size: 0.75rem;
    color: #f5f5f5;
}
.ig-tabs {
    display: flex;
    justify-content: space-around;
    border-top: 1px solid #262626;
    margin-bottom: 1rem;
}
.ig-tab {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 1rem 0;
    color: #888;
    cursor: pointer;
}
.ig-tab.active {
    color: #fff;
    border-top: 1px solid #fff;
    margin-top: -1px;
}
.ig-tab svg {
    width: 24px;
    height: 24px;
}

/* =========================================
   MERCADO LIBRE STYLE FOR CAROUSEL CARDS
   ========================================= */
.carousel-card {
    background: #ffffff !important;
    border: 1px solid #ebebeb !important;
    border-radius: 6px !important;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,.1) !important;
}
.carousel-card img {
    background: #ffffff !important;
    border-bottom: 1px solid #ebebeb !important;
    padding: 10px;
    object-fit: contain !important;
}
.carousel-card-info {
    padding: 1rem !important;
    background: #ffffff !important;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
}
.carousel-card-info h3 {
    color: #333333 !important;
    font-weight: 300 !important;
    font-size: 0.85rem !important;
    line-height: 1.3 !important;
    margin-bottom: 0.5rem !important;
}
.carousel-card-info .price, .carousel-card-info .offer-price {
    color: #333333 !important;
    background: none !important;
    -webkit-text-fill-color: #333333 !important;
    font-size: 1.5rem !important;
    font-weight: 400 !important;
    margin-bottom: 0.2rem !important;
}
.carousel-card-info::before {
    background: transparent !important;
    color: #00a650 !important;
    padding: 0 !important;
    font-weight: 600 !important;
    font-size: 0.8rem !important;
    content: "Llega gratis mañana" !important;
    display: block !important;
    margin-bottom: 0 !important;
}
.carousel-card-info::after {
    display: none !important;
}

/* =========================================
   INSTAGRAM GRID ON MOBILE
   ========================================= */
@media(max-width: 480px) {
    .product-grid {
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 2px !important;
        padding: 0 !important;
    }
    .product-card {
        border-radius: 0 !important;
        border: none !important;
        padding: 0 !important;
        background: transparent !important;
    }
    .product-image {
        margin: 0 !important;
        border-radius: 0 !important;
        height: 120px !important;
        background: #111 !important;
    }
    .product-info {
        padding: 0.4rem !important;
    }
    .product-card h3 {
        font-size: 0.7rem !important;
        font-weight: 400 !important;
        white-space: normal !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        display: -webkit-box !important;
        -webkit-line-clamp: 2 !important;
        -webkit-box-orient: vertical !important;
        line-height: 1.2 !important;
        color: #fff !important;
    }
    .product-card .price, .product-card .offer-price {
        font-size: 0.8rem !important;
        font-weight: 600 !important;
    }
    .product-card::after {
        display: none !important;
    }
    /* Move back to top button higher to avoid Chatbot overlap */
    .back-to-top {
        bottom: 6.5rem !important; 
    }
}
`;

if (!css.includes("INSTAGRAM PROFILE STYLES")) {
    fs.writeFileSync("styles.css", css + "\n" + igAndMLCss);
    console.log("CSS updated");
}

