import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Make sure initCarouselLogic cleans up before initializing
cleanup_logic = """
        // Clean up previous event listeners by cloning the buttons
        let prevBtn = document.getElementById('prevBtn');
        let nextBtn = document.getElementById('nextBtn');
        if (prevBtn) { const clone = prevBtn.cloneNode(true); prevBtn.parentNode.replaceChild(clone, prevBtn); prevBtn = clone; }
        if (nextBtn) { const clone = nextBtn.cloneNode(true); nextBtn.parentNode.replaceChild(clone, nextBtn); nextBtn = clone; }
        
        // Clean up old GSAP and intervals
        if (window._carouselInterval) clearInterval(window._carouselInterval);
        
        const dotsC = document.getElementById('carouselDots');
"""
js = js.replace("const prevBtn = document.getElementById('prevBtn');\n        const nextBtn = document.getElementById('nextBtn');\n        const dotsC = document.getElementById('carouselDots');", cleanup_logic)

# Replace interval variable
js = js.replace('let ap = setInterval(() => nextBtn.click(), 5000);', 'window._carouselInterval = setInterval(() => nextBtn.click(), 5000);')
js = js.replace('clearInterval(ap)', 'clearInterval(window._carouselInterval)')
js = js.replace('if (!ap) ap = setInterval(() => nextBtn.click(), 5000);', 'if (!window._carouselInterval) window._carouselInterval = setInterval(() => nextBtn.click(), 5000);')

# Make renderCarousel always call initCarouselLogic
if 'initCarouselLogic();' not in js.split('function renderCarousel()')[1].split('}')[0]:
    # We will inject initCarouselLogic(); just before the end of renderCarousel
    js = re.sub(r'(function renderCarousel\(\) \{[\s\S]*?)(    \})', r'\1        setTimeout(initCarouselLogic, 50);\n\2', js, count=1)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)

print('Robust carousel logic patched!')
