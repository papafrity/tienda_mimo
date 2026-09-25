const fs = require('fs');
let code = 'module.exports = async (req, res) => {\n' +
'    res.setHeader("Access-Control-Allow-Origin", "*");\n' +
'    res.setHeader("Content-Type", "text/xml; charset=utf-8");\n' +
'    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");\n' +
'    const host = "https://tienda-mimo.vercel.app";\n' +
'    let products = [];\n' +
'    try {\n' +
'        const firestoreUrl = "https://firestore.googleapis.com/v1/projects/tienda-mimo/databases/(default)/documents/products?pageSize=1000";\n' +
'        const response = await fetch(firestoreUrl);\n' +
'        if (!response.ok) throw new Error("Failed to fetch from Firestore");\n' +
'        const data = await response.json();\n' +
'        if (data.documents) {\n' +
'            products = data.documents.map(doc => {\n' +
'                const id = doc.name.split("/").pop();\n' +
'                return { id, lastMod: new Date().toISOString() };\n' +
'            });\n' +
'        }\n' +
'        const urls = products.map(p => "<url><loc>" + host + "/index.html?p=" + p.id + "</loc><lastmod>" + p.lastMod + "</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>").join("");\n' +
'        const xml = "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<urlset xmlns=\\"http://www.sitemaps.org/schemas/sitemap/0.9\\">\\n<url><loc>" + host + "/index.html</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\\n" + urls + "\\n</urlset>";\n' +
'        res.status(200).send(xml);\n' +
'    } catch (error) {\n' +
'        console.error("Error generating sitemap:", error);\n' +
'        res.status(500).send("<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><urlset xmlns=\\"http://www.sitemaps.org/schemas/sitemap/0.9\\"><url><loc>https://tienda-mimo.vercel.app</loc></url></urlset>");\n' +
'    }\n' +
'};\n';
fs.writeFileSync('api/sitemap.js', code);
console.log('API Created');
