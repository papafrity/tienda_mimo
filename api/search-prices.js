module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { q, source } = req.query;
    if (!q) return res.status(400).json({ error: 'Falta parÃ¡metro q (nombre del producto)' });

    const src = (source || 'mercadolibre').toLowerCase();
    let results = [];

    if (src === 'mercadolibre' || src === 'ml') {
        try {
            const url = `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(q)}&limit=6`;
            const resp = await fetch(url);
            const data = await resp.json();
            results = (data.results || []).map(r => ({
                title: r.title,
                price: r.price,
                currency: r.currency_id === 'USD' ? 'US$' : '$',
                store: r.seller?.official_store_name || 'Mercado Libre',
                link: r.permalink,
                thumbnail: r.thumbnail
            }));
        } catch (e) {
            return res.status(500).json({ error: 'Error consultando Mercado Libre: ' + e.message, results: [] });
        }
    }

    if (src === 'serper' || src === 'google') {
        const key = process.env.SERPER_API_KEY;
        if (!key) return res.status(400).json({ error: 'SERPER_API_KEY no configurada. CreÃ¡ una cuenta gratis en serper.dev y agregala a las variables de entorno de Vercel.', results: [] });
        try {
            const resp = await fetch('https://google.serper.dev/shopping', {
                method: 'POST',
                headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
                body: JSON.stringify({ q, num: 6 })
            });
            const data = await resp.json();
            results = (data.shopping || []).map(r => {
                const raw = r.price.replace(/[^0-9.,]/g, '').replace(',', '');
                const price = parseFloat(raw) || 0;
                return {
                    title: r.title,
                    price,
                    currency: r.price.includes('$') ? '$' : 'US$',
                    store: r.source || 'Google Shopping',
                    link: r.link,
                    thumbnail: r.imageUrl || ''
                };
            });
        } catch (e) {
            return res.status(500).json({ error: 'Error consultando Google Shopping: ' + e.message, results: [] });
        }
    }

    results.sort((a, b) => a.price - b.price);
    res.json({ results, source: src, query: q });
};
