const fs = require('fs');
let lines = fs.readFileSync('script.js', 'utf8').split('\n');

// Find function openProductModal
const openIdx = lines.findIndex(l => l.includes('window.openProductModal = function(prodId) {'));
if(openIdx !== -1) {
    // We insert the history push state right after "if (!p) return;"
    const returnIdx = lines.findIndex((l, i) => i > openIdx && l.includes('if (!p) return;'));
    if(returnIdx !== -1) {
        lines.splice(returnIdx + 1, 0, '            if (new URLSearchParams(window.location.search).get("p") !== prodId) history.pushState({ modalOpen: true }, "", "?p=" + encodeURIComponent(prodId));');
    }
}

// Find closeM
const closeIdx = lines.findIndex(l => l.includes('function closeM() { document.getElementById'));
if(closeIdx !== -1) {
    lines[closeIdx] = lines[closeIdx].replace(
        document.body.style.overflow = ''; },
        document.body.style.overflow = ''; if(window.location.search.includes('?p=')) history.pushState(null, '', window.location.pathname); }
    );
}

fs.writeFileSync('script.js', lines.join('\n'));
console.log("Done");
