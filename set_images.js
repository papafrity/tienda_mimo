/* ─── ASIGNAR IMÁGENES AUTOMÁTICAS DESDE PEXELS ────────────
 * Pegá este script en la consola de admin.html
 * Busca cada producto con placeholder en Pexels y asigna la 1er imagen.
 * ───────────────────────────────────────────────────────────── */

const PEXELS_KEY = 'MaihCetuefuQU6Syhmu7coOMKZhcbOpTHFPuY7Lq4ZASlgidrwBWyHx2';

async function searchPexels(query) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3`;
    const res = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
    if (!res.ok) throw new Error(`Pexels error ${res.status}`);
    const data = await res.json();
    return data.photos || [];
}

function isPlaceholder(url) {
    return !url || url.includes('via.placeholder.com') || url.includes('placehold.co');
}

(async () => {
    console.log('🖼️  Buscando productos con placeholder en Firestore...');
    const snapshot = await db.collection('products').get();
    const products = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        if (isPlaceholder(data.image)) {
            products.push({ id: doc.id, name: data.name, image: data.image });
        }
    });
    console.log(`📦 Se encontraron ${products.length} productos con placeholder.`);
    if (products.length === 0) { console.log('✅ No hay placeholders que reemplazar.'); return; }

    let ok = 0, fail = 0, skipped = 0;
    for (let i = 0; i < products.length; i++) {
        const { id, name } = products[i];
        try {
            // Build a good search query from the product name
            const searchQuery = name
                .replace(/[""']/g, '')
                .replace(/\s*\([^)]*\)/g, '')
                .replace(/\d+\s*(USD|ARS|W|kg|gb|gb|ram|mah)/gi, '')
                .trim()
                .substring(0, 80);

            const photos = await searchPexels(searchQuery);
            if (photos.length === 0) {
                console.warn(`⚠️  [${i + 1}/${products.length}] Sin resultados: "${name}"`);
                skipped++;
                continue;
            }

            const imgUrl = photos[0].src.medium || photos[0].src.original;
            await db.collection('products').doc(id).update({ image: imgUrl, fullImages: [imgUrl] });
            ok++;
            console.log(`✅ [${i + 1}/${products.length}] ${name} → ${imgUrl}`);
        } catch (e) {
            fail++;
            console.error(`❌ [${i + 1}/${products.length}] Error en "${name}":`, e.message);
        }

        // Pequeña pausa para no rate-limit
        if (i < products.length - 1) await new Promise(r => setTimeout(r, 400));
    }

    console.log(`\n🎉 Completado. ${ok} imágenes asignadas, ${skipped} sin resultados, ${fail} errores.`);
    if (ok > 0) console.log('🔄 Recargá el index.html para ver los cambios.');
})();
