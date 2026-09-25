
const fs = require("fs");
let html = fs.readFileSync("index.html", "utf8");

const target = `<div class="shipping-warning">`;
const replace = `<div class="form-group" style="margin-bottom: 1.5rem;">
                        <label for="checkoutPaymentMethod">Medio de Pago *</label>
                        <select id="checkoutPaymentMethod" required style="width: 100%; padding: 1rem; border-radius: 10px; border: 1px solid var(--surface-border); background: rgba(255, 255, 255, 0.05); color: #fff; font-family: var(--font-main); font-size: 1rem; outline: none; margin-top: 0.5rem; cursor: pointer;">
                            <option value="mp" style="background:#000; color:#fff;">?? Mercado Pago (Tarjetas, Cuotas, Dinero en cuenta)</option>
                            <option value="transfer" style="background:#000; color:#fff;" id="transferOption">?? Transferencia Bancaria (Descuento)</option>
                        </select>
                    </div>
                    ` + target;

if (!html.includes("checkoutPaymentMethod")) {
    html = html.replace(target, replace);
    fs.writeFileSync("index.html", html);
    console.log("Checkout UI updated");
}

