# SEO + Open Graph + Social Preview Plan

## Archivos a crear (4)

### 1. `favicon.svg`
- SVG 100x100, fondo oscuro `#0a0a1a`, letra "M" con gradiente cyan→violeta
- Browsers modernos lo soportan como favicon

### 2. `img/og-image.svg`
- SVG 1200×630 (dimensiones estándar Open Graph)
- Fondo oscuro, círculos decorativos sutiles, texto "Mimo!" + "Tu Tienda de Tecnología Premium"
- Gradiente cyan→violeta en el logo
- **Nota**: Algunas plataformas no renderizan SVG como OG image. Si pasa, generar un PNG en Canva y reemplazar

### 3. `robots.txt`
```txt
User-agent: *
Allow: /
Disallow: /admin.html
Sitemap: https://tienda-mimo.vercel.app/sitemap.xml
```

### 4. `sitemap.xml`
```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://tienda-mimo.vercel.app/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://tienda-mimo.vercel.app/gracias.html</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>
</urlset>
```

## Archivos a modificar (4)

### 5. `index.html` — head completo

**Agregar después de `<link rel="stylesheet" href="styles.css">`** (línea 18):

```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.svg">
<link rel="apple-touch-icon" href="/favicon.svg">
<meta name="theme-color" content="#0a0a1a">
<link rel="canonical" href="https://tienda-mimo.vercel.app/">

<!-- Open Graph mejorado -->
<meta property="og:locale" content="es_AR">
<meta property="og:site_name" content="Mimo!">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter Card -->
<meta name="twitter:title" content="Mimo! - Tu Tienda de Tecnología Premium">
<meta name="twitter:description" content="Descubre la mejor tecnología en Mimo! Auriculares, parlantes, televisores, cocinas y mucho más. Envíos a todo el país.">
<meta name="twitter:image" content="https://tienda-mimo.vercel.app/img/og-image.svg">

<!-- JSON-LD: WebSite -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Mimo!",
  "url": "https://tienda-mimo.vercel.app/",
  "description": "Tu Tienda de Tecnología Premium",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://tienda-mimo.vercel.app/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>

<!-- JSON-LD: Organization -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mimo!",
  "url": "https://tienda-mimo.vercel.app/",
  "logo": "https://tienda-mimo.vercel.app/img/og-image.svg",
  "description": "Tu Tienda de Tecnología Premium",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "url": "https://tienda-mimo.vercel.app/"
  }
}
</script>
```

**Actualizar** el `og:image` existente:
- De: `https://tienda-mimo.vercel.app/img/og-image.jpg`
- A: `https://tienda-mimo.vercel.app/img/og-image.svg`

### 6. `gracias.html` — mismo cambio

- Agregar favicon, theme-color, canonical, og:locale, og:site_name, og:image:width/height, twitter meta, JSON-LD
- Actualizar og:image path a `.svg`
- Agregar `google-site-verification` si aplica

### 7. `404.html` — mismo cambio

- Agregar favicon, theme-color, canonical, og:locale, og:site_name, og:image:width/height, twitter meta
- No necesita JSON-LD
- Mantener `noindex`
- Actualizar og:image path a `.svg`

### 8. `admin.html`

- Agregar favicon
- Agregar `theme-color`
- Mantener `noindex, nofollow`
- No necesita OG tags ni JSON-LD

## Notas

1. **OG image SVG vs PNG**: si WhatsApp/Facebook no muestran la previsualización, hay que convertir el SVG a PNG 1200×630 con una herramienta como Canva, Photoshop o un conversor online, y subirlo como `img/og-image.png`
2. **Google Search Console**: cuando el sitio esté indexado, conviene agregar `<meta name="google-site-verification" content="...">` con el código que da Search Console
3. **Google Analytics**: ya está integrado vía gtag.js en script.js, no hace falta cambiar nada
