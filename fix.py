import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Remove reveal-up from dynamically appended products
js = js.replace('class="product-card tilt-card reveal-up"', 'class="product-card tilt-card"')

# 2. Fix empty carousel (fallback to first 8 active products if none featured)
if 'featured.push(...allActive.slice(0, 8))' not in js:
    target = 'const featured = products.filter(p => p.isFeatured && p.isActive !== false);'
    replacement = target + '\n        if (featured.length === 0) { const allActive = products.filter(p => p.isActive !== false); featured.push(...allActive.slice(0, 8)); }'
    js = js.replace(target, replacement)

# 3. Fix mobile carousel JS hardcoding height to 440px
js = js.replace('width:260px;height:440px;', 'width:260px;height:auto;min-height:330px;padding-bottom:1.5rem;')

# 4. In renderCarousel(), we recreate the cards. BUT if initCarouselLogic() is called MULTIPLE TIMES, it adds duplicate event listeners to the buttons. 
# Also, if initCarouselLogic() is only called ONCE at startup, and later renderCarousel() is called, the old listeners on cards are lost, but buttons are fine. 
# Wait, let's just make sure initCarouselLogic() is robust.
# Replace the old button event listener binding with a clone-and-replace to prevent duplicate bindings if called multiple times, OR just leave it if it's called once.

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 5. Remove scale(1.1) from carousel buttons hover
css = css.replace('transform:translateY(-50%) scale(1.1)', 'transform:translateY(-50%)')

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('Patched script.js and styles.css!')
