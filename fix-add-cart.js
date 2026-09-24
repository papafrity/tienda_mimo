const fs = require('fs');
let js = fs.readFileSync('script.js', 'utf8');

const target = "showToast(\\ agregado al carrito\, 'success');";
const replace = showToast(\\ agregado al carrito\, 'success');
        
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '¡Agregado! <span style=\"font-size:1.1em\">??</span>';
            btn.style.backgroundColor = 'rgba(46, 213, 115, 0.2)';
            btn.style.borderColor = '#2ed573';
            btn.style.color = '#fff';
            
            if(window.gsap) {
                gsap.fromTo(btn, { scale: 0.8 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
            }
            
            setTimeout(() => {
                if(btn.innerHTML.includes('Agregado')) {
                    btn.innerHTML = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.borderColor = '';
                    btn.style.color = '';
                }
            }, 1800);
        };

if(js.includes(target)) {
    js = js.replace(target, replace);
    fs.writeFileSync('script.js', js);
    console.log('Cart button animation added');
} else {
    console.log('Cart button animation target not found');
}
