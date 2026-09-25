const fs = require('fs');

let js = fs.readFileSync('script.js', 'utf8');

const oldNavScrollRegex = /document\.querySelectorAll\('a\[href\^=\"#\"\]'\)\.forEach\(anchor => \{[\s\S]*?\}\);\s*\}\);/;

const newNavScroll = document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();

            // TELEPORT INSTANTANEO
            if (typeof gsap !== 'undefined') {
                gsap.killTweensOf(window);
                if (typeof smoother !== 'undefined' && smoother) gsap.killTweensOf(smoother);
            }
            
            const html = document.documentElement;
            const body = document.body;
            html.style.setProperty('scroll-behavior', 'auto', 'important');
            body.style.setProperty('scroll-behavior', 'auto', 'important');

            const isMobile = window.innerWidth < 768;
            const offset = isMobile ? 80 : 70;
            
            let top = 0;
            if (typeof smoother !== 'undefined' && smoother) {
                top = typeof smoother.offset === 'function' ? smoother.offset(target, offset) : target.getBoundingClientRect().top + window.scrollY - offset;
                try {
                    smoother.scrollTo(top, false);
                    smoother.scrollTop(top);
                } catch(err) {}
            } else {
                top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo(0, top);
                html.scrollTop = top;
                body.scrollTop = top;
            }

            setTimeout(() => {
                html.style.removeProperty('scroll-behavior');
                body.style.removeProperty('scroll-behavior');
            }, 60);
        });
    });;

if(oldNavScrollRegex.test(js)) {
    js = js.replace(oldNavScrollRegex, newNavScroll);
    fs.writeFileSync('script.js', js, 'utf8');
    console.log('Navbar JS teleport updated!');
} else {
    console.log('Could not match Navbar JS teleport regex');
}

let css = fs.readFileSync('styles.css', 'utf8');

const oldCarouselCssRegex = /\.carousel-card\{position:absolute[\s\S]*?\.old-price\{font-size:\.9rem;color:var\(--text-secondary\);text-decoration:line-through\}/;

const newCarouselCss = .carousel-card{position:absolute;width:100%;height:100%;top:0;left:0;background:radial-gradient(circle at 0% 0%, rgba(20,25,40,0.95), rgba(6,8,12,0.98));border:1px solid rgba(255,255,255,0.08);border-radius:var(--card-radius);overflow:hidden;backface-visibility:hidden;opacity:0;pointer-events:none;transition:none;cursor:pointer;will-change:transform,opacity,filter;transform-style:preserve-3d;box-shadow:inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.6)}
.carousel-card::before{content:"";position:absolute;top:0;left:0;right:0;height:100%;background:linear-gradient(180deg,rgba(0,240,255,0.05) 0%,transparent 40%);pointer-events:none;z-index:1}
.carousel-card.active{opacity:1;pointer-events:auto;border:1px solid rgba(0,240,255,0.4);box-shadow:0 0 25px rgba(0,240,255,0.15),0 15px 40px rgba(0,0,0,0.6),inset 0 0 20px rgba(0,240,255,0.05);transition:box-shadow .4s var(--ease-out-expo)}
.carousel-card img{width:100%;height:auto;max-height:200px;object-fit:contain;background:radial-gradient(circle,#0e121e 0%,#06080d 100%);will-change:transform;position:relative;z-index:2;padding:1rem}
.carousel-card-info{padding:1.4rem 1.2rem;position:relative;z-index:5;will-change:transform,opacity;background:linear-gradient(0deg, rgba(6,8,12,1) 30%, rgba(6,8,12,0) 100%);margin-top:-10px}
.carousel-card-info .add-to-cart{cursor:pointer !important;pointer-events:auto !important;position:relative;z-index:10;border-radius:30px;font-weight:700}
.carousel-card-info .badge{display:inline-block;padding:.35rem .85rem;font-size:.75rem;font-weight:800;background:linear-gradient(135deg,#00f0ff,#a855f7);color:#000;border-radius:20px;margin-bottom:.8rem;letter-spacing:.5px;box-shadow:0 4px 10px rgba(0,240,255,0.3)}
.carousel-card-info h3{font-size:1.15rem;font-weight:700;margin-bottom:.4rem;color:#fff}
.old-price{font-size:.9rem;color:var(--text-secondary);text-decoration:line-through};

if(oldCarouselCssRegex.test(css)) {
    css = css.replace(oldCarouselCssRegex, newCarouselCss);
    fs.writeFileSync('styles.css', css, 'utf8');
    console.log('Carousel CSS updated!');
} else {
    console.log('Could not match Carousel CSS regex');
}
