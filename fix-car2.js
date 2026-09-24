const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');

const sIdx = js.indexOf('// Cinematic timing: smooth cascade');
const eIdx = js.indexOf('tl.to(spotlight, { left: \'50%\', duration: 0.9, ease: \'expo.out\' }, 0.45);');

if(sIdx > 0 && eIdx > sIdx) {
  const replaceStr = "// Timing simplificado: movimiento sincronico\n" +
"                let dur = 0.65;\n" +
"                let ease = 'power3.out';\n" +
"                let delay = 0;\n" +
"                \n" +
"                if (isEntering) card.style.zIndex = 11;\n" +
"\n" +
"                tl.to(card, {\n" +
"                    x: targetX, scale: targetScale, rotateY: targetRotateY, rotateX: targetRotateX,\n" +
"                    filter: targetBlur, opacity: targetOpacity, zIndex: targetZ,\n" +
"                    duration: dur, ease: ease,\n" +
"                    force3D: true, transformPerspective: 1000\n" +
"                }, delay);\n" +
"\n" +
"                card.style.pointerEvents = abs <= 2 ? 'auto' : 'none';\n" +
"\n" +
"                if (isCenter) {\n" +
"                    card.classList.add('active');\n" +
"                    const info = card.querySelector('.carousel-card-info');\n" +
"                    const badge = card.querySelector('.badge');\n" +
"                    const title = card.querySelector('h3');\n" +
"                    const price = card.querySelector('.offer-price') || card.querySelector('.old-price');\n" +
"                    const btn = card.querySelector('.add-to-cart');\n" +
"                    const baseEase = 'expo.out';\n" +
"                    \n" +
"                    const baseTime = 0.15;\n" +
"                    if (info) tl.fromTo(info, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: baseEase }, baseTime);\n" +
"                    if (badge) tl.fromTo(badge, { scale: 0.6, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2.2)' }, baseTime + 0.05);\n" +
"                    if (title) tl.fromTo(title, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: baseEase }, baseTime + 0.1);\n" +
"                    if (price) tl.fromTo(price, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: baseEase }, baseTime + 0.15);\n" +
"                    if (btn) tl.fromTo(btn, { y: 14, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, baseTime + 0.2);\n" +
"                }\n" +
"            });\n" +
"\n" +
"            // Spotlight move\n" +
"            tl.to(spotlight, { left: '50%', duration: 0.65, ease: 'power3.out' }, 0);";
            
  const endTotal = eIdx + 77;
  js = js.substring(0, sIdx) + replaceStr + js.substring(endTotal);
  fs.writeFileSync('script.js', js);
  console.log('Fixed GSAP sync');
} else {
  console.log('Not found', sIdx, eIdx);
}
