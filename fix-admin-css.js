const fs = require('fs');
let css = fs.readFileSync('admin.css', 'utf8');

const premiumCSS = \
/* =========================================================
   PREMIUM DASHBOARD OVERRIDES 
   ========================================================= */
.dashboard {
    display: grid !important;
    grid-template-columns: 280px 1fr !important;
    grid-template-rows: auto 1fr !important;
    grid-template-areas: 
        "tabs header"
        "tabs content" !important;
    height: 100vh !important;
    padding: 0 !important;
    max-width: 100% !important;
    margin: 0 !important;
    background: #06080d !important;
}

.admin-header {
    grid-area: header !important;
    margin-bottom: 0 !important;
    padding: 1.5rem 3rem !important;
    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
    background: rgba(10, 12, 18, 0.6) !important;
    backdrop-filter: blur(20px) !important;
}

.admin-tabs {
    grid-area: tabs !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 0.8rem !important;
    padding: 2rem 1.5rem !important;
    border-right: 1px solid rgba(255,255,255,0.05) !important;
    border-bottom: none !important;
    background: rgba(10, 12, 18, 0.95) !important;
    margin: 0 !important;
}
.admin-tabs::after { display: none !important; }

.tab-btn {
    text-align: left !important;
    padding: 1.2rem 1.5rem !important;
    border-radius: 16px !important;
    font-size: 1.05rem !important;
    font-weight: 500 !important;
    background: transparent !important;
    border: 1px solid transparent !important;
    color: var(--text-secondary) !important;
    transition: all 0.3s ease !important;
    margin-bottom: 0 !important;
}
.tab-btn.active {
    background: rgba(0, 240, 255, 0.08) !important;
    color: var(--accent-color) !important;
    border: 1px solid rgba(0, 240, 255, 0.2) !important;
    box-shadow: 0 4px 20px rgba(0,240,255,0.05) !important;
    transform: translateX(5px) !important;
}
.tab-btn:not(.active):hover {
    background: rgba(255,255,255,0.03) !important;
    color: #fff !important;
    transform: translateX(3px) !important;
}

.tab-content {
    grid-area: content !important;
    overflow-y: auto !important;
    padding: 3rem !important;
    height: 100% !important;
}

.table-container {
    background: rgba(255,255,255,0.015) !important;
    border: 1px solid rgba(255,255,255,0.04) !important;
    border-radius: 20px !important;
    padding: 1rem !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 40px rgba(0,0,0,0.2) !important;
}

.admin-table th { padding: 1.5rem 1rem !important; font-size: 0.85rem !important; color: rgba(255,255,255,0.4) !important; }
.admin-table td { padding: 1.5rem 1rem !important; border-bottom: 1px solid rgba(255,255,255,0.02) !important; }
.admin-table tbody tr { transition: background 0.3s; }
.admin-table tbody tr:hover { background: rgba(255,255,255,0.025) !important; }
.admin-table img { border-radius: 12px !important; width: 60px !important; height: 60px !important; padding: 4px; background: rgba(255,255,255,0.02); }

@media(max-width: 900px) {
    .dashboard {
        grid-template-columns: 1fr !important;
        grid-template-rows: auto auto 1fr !important;
        grid-template-areas: 
            "header"
            "tabs"
            "content" !important;
    }
    .admin-tabs {
        flex-direction: row !important;
        overflow-x: auto !important;
        padding: 1rem !important;
        border-right: none !important;
        border-bottom: 1px solid rgba(255,255,255,0.05) !important;
    }
    .tab-btn { padding: 0.8rem 1.2rem !important; white-space: nowrap; }
    .tab-btn.active { transform: translateY(-3px) !important; }
    .tab-btn:not(.active):hover { transform: translateY(-2px) !important; }
}
\;

if(!css.includes('PREMIUM DASHBOARD OVERRIDES')) {
    fs.writeFileSync('admin.css', css + '\\n\\n' + premiumCSS);
    console.log('Premium Admin CSS Applied');
} else {
    console.log('Already applied');
}
