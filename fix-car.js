const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');

const sIdx = js.indexOf('// Cinematic timing: smooth cascade');
const eIdx = js.indexOf('tl.to(spotlight, { left: \'50%\', duration: 0.9, ease: \'expo.out\' }, 0.45);');

if(sIdx > 0 && eIdx > sIdx) {
  const replaceStr = \// Timing simplificado: movimiento sincronico
                let dur = 0.65; 
                let ease = 'power3.out';
                let delay = 0;
                
                if (isEntering) card.style.zIndex = 11;

                tl.to(card, {
                    x: targetX, scale: targetScale, rotateY: targetRotateY, rotateX: targetRotateX,
                    filter: targetBlur, opacity: targetOpacity, zIndex: targetZ,
                    duration: dur, ease: ease,
                    force3D: true, transformPerspective: 1000
                }, delay);

                card.style.pointerEvents = abs <= 2 ? 'auto' : 'none';

                if (isCenter) {
                    card.classList.add('active');
                    const info = card.querySelector('.carousel-card-info');
                    const badge = card.querySelector('.badge');
                    const title = card.querySelector('h3');
                    const price = card.querySelector('.offer-price') || card.querySelector('.old-price');
                    const btn = card.querySelector('.add-to-cart');
                    const baseEase = 'expo.out';
                    
                    const baseTime = 0.15;
                    if (info) tl.fromTo(info, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: baseEase }, baseTime);
                    if (badge) tl.fromTo(badge, { scale: 0.6, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2.2)' }, baseTime + 0.05);
                    if (title) tl.fromTo(title, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: baseEase }, baseTime + 0.1);
                    if (price) tl.fromTo(price, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: baseEase }, baseTime + 0.15);
                    if (btn) tl.fromTo(btn, { y: 14, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, baseTime + 0.2);
                }
            });

            // Spotlight move
            tl.to(spotlight, { left: '50%', duration: 0.65, ease: 'power3.out' }, 0);\;
            
  const endTotal = eIdx + 77;
  js = js.substring(0, sIdx) + replaceStr + js.substring(endTotal);
  fs.writeFileSync('script.js', js);
  console.log('Fixed GSAP sync');
} else {
  console.log('Not found', sIdx, eIdx);
}
