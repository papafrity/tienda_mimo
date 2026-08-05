/* ─── ACTUALIZAR PLACEHOLDERS A placehold.co (dark/cyan) ───
 * Pegá en consola de admin.html.
 * Reemplaza todos los via.placeholder.com por placehold.co
 * con fondo oscuro (#1a1a2e) y texto cyan (#00f0ff).
 * ───────────────────────────────────────────────────────────── */

(async () => {
    const snapshot = await db.collection('products').get();
    let updated = 0, skipped = 0;
    for (const doc of snapshot.docs) {
        const data = doc.data();
        const oldUrl = data.image || '';
        if (oldUrl.includes('via.placeholder.com') || oldUrl.includes('placehold.co')) {
            const match = oldUrl.match(/text=([^&]+)/);
            const name = match ? decodeURIComponent(match[1]) : data.name || 'Producto';
            const newUrl = `https://placehold.co/400x400/1a1a2e/00f0ff?text=${encodeURIComponent(name)}`;
            await db.collection('products').doc(doc.id).update({ image: newUrl });
            updated++;
        } else {
            skipped++;
        }
    }
    console.log(`✅ ${updated} placeholders actualizados. ${skipped} productos con imagen real omitidos.`);
})();
