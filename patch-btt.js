const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');

js = js.replace(/backToTop\.addEventListener\('click', \(\) => \{[\s\S]*?\}\);/, `backToTop.addEventListener('click', () => {
            if (typeof smoother !== "undefined" && smoother) {
                gsap.to(smoother, { scrollTop: 0, duration: 1, ease: "power2.inOut" });
                try { smoother.scrollTo(0, true); } catch(e){}
            }
            window.scrollTo({top: 0, behavior: "smooth"});
        });`);

fs.writeFileSync('script.js', js);
console.log('Back to top JS patched');
