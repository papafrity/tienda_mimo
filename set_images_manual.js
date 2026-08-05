/* ─── ASISTENTE PARA ASIGNAR IMÁGENES MANUALMENTE ─────────
 * Pegá este script en la consola de admin.html (F12 → Console)
 *
 * Comandos disponibles:
 *   listar()         → muestra los productos pendientes
 *   buscar(n)        → abre Google Images para el producto n
 *   asignar(n, url)  → asigna la imagen al producto n
 *   saltar(n)        → marca producto n como omitido
 *   pendientes()     → cuántos faltan
 * ──────────────────────────────────────────────────────────── */

const _imgs = { lista: [], idx: {}, omitidos: new Set() };

(async () => {
    const snap = await db.collection('products').get();
    _imgs.lista = [];
    snap.forEach(doc => {
        const d = doc.data();
        const url = d.image || '';
        if (url.includes('placeholder') || url.includes('placehold.co') || !url) {
            _imgs.lista.push({ id: doc.id, name: d.name });
        }
    });
    _imgs.lista.forEach((p, i) => { _imgs.idx[i + 1] = p; });
    console.log(`🖼️  ${_imgs.lista.length} productos sin imagen real.
	
Comandos:
  listar()         → ver lista numerada
  buscar(1)        → abre Google Images del producto #1
  asignar(1, "url") → asigna imagen al producto #1
  saltar(1)        → omite el producto #1
  pendientes()     → cuántos faltan
  ayuda()          → repetir esto`);
})();

window.listar = function() {
    const pend = _imgs.lista.filter(p => !_imgs.omitidos.has(p.id));
    if (pend.length === 0) { console.log('✅ Todos los productos tienen imagen.'); return; }
    console.log(`📋 Productos pendientes (${pend.length}):`);
    pend.forEach((p, i) => {
        const n = _imgs.lista.indexOf(p) + 1;
        console.log(`  ${n}. ${p.name}`);
    });
};

window.buscar = function(n) {
    const p = _imgs.idx[n];
    if (!p) { console.warn(`⚠️  No existe el producto #${n}. Usá listar()`); return; }
    const query = encodeURIComponent(p.name.replace(/[""']/g, '').substring(0, 100));
    window.open(`https://www.google.com/search?tbm=isch&q=${query}`, '_blank');
    console.log(`🔍 Abriendo Google Images para: ${p.name}`);
};

window.asignar = async function(n, url) {
    const p = _imgs.idx[n];
    if (!p) { console.warn(`⚠️  No existe el producto #${n}`); return; }
    if (!url || !url.startsWith('http')) { console.warn('⚠️  URL inválida. Debe empezar con https://'); return; }
    try {
        await db.collection('products').doc(p.id).update({ image: url, fullImages: [url] });
        _imgs.omitidos.add(p.id);
        console.log(`✅ Imagen asignada a: ${p.name}`);
        const restantes = _imgs.lista.filter(x => !_imgs.omitidos.has(x.id)).length;
        if (restantes === 0) console.log('🎉 ¡Todos los productos tienen imagen!');
        else console.log(`📦 Quedan ${restantes} productos pendientes.`);
    } catch (e) {
        console.error(`❌ Error al guardar:`, e);
    }
};

window.saltar = function(n) {
    const p = _imgs.idx[n];
    if (!p) { console.warn(`⚠️  No existe el producto #${n}`); return; }
    _imgs.omitidos.add(p.id);
    console.log(`⏭️  Omitido: ${p.name}`);
    const restantes = _imgs.lista.filter(x => !_imgs.omitidos.has(x.id)).length;
    if (restantes === 0) console.log('🎉 ¡Todos los productos tienen imagen!');
    else console.log(`📦 Quedan ${restantes} productos pendientes.`);
};

window.pendientes = function() {
    const restantes = _imgs.lista.filter(x => !_imgs.omitidos.has(x.id)).length;
    console.log(restantes === 0 ? '🎉 ¡Todos listos!' : `📦 ${restantes} productos pendientes.`);
};

window.ayuda = function() {
    console.log(`Comandos:
  listar()         → ver lista
  buscar(1)        → abre Google Images del producto #1
  asignar(1, "url") → asigna imagen
  saltar(1)        → omite
  pendientes()     → cuántos faltan`);
};
