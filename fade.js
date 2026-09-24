const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const targetStr = '.carousel-wrapper{position:relative;overflow:hidden;padding:5rem 60px 3rem;max-width:1200px;margin:0 auto;perspective:1400px;min-height:500px;display:flex;align-items:center;justify-content:center}';
const replaceStr = '.carousel-wrapper{position:relative;overflow:hidden;padding:5rem 60px 3rem;max-width:1200px;margin:0 auto;perspective:1400px;min-height:500px;display:flex;align-items:center;justify-content:center;-webkit-mask-image:linear-gradient(to right, transparent, black 15%, black 85%, transparent);mask-image:linear-gradient(to right, transparent, black 15%, black 85%, transparent)}';

css = css.replace(targetStr, replaceStr);
fs.writeFileSync('styles.css', css);
console.log('Fade mask applied');
