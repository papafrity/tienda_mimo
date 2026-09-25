
const fs = require("fs");

let html = fs.readFileSync("index.html", "utf8");
const pixelCode = `
    <!-- Meta Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,"script",
    "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", "TU_PIXEL_ID");
    fbq("track", "PageView");
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=TU_PIXEL_ID&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Meta Pixel Code -->
`;
if (!html.includes("Meta Pixel Code")) {
    html = html.replace("</head>", pixelCode + "\n</head>");
    fs.writeFileSync("index.html", html);
}

let js = fs.readFileSync("script.js", "utf8");
const trackInit = `if (typeof fbq === "function") fbq("track", "InitiateCheckout");\n                        window.location.href = data.init_point;`;
if (!js.includes("fbq(\"track\", \"InitiateCheckout\")")) {
    js = js.replace("window.location.href = data.init_point;", trackInit);
    fs.writeFileSync("script.js", js);
}
console.log("Pixel added!");

