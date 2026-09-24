const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');

const targetStr = 
                // Cinematic timing: smooth cascade with premium easings
                let dur, ease, delay;
                if (isLeaving) {
                    // Card leaving center: clears out first so the incoming never overlaps
                    dur = 0.5; ease = 'expo.out'; delay = 0;
                } else if (isEntering) {
                    // Card entering center: waits for the center to clear, then arrives
                    dur = 0.9; ease = 'expo.out'; delay = 0.45;
                    card.style.zIndex = 11; // above center during transition
                } else {
                    // Side cards: fluid repositioning
                    dur = 0.85; ease = 'power3.inOut';
                    delay = abs === 1 ? 0.06 : 0.12;
                }

                tl.to(card, {
                    x: targetX, scale: targetScale, rotateY: targetRotateY, rotateX: targetRotateX,
                    filter: targetBlur, opacity: targetOpacity, zIndex: targetZ,
                    duration: dur, ease: ease,
                    force3D: true, transformPerspective: 1000
                }, delay);

                card.style.pointerEvents = abs <= 2 ? 'auto' : 'none';

                if (isCenter) {
                    card.classList.add('active');
                    // Animate card info stagger ?" silky reveal sequence
                    const info = card.querySelector('.carousel-card-info');
                    const badge = card.querySelector('.badge');
                    const title = card.querySelector('h3');
                    const price = card.querySelector('.offer-price') || card.querySelector('.old-price');
                    const btn = card.querySelector('.add-to-cart');
                    const baseEase = 'expo.out';
                    if (info) tl.fromTo(info, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: baseEase }, 0.55);
                    if (badge) tl.fromTo(badge, { scale: 0.6, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2.2)' }, 0.6);
                    if (title) tl.fromTo(title, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: baseEase }, 0.66);
                    if (price) tl.fromTo(price, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: baseEase }, 0.73);
                    if (btn) tl.fromTo(btn, { y: 14, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, 0.8);
                }
            });

            // Spotlight move ?" smooth follow (waits for the incoming card)
            tl.to(spotlight, { left: '50%', duration: 0.9, ease: 'expo.out' }, 0.45);
;

const replaceStr = 
                // Timing simplificado: movimiento fluido sincrnico
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
                    
                    // Stagger animates in smoothly while card is arriving
                    const baseTime = 0.15;
                    if (info) tl.fromTo(info, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: baseEase }, baseTime);
                    if (badge) tl.fromTo(badge, { scale: 0.6, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2.2)' }, baseTime + 0.05);
                    if (title) tl.fromTo(title, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: baseEase }, baseTime + 0.1);
                    if (price) tl.fromTo(price, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: baseEase }, baseTime + 0.15);
                    if (btn) tl.fromTo(btn, { y: 14, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, baseTime + 0.2);
                }
            });

            // Spotlight move (sincrnico)
            tl.to(spotlight, { left: '50%', duration: 0.65, ease: 'power3.out' }, 0);
;

// Replacing it safely with regex if string fails due to encoding
js = js.replace(/\/\/ Cinematic timing: smooth cascade[\s\S]*?tl\.to\(spotlight, \{ left: '50%', duration: 0\.9, ease: 'expo\.out' \}, 0\.45\);/, replaceStr);

fs.writeFileSync('script.js', js);
console.log('Fixed carousel animation');
