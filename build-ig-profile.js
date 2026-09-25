
const fs = require("fs");
let html = fs.readFileSync("index.html", "utf8");

const igProfileHtml = `
            <!-- INSTAGRAM STYLE PROFILE -->
            <div class="ig-profile-container">
                <div class="ig-header">
                    <div class="ig-avatar">
                        <img src="https://i.imgur.com/3q1j3rL.png" alt="Mimo Store Logo">
                    </div>
                    <div class="ig-stats">
                        <div class="stat-box"><strong>162</strong><span>publicaciones</span></div>
                        <div class="stat-box"><strong>2,887</strong><span>seguidores</span></div>
                        <div class="stat-box"><strong>27</strong><span>seguidos</span></div>
                    </div>
                </div>
                <div class="ig-bio">
                    <h2>?? MIMO TIENDA TECH ??</h2>
                    <p>Tecnología / Electrónica</p>
                    <p>?? Ventas por Mayor y Menor</p>
                    <p>?? Garantía oficial</p>
                    <p>?? Envíos a todo el país</p>
                    <p>??? Equipamiento y Accesorios</p>
                    <a href="#">mimo.tienda</a>
                </div>
                <div class="ig-actions">
                    <button class="ig-btn ig-btn-primary">Seguir</button>
                    <button class="ig-btn">Mensaje</button>
                    <button class="ig-btn">Contacto</button>
                </div>
                <div class="ig-highlights">
                    <div class="highlight-item"><div class="highlight-ring"><img src="https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?auto=format&fit=crop&w=100&q=80" alt="Celulares"></div><span>Celulares</span></div>
                    <div class="highlight-item"><div class="highlight-ring"><img src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=100&q=80" alt="Consolas"></div><span>Gaming</span></div>
                    <div class="highlight-item"><div class="highlight-ring"><img src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=100&q=80" alt="Smart TV"></div><span>Smart TV</span></div>
                    <div class="highlight-item"><div class="highlight-ring"><img src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=100&q=80" alt="Audio"></div><span>Audio</span></div>
                    <div class="highlight-item"><div class="highlight-ring"><img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=100&q=80" alt="Hogar"></div><span>Hogar</span></div>
                </div>
                <div class="ig-tabs">
                    <div class="ig-tab active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg></div>
                    <div class="ig-tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 15l7-7 7 7"></path></svg></div>
                    <div class="ig-tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                </div>
            </div>
`;

if (!html.includes("ig-profile-container")) {
    // Insert before <div class="filter-tabs">
    html = html.replace(`<div class="filter-tabs">`, igProfileHtml + "\n            <div class=\"filter-tabs\">");
    fs.writeFileSync("index.html", html);
    console.log("IG Profile injected in HTML");
}

