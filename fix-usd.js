const fs = require('fs');
let data = fs.readFileSync('script.js', 'utf8');

const targetStr = sync function fetchUsdRate() {
        try {
            const resp = await fetch('https://dolarapi.com/v1/dolares/blue');
            const data = await resp.json();
            if (data && data.venta) usdRateARS = data.venta;
        } catch(e) { /* ignore */ }
    };

const replaceStr = sync function fetchUsdRate() {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for low internet
            const resp = await fetch('https://dolarapi.com/v1/dolares/blue', { signal: controller.signal });
            clearTimeout(id);
            const data = await resp.json();
            if (data && data.venta) usdRateARS = data.venta;
        } catch(e) { 
            console.warn('API Dolar error o timeout, usando último valor: ', e.message); 
            // usdRateARS se mantiene con su valor por defecto
        }
    };

data = data.replace(targetStr, replaceStr);

fs.writeFileSync('script.js', data);
console.log('Fixed fetchUsdRate timeout');
