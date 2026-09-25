const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');

// 1. Fetch the discount on load and update the select text
const initCode = \
// FETCH TRANSFER SETTINGS
let transferSettings = { discount: 0, cbu: '', alias: '', name: '' };
db.collection('settings').doc('transfer').get().then(doc => {
    if (doc.exists) {
        transferSettings = doc.data();
        const opt = document.getElementById('transferOption');
        if (opt && transferSettings.discount > 0) {
            opt.textContent = \🏦 Transferencia Bancaria (\% OFF)\;
        }
    }
});
\;
if (!js.includes('FETCH TRANSFER SETTINGS')) {
    js = js.replace(/document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{/, "$&\n    " + initCode);
}

// 2. Intercept checkout flow
const searchFetch = "const response = await fetch('/api/checkout', {";
const replaceFetch = \
                const paymentMethod = document.getElementById('checkoutPaymentMethod').value;
                
                if (paymentMethod === 'transfer') {
                    const discountRate = transferSettings.discount > 0 ? (transferSettings.discount / 100) : 0;
                    let originalTotal = cart.reduce((sum, item) => sum + (Number(unitPriceForQty(item, item.qty).price) * item.qty), 0);
                    let finalTotal = originalTotal * (1 - discountRate);
                    
                    await db.collection('orders').doc(orderId).update({
                        status: 'pending_transfer',
                        paymentMethod: 'transfer',
                        discountApplied: transferSettings.discount,
                        total: finalTotal
                    });
                    
                    if (typeof fbq === "function") fbq("track", "InitiateCheckout");
                    window.location.href = 'transferencia.html?id=' + orderId;
                    return;
                }
                
                const response = await fetch('/api/checkout', {\;
if (!js.includes("paymentMethod === 'transfer'")) {
    js = js.replace(searchFetch, replaceFetch);
}

fs.writeFileSync('script.js', js);
console.log('Checkout logic injected in JS');
