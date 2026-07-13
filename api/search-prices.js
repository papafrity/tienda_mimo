module.exports = async (req, res) => {
    const { q, source } = req.query;
    if (!q) return res.status(400).json({ error: 'Falta query param q' });

    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        if (source === 'serper' || source === 'google') {
            const apiKey = process.env.SERPER_API_KEY;
            if (!apiKey) return res.status(500).json({ error: 'SERPER_API_KEY no configurada en Vercel' });

            const serperResp = await fetch('https://google.serper.dev/shopping', {
                method: 'POST',
                headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ q })
            });
            const serperData = await serperResp.json();
            if (!serperData.shopping) return res.json({ results: [] });

            const results = serperData.shopping.map(r => ({
                title: r.title,
                price: parseFloat((r.price || '0').replace(/[^0-9.,]/g, '').replace(',', '.')),
                store: r.source || r.store || 'Google Shopping',
                link: r.link,
                thumbnail: r.thumbnail
            })).filter(r => r.price > 0).sort((a, b) => a.price - b.price);

            return res.json({ results });
        }

        // ML
        const mlResp = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(q)}&limit=6`);
        const mlData = await mlResp.json();
        if (!mlData.results) return res.json({ results: [] });

        const results = mlData.results.map(r => ({
            title: r.title,
            price: r.price,
            store: r.seller?.official_store_name || (r.seller?.nickname || 'Mercado Libre'),
            link: r.permalink,
            thumbnail: r.thumbnail
        })).filter(r => r.price > 0).sort((a, b) => a.price - b.price);

        return res.json({ results });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};
