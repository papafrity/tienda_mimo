const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const pixelCode = \
    <!-- Meta Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    // REEMPLAZAR 'TU_PIXEL_ID' CON EL ID REAL CUANDO SE CREE LA CUENTA DE ADS
    fbq('init', 'TU_PIXEL_ID');
    fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=TU_PIXEL_ID&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Meta Pixel Code -->
\;

if (!html.includes('Meta Pixel Code')) {
    html = html.replace('</head>', pixelCode + '\\n</head>');
    fs.writeFileSync('index.html', html);
    console.log('Pixel added to HTML');
} else {
    console.log('Pixel already exists');
}

let js = fs.readFileSync('script.js', 'utf8');

// Add to Cart tracking
if (js.includes("showToast(\\ agregado al carrito\, 'success');") && !js.includes("fbq('track', 'AddToCart'")) {
    js = js.replace("showToast(\\ agregado al carrito\, 'success');", "showToast(\\ agregado al carrito\, 'success');\n        if (typeof fbq === 'function') fbq('track', 'AddToCart', { content_name: p.name, value: p.price, currency: 'ARS' });");
}

// Purchase tracking (we can put this in gracias.html later, or initiate checkout here)
if (js.includes("window.location.href = data.init_point;") && !js.includes("fbq('track', 'InitiateCheckout'")) {
    js = js.replace("window.location.href = data.init_point;", "if (typeof fbq === 'function') fbq('track', 'InitiateCheckout');\n                        window.location.href = data.init_point;");
}

fs.writeFileSync('script.js', js);
console.log('Pixel events added to JS');
