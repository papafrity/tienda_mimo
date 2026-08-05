module.exports = async (req, res) => {
    const { q, source } = req.query;
    if (!q) return res.status(400).json({ error: 'Falta query param q' });

    res.setHeader('Access-Control-Allow-Origin', '*');

    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'SERPER_API_KEY no configurada en Vercel' });

    try {
        // Fetch Dólar Blue rate for USD → ARS conversion
        let usdRate = null;
        try {
            const rateResp = await fetch('https://dolarapi.com/v1/dolares/blue');
            const rateData = await rateResp.json();
            if (rateData && rateData.venta) {
                usdRate = rateData.venta;
            }
        } catch (rateErr) {
            // If rate fetch fails, continue without conversion
            console.error('Error fetching USD rate:', rateErr.message);
        }

        const serperResp = await fetch('https://google.serper.dev/shopping', {
            method: 'POST',
            headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q })
        });
        const serperData = await serperResp.json();
        if (!serperData.shopping) return res.json({ results: [], exchangeRate: usdRate, rateSource: 'Dólar Blue' });

        let results = serperData.shopping.map(r => {
            const rawPrice = r.price || '0';

            // Detect original currency from price string and link
            const currency = detectCurrency(rawPrice, r.link || '');

            // Extract numeric value
            const price = parseFloat(rawPrice.replace(/[^0-9.,]/g, '').replace(',', '.'));

            // Convert to ARS if price is in USD
            let priceArs = price;
            let converted = false;
            if (currency === 'USD' && usdRate && price > 0) {
                priceArs = price * usdRate;
                converted = true;
            }

            return {
                title: r.title,
                price: priceArs,
                originalPrice: price,
                currency,
                converted,
                store: r.source || r.store || 'Tienda',
                link: r.link,
                thumbnail: r.thumbnail
            };
        }).filter(r => r.price > 0);

        if (source === 'ml') {
            results = results.filter(r =>
                r.store.toLowerCase().includes('mercadolibre') ||
                r.store.toLowerCase().includes('mercado libre') ||
                (r.link && r.link.includes('mercadolibre'))
            );
        }

        results.sort((a, b) => a.price - b.price);
        return res.json({
            results,
            exchangeRate: usdRate,
            rateSource: 'Dólar Blue'
        });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};

/**
 * Detect currency from price string and product link.
 * Returns 'USD', 'ARS', or 'OTHER'.
 */
function detectCurrency(priceStr, link) {
    const p = (priceStr || '').toUpperCase();
    const l = (link || '').toLowerCase();

    // Explicit USD indicators
    if (p.includes('US$') || p.includes('USD') || p.includes('U$S')) return 'USD';

    // Explicit ARS indicators
    if (p.includes('ARS') || p.includes('AR$')) return 'ARS';

    // Brazilian Real
    if (p.includes('R$') || p.includes('BRL')) return 'OTHER';

    // CLP, COP, MXN, etc.
    if (p.includes('CLP') || p.includes('COP') || p.includes('MXN') || p.includes('EUR')) return 'OTHER';

    // MercadoLibre Argentina links contain "mercadolibre.com.ar"
    if (l.includes('mercadolibre.com.ar')) return 'ARS';

    // MercadoLibre from other countries → likely their local currency (not USD)
    if (l.includes('mercadolibre') && !l.includes('mercadolibre.com.ar')) return 'OTHER';

    // Google Shopping Argentina results sometimes include ".com.ar" in the link
    if (l.includes('.com.ar')) return 'ARS';

    // Default: assume USD (most international Google Shopping results are in USD)
    return 'USD';
}
