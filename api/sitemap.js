module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    const host = "https://tienda-mimo.vercel.app";
    let products = [];
    try {
        const firestoreUrl = "https://firestore.googleapis.com/v1/projects/tienda-mimo/databases/(default)/documents/products?pageSize=1000";
        const response = await fetch(firestoreUrl);
        if (!response.ok) throw new Error("Failed to fetch from Firestore");
        const data = await response.json();
        if (data.documents) {
            products = data.documents.map(doc => {
                const id = doc.name.split("/").pop();
                return { id, lastMod: new Date().toISOString() };
            });
        }
        const urls = products.map(p => "<url><loc>" + host + "/index.html?p=" + p.id + "</loc><lastmod>" + p.lastMod + "</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>").join("");
        const xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n<url><loc>" + host + "/index.html</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n" + urls + "\n</urlset>";
        res.status(200).send(xml);
    } catch (error) {
        console.error("Error generating sitemap:", error);
        res.status(500).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"><url><loc>https://tienda-mimo.vercel.app</loc></url></urlset>");
    }
};
