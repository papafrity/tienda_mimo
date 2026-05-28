/* ─── SUBIR TODOS LOS PRODUCTOS A FIRESTORE ─────────────────
 * Pegá todo este archivo en la consola de admin.html
 * (abrí admin.html, logeate, abrí DevTools F12 → Console, pegá y Enter)
 * Se subirán ~320 productos en la colección "products".
 * ───────────────────────────────────────────────────────────── */

const USD_RATE = 1440;
const ars = usd => Math.round(usd * USD_RATE);

function makeProductARS(name, priceARS, category, description, peso, badge, offerPrice, image) {
    return {
        name,
        price: priceARS,
        offerPrice: offerPrice || null,
        category,
        description: description || '',
        image: image || `https://placehold.co/400x400/1a1a2e/00f0ff?text=${encodeURIComponent(name)}`,
        fullImages: [],
        stock: 10,
        peso: peso || 0.5,
        badge: badge || '',
        isFeatured: false
    };
}

function makeProductUSD(name, priceUSD, category, description, peso, badge, offerPriceUSD, image) {
    return makeProductARS(name, ars(priceUSD), category, description, peso, badge, offerPriceUSD ? ars(offerPriceUSD) : null, image);
}

const products = [
    // ─── TELEVISORES ───────────────────────────────────────────
    makeProductARS('SIERA 32" HD LED', 185000, 'televisores', 'SIERA 32" HD LED. Ideal para uso diario.', 3.9, '', 180000),
    makeProductARS('NÓMADE 32" Android TV', 210000, 'televisores', 'NÓMADE 32" con Android TV integrado. Smart TV completa.', 5, '', 200000),
    makeProductARS('Serie Dorada 32" SD16T Android TV', 215000, 'televisores', 'Serie Dorada 32" SD16T Android TV.', 4),
    makeProductARS('DAEWOO 32" HD', 200000, 'televisores', 'DAEWOO 32" HD. Calidad y confiabilidad.', 10),
    makeProductARS('HISENSE 40" Full HD VIDAA', 320000, 'televisores', 'HISENSE 40" Full HD con sistema VIDAA.', 7),
    makeProductARS('KEN BROWN 43" KBAA Android TV', 350000, 'televisores', 'KEN BROWN 43" KBAA Android TV. Smart TV 43".', 7.5, '', 330000),
    makeProductARS('HISENSE 43" A42K Full HD VIDAA', 360000, 'televisores', 'HISENSE 43" A42K Full HD con VIDAA.', 8.9, '', 340000),
    makeProductARS('NÓMADE 43" Android 14', 320000, 'televisores', 'NÓMADE 43" con Android 14. Smart TV moderna.', 9, '', 310000),
    makeProductARS('HISENSE 50" 4K VIDAA', 470000, 'televisores', 'HISENSE 50" 4K con sistema VIDAA.', 9.5, '', 445000),
    makeProductARS('ENOVA 50" Android TV', 460000, 'televisores', 'ENOVA 50" Android TV. Smart TV 50".', 9.4),
    makeProductARS('QUINT 50" UHD Android', 440000, 'televisores', 'QUINT 50" UHD Android TV.', 10.5),
    makeProductARS('GADNIC 50" FHD Android', 440000, 'televisores', 'GADNIC 50" FHD Android TV.', 7.8, '', 430000),
    makeProductARS('NÓMADE 55" Android TV', 490000, 'televisores', 'NÓMADE 55" Android TV. Smart TV grande.', 16, '', 475000),
    makeProductARS('ENOVA 65" Android TV', 830000, 'televisores', 'ENOVA 65" Android TV. Smart TV 65".', 19.7),
    makeProductARS('BGH 55" Google TV', 680000, 'televisores', 'BGH 55" con Google TV integrado.', 10),
    makeProductARS('SAMSUNG 55" Neo QLED Curvo 4K', 1150000, 'televisores', 'SAMSUNG 55" Neo QLED Curvo. Resolución 4K.', 20),
    makeProductARS('SAMSUNG 50" Neo QLED 4K', 900000, 'televisores', 'SAMSUNG 50" Neo QLED. Calidad de imagen superior.', 17.6),
    makeProductARS('SAMSUNG 43" Neo QLED Gaming 4K', 850000, 'televisores', 'SAMSUNG 43" Neo QLED pensado para gaming.', 17.6),
    
    // ─── TV BOX ──────────────────────────────────────────────
    makeProductUSD('TV Box Nuvoh Android TV', 13, 'tvbox', 'TV Box Nuvoh Android TV. Streaming básico.', 0.3),
    makeProductUSD('TV Box 8K MXQ Pro 5G', 18, 'tvbox', 'TV Box 8K MXQ Pro 5G. Compatible 4K/8K.', 0.3),
    makeProductUSD('TV Box 4K MXQ Pro', 13, 'tvbox', 'TV Box 4K MXQ Pro económico para streaming HD.', 0.3),
    makeProductUSD('Stick Nuvoh 8K', 16, 'tvbox', 'Stick Nuvoh 8K compacto para streaming.', 0.1),
    makeProductUSD('TV Stick 4K Android', 22, 'tvbox', 'TV Stick 4K Android portátil.', 0.1),
    makeProductUSD('Watch OM Full HD Streaming', 22, 'tvbox', 'Watch OM Full HD Streaming compacto.', 0.2),
    makeProductUSD('TV Watch 4K Android', 22, 'tvbox', 'TV Watch 4K Android TV.', 0.2),
    
    // ─── PROYECTORES ─────────────────────────────────────────
    makeProductUSD('Proyector HY300 Ultra HD', 35, 'proyectores', 'Proyector HY300 Ultra HD portátil.', 1.2),
    makeProductUSD('Proyector Nuvoh 8K', 39, 'proyectores', 'Proyector Nuvoh con soporte hasta 8K.', 1.5),
    makeProductUSD('Mini Proyector Portátil YT200', 25, 'proyectores', 'Mini Proyector YT200 compacto y ligero.', 0.8),
    makeProductUSD('Proyector Gamer Nuvoh', 52, 'proyectores', 'Proyector Gamer Nuvoh con baja latencia.', 1.5),
    makeProductUSD('Proyector Gamer Genérico', 45, 'proyectores', 'Proyector Gamer con funciones de consola básica.', 1.2),
    
    // ─── CELULARES ────────────────────────────────────────────
    makeProductUSD('Xiaomi Redmi 15C 256GB/16GB RAM', 150, 'celulares', 'Xiaomi Redmi 15C. Gran almacenamiento y memoria.', 0.3),
    makeProductUSD('Xiaomi Redmi 15C 128GB/8GB RAM', 140, 'celulares', 'Xiaomi Redmi 15C. Versión económica.', 0.3),
    makeProductUSD('Xiaomi Redmi 14C 256GB/16GB RAM', 135, 'celulares', 'Xiaomi Redmi 14C. Balanceado y potente.', 0.3),
    makeProductUSD('TCL 40 NxtPaper 256GB/16GB RAM', 140, 'celulares', 'TCL 40 NxtPaper. Pantalla tipo papel a color.', 0.3),
    makeProductUSD('Xiaomi POCO C75 256GB/8GB RAM', 140, 'celulares', 'POCO C75 económico con buen rendimiento.', 0.3),
    makeProductUSD('Xiaomi POCO C85 256GB/8GB RAM', 150, 'celulares', 'POCO C85 versión mejorada.', 0.3),
    makeProductUSD('Motorola Edge 60 Pro 516GB', 550, 'celulares', 'Motorola Edge 60 Pro Gama alta premium.', 0.3),
    makeProductUSD('Samsung S25 Ultra 1TB', 1200, 'celulares', 'Samsung S25 Ultra. Máxima potencia.', 0.3),
    makeProductARS('Notebook Enova 14" Celeron N4020', 290000, 'celulares', 'Notebook Enova 14" básica para oficina y estudio.', 1.8),
    makeProductARS('Tablet Enova Tab10', 140000, 'celulares', 'Tablet Enova Tab10 económica.', 0.5),
    makeProductUSD('Tablet TCL TAB11 Gen 2', 145, 'celulares', 'Tablet TCL TAB11 Gen 2 moderna.', 0.5),
    makeProductUSD('Tablet TCL NxtPaper 11', 175, 'celulares', 'Tablet TCL NxtPaper 11. Pantalla tipo papel.', 0.5),
    
    // ─── AURICULARES ─────────────────────────────────────────
    makeProductUSD('Noga ABTWINS49', 8, 'auriculares', 'Auriculares Bluetooth twins compactos.', 0.1),
    makeProductUSD('AirPods Pro 2da Gen', 10, 'auriculares', 'Auriculares inalámbricos con cancelación de ruido.', 0.1),
    makeProductUSD('Auriculares M90 Pro ENC', 6, 'auriculares', 'Auriculares gamer con funciones intercambiables.', 0.2),
    makeProductUSD('Auriculares A6S True Wireless', 4.5, 'auriculares', 'Auriculares básicos Bluetooth 5.0.', 0.05),
    makeProductUSD('Auriculares E6S True Wireless', 4.5, 'auriculares', 'Auriculares True Wireless con estuche.', 0.05),
    makeProductUSD('Auriculares InPods 12 Simple', 4.5, 'auriculares', 'Auriculares coloridos estilo AirPods.', 0.05),
    makeProductUSD('Auriculares M10 True Wireless', 4.5, 'auriculares', 'Auriculares Bluetooth 5.3 mejorados.', 0.05),
    makeProductUSD('Auriculares TWS con Power Bank', 4.5, 'auriculares', 'Auriculares con estuche batería externa.', 0.08),
    makeProductUSD('Auriculares P9', 4.5, 'auriculares', 'Auriculares inalámbricos básicos.', 0.05),
    makeProductUSD('Auriculares P47', 4.5, 'auriculares', 'Auriculares de diadema económicos.', 0.1),
    makeProductUSD('AirPods Max', 14.5, 'auriculares', 'Auriculares premium estilo diadema.', 0.3),
    makeProductUSD('Noga 922', 13.8, 'auriculares', 'Auriculares inalámbricos gama media.', 0.15),
    makeProductUSD('JBL Auriculares', 14, 'auriculares', 'Auriculares originales JBL.', 0.15),
    makeProductUSD('Noga NG-920BT', 18, 'auriculares', 'Auriculares inalámbricos con buen alcance.', 0.15),
    makeProductUSD('Noga NG-A900BT', 19.5, 'auriculares', 'Auriculares BT gama alta.', 0.15),
    makeProductUSD('Noga NG-A915BT', 10.5, 'auriculares', 'Auriculares BT económicos.', 0.15),
    makeProductUSD('Noga NG-A910BT', 13, 'auriculares', 'Auriculares BT diseño ergonómico.', 0.15),
    makeProductUSD('Auriculares Stitch y Hello Kitty', 13, 'auriculares', 'Auriculares temáticos edición especial.', 0.1),
    makeProductUSD('Noga NGV-400 Voice', 6.5, 'auriculares', 'Auriculares gamer económicos.', 0.2),
    makeProductUSD('Auricular Gamer Noga Storm Hydra', 22, 'auriculares', 'Auriculares gamer sonido envolvente.', 0.3),
    
    // ─── PARLANTES ────────────────────────────────────────────
    makeProductARS('Torre Ken Brown Bafle Monster 12', 385000, 'parlantes', 'Parlante torre de gran potencia.', 12),
    makeProductUSD('Parlante Genius 12', 62, 'parlantes', 'Parlante grande sonido potente.', 8),
    makeProductUSD('Pluse 5 Wireless', 21, 'parlantes', 'Parlante portátil con buen sonido.', 0.5),
    makeProductARS('JBL 120 Original', 720000, 'parlantes', 'Parlante JBL gama alta.', 5),
    makeProductUSD('JBL GO4 Original', 42, 'parlantes', 'Parlante compacto portátil JBL.', 0.3),
    makeProductUSD('JBL Clip 4 Original', 36, 'parlantes', 'Parlante portátil con clip JBL.', 0.3),
    makeProductUSD('JBL Flip 6 Original', 110, 'parlantes', 'Parlante JBL gama alta.', 0.6),
    makeProductUSD('JBL Flip 6 G5', 22, 'parlantes', 'JBL Flip 6 versión económica.', 0.5),
    makeProductUSD('JBL Flip 6 AAA', 19, 'parlantes', 'Modelo alternativo económico.', 0.5),
    makeProductUSD('JBL Flip 7', 22, 'parlantes', 'Parlante portátil actualizado.', 0.5),
    makeProductUSD('Noga P78', 5.6, 'parlantes', 'Parlante económico y compacto.', 0.2),
    makeProductUSD('P15 Pro / P17 Pro', 19, 'parlantes', 'Parlantes portátiles con buen sonido.', 0.4),
    makeProductUSD('JBL Alexa Speaker', 13, 'parlantes', 'Parlante con integración Alexa.', 0.3),
    makeProductUSD('JBL GO4 Pro', 10, 'parlantes', 'Parlante portátil económico.', 0.2),
    makeProductUSD('JBL GO3', 10, 'parlantes', 'Parlante compacto JBL.', 0.2),
    makeProductUSD('JBL Charger Mini 3', 8, 'parlantes', 'Parlante portátil económico.', 0.2),
    makeProductUSD('JBL Clip 5 Pro', 8, 'parlantes', 'Parlante portátil con clip.', 0.2),
    makeProductUSD('JBL Clip 3 Pro', 8, 'parlantes', 'Versión anterior del Clip.', 0.2),
    makeProductUSD('JBL ET 212', 8, 'parlantes', 'Parlante portátil económico.', 0.2),
    makeProductUSD('JBL Sneaky', 8, 'parlantes', 'Parlante compacto.', 0.2),
    makeProductUSD('Despertador Speaker RGB', 10, 'parlantes', 'Parlante con luz RGB y reloj.', 0.3),
    makeProductUSD('Parlante Grande BT-3401', 12, 'parlantes', 'Parlante grande con carga inalámbrica.', 0.8),
    makeProductUSD('Smart Portable Speaker RGB', 7, 'parlantes', 'Parlante portátil con luces RGB.', 0.3),
    makeProductUSD('Parlante Caracol Despertador RGB', 10, 'parlantes', 'Parlante con lámpara y reloj.', 0.3),
    makeProductUSD('Micrófono KMC-300', 12, 'parlantes', 'Micrófono para karaoke o streaming.', 0.4),
    makeProductUSD('Micrófono Karaoke K52', 12, 'parlantes', 'Micrófono básico para cantar.', 0.3),
    makeProductUSD('Parlante Astronauta', 17, 'parlantes', 'Parlante decorativo con diseño espacial.', 0.4),
    
    // ─── GAMING ──────────────────────────────────────────────
    makeProductUSD('Joystick PS5 DualSense', 85, 'gaming', 'Control inalámbrico original PlayStation 5.', 0.4),
    makeProductUSD('Combo Gaming Noga NKB-407', 26, 'gaming', 'Teclado + mouse para gamers principiantes.', 0.8),
    makeProductUSD('Combo Gaming Noga NKB-4TI', 32, 'gaming', 'Kit teclado y mouse mejorados.', 0.8),
    makeProductUSD('Teclado Noga NKB780TI', 4.3, 'gaming', 'Teclado USB económico y funcional.', 0.5),
    makeProductUSD('Teclado + Mouse Noga 95900 BT', 9, 'gaming', 'Combo inalámbrico Bluetooth compacto.', 0.6),
    makeProductUSD('Trípode Profesional Woot', 37.5, 'gaming', 'Trípode robusto para cámaras y streaming.', 1.5),
    makeProductUSD('Consola Retro RS5 Station', 32, 'gaming', 'Consola retro con juegos clásicos preinstalados.', 0.4),
    makeProductUSD('Game Stick M15 Lite 20000 juegos', 24, 'gaming', 'Consola portátil con miles de juegos retro.', 0.2),
    makeProductUSD('Game Stick Negro 20000 juegos', 24, 'gaming', 'Consola compacta con control inalámbrico.', 0.2),
    makeProductUSD('Game Stick 4K 15000 juegos', 23, 'gaming', 'Consola retro con salida 4K.', 0.2),
    makeProductUSD('Consola Retro Nintendo F3', 21, 'gaming', 'Consola portátil retro estilo SUP.', 0.2),
    makeProductUSD('Drone con Cámara', 23, 'gaming', 'Drone básico con cámara integrada.', 0.3),
    makeProductARS('Volante Drifter Noga', 180000, 'gaming', 'Volante gamer con vibración y pedales.', 2.5),
    makeProductARS('Volante ST VO6 Noga', 75000, 'gaming', 'Volante económico para simuladores.', 1.5),
    
    // ─── CARGADORES Y ACCESORIOS ─────────────────────────────
    makeProductUSD('Cable + Cargador USB-C a Lightning 20W', 4, 'cargadores-accesorios', 'Cable 1m con adaptador rápido para iPhone.', 0.1),
    makeProductUSD('Cable Lightning + Cabezal 20W', 3.5, 'cargadores-accesorios', 'Combo económico para iPhone 14+.', 0.1),
    makeProductUSD('Cable USB-A a Lightning 2m', 1.7, 'cargadores-accesorios', 'Cable largo para carga y datos.', 0.1),
    makeProductUSD('Adaptador Apple Original 20W', 16, 'cargadores-accesorios', 'Cargador oficial Apple rápido y seguro.', 0.1),
    makeProductUSD('Battery Pack MagSafe iPhone', 8, 'cargadores-accesorios', 'Batería portátil magnética para iPhone.', 0.2),
    makeProductUSD('Magnetic Charger', 6, 'cargadores-accesorios', 'Cargador inalámbrico magnético universal.', 0.1),
    makeProductUSD('Adaptador Samsung 45W Super Fast', 3, 'cargadores-accesorios', 'Cargador rápido Samsung para Galaxy.', 0.1),
    
    // ─── RELOJES Y FUNDAS ────────────────────────────────────
    makeProductUSD('Mega Kit X8 Smartwatch + accesorios', 22, 'relojes-fundas', 'Incluye reloj, cargador, AirPods y adaptadores.', 0.4),
    makeProductUSD('Reloj H20 + AirPods Pro', 17, 'relojes-fundas', 'Smartwatch con auriculares incluidos.', 0.3),
    makeProductUSD('Reloj H37 + AirPods Max', 17, 'relojes-fundas', 'Kit completo reloj y auriculares premium.', 0.3),
    makeProductUSD('Smart Bracelet', 6, 'relojes-fundas', 'Pulsera inteligente para salud y deporte.', 0.05),
    makeProductUSD('Apple Watch Dorado/Negro/Gris', 23, 'relojes-fundas', 'Smartwatch estilo Apple varios colores.', 0.2),
    makeProductUSD('T800 Ultra 2 (7 mallas)', 12, 'relojes-fundas', 'Smartwatch con correas intercambiables.', 0.2),
    makeProductUSD('T900 Ultra 2', 9, 'relojes-fundas', 'Smartwatch económico Ultra 2.', 0.15),
    makeProductUSD('Mini Watch i10', 6, 'relojes-fundas', 'Smartwatch compacto carga inalámbrica.', 0.1),
    makeProductUSD('Malla de Relojes', 1.5, 'relojes-fundas', 'Correas intercambiables para smartwatch.', 0.05),
    makeProductUSD('Fundas iPhone Silicon Case pack 20u', 30, 'relojes-fundas', 'Fundas originales en pack surtido.', 0.3),
    makeProductUSD('Fundas Fashion Case', 3, 'relojes-fundas', 'Fundas con diseños variados.', 0.05),
    makeProductUSD('Fundas iPhone Transparente Space', 1.6, 'relojes-fundas', 'Fundas transparentes resistentes.', 0.05),
    makeProductUSD('Fundas Android Silicona', 1.25, 'relojes-fundas', 'Fundas básicas para Android.', 0.05),
    makeProductUSD('Creative Case varios modelos', 2.2, 'relojes-fundas', 'Fundas creativas con protección extra.', 0.05),
    makeProductUSD('Liquidación Fundas Poco C61 / A3 2024', 0.99, 'relojes-fundas', 'Fundas en oferta por lote.', 0.05),
    makeProductUSD('Tapa de iPhone repuesto', 1.5, 'relojes-fundas', 'Repuesto de tapa trasera para iPhone.', 0.05),
    
    // ─── CALEFACCIÓN ─────────────────────────────────────────
    makeProductUSD('Caloventor Winco W116 Negro', 18, 'calefaccion', 'Compacto y portátil para espacios pequeños.', 1.2),
    makeProductUSD('Estufa Halógena Sprint 800W', 12, 'calefaccion', 'Ligera y económica con lámparas halógenas.', 1),
    makeProductARS('Estufa Nuvoh Fija 3 Velas', 26990, 'calefaccion', 'Modelo básico con tres niveles de calor.', 2),
    makeProductARS('Estufa Nuvoh Giratoria 3 Velas 600/1200W', 33500, 'calefaccion', 'Con función giratoria para distribuir calor.', 2.2),
    makeProductARS('Estufa Nuvoh 4 Velas 800/1600W', 36500, 'calefaccion', 'Mayor potencia para ambientes medianos.', 2.5),
    makeProductARS('Convector Eléctrico Nuvoh N-544', 62500, 'calefaccion', 'Calefactor eléctrico silencioso.', 3),
    
    // ─── CLIMATIZACIÓN ───────────────────────────────────────
    makeProductARS('Aire Enova Frío/Calor 2520FG Inverter', 520000, 'climatizacion', 'Aire acondicionado inverter con display digital y 8 funciones.', 25),
    
    // ─── VENTILACIÓN ─────────────────────────────────────────
    makeProductUSD('Ventilador de Pie Sprint 18" 95W', 23, 'ventilacion', 'Ventilador clásico de pie.', 3),
    makeProductUSD('Ventilador 3 en 1 Nuvoh 18"', 23, 'ventilacion', 'Ventilador versátil con varias configuraciones.', 3),
    
    // ─── BICICLETAS ──────────────────────────────────────────
    makeProductARS('Bicicleta Lamborghini Rodado 29', 230000, 'bicicletas', 'Diseño deportivo para montaña y ciudad.', 15),
    makeProductUSD('Bicicleta Fija CL600 Noga', 165, 'bicicletas', 'Bicicleta de spinning para entrenamiento indoor.', 25),
    makeProductUSD('Bicicleta Fija CL500 Amarilla', 195, 'bicicletas', 'Modelo robusto para uso intensivo.', 28),
    
    // ─── MOVILIDAD ──────────────────────────────────────────
    makeProductARS('Monopatín Eléctrico Daihatsu VIOO 350W', 575000, 'movilidad', 'Scooter urbano compacto.', 12),
    makeProductARS('Monopatín Eléctrico Daihatsu VIO1 350W', 605000, 'movilidad', 'Modelo mejorado con mayor autonomía.', 12.5),
    makeProductARS('Monopatín Eléctrico Daihatsu VIO2 350W', 737000, 'movilidad', 'Versión avanzada diseño robusto.', 13),
    makeProductARS('Monopatín Eléctrico Daihatsu V300 800W', 1320000, 'movilidad', 'Alta potencia para trayectos largos.', 18),
    makeProductARS('Monopatín Eléctrico Daihatsu V301 1600W', 1705000, 'movilidad', 'Scooter premium gran velocidad.', 20),
    makeProductUSD('Auto de Niño a Control Remoto', 250, 'movilidad', 'Vehículo eléctrico infantil con mando remoto.', 15),
    
    // ─── COCINAS ─────────────────────────────────────────────
    makeProductARS('Robot de Cocina Mambo Cooking Victory', 1030000, 'cocinas', 'Multifunción con programas automáticos.', 8),
    makeProductARS('Robot de Cocina Telefunken 3.5L', 420000, 'cocinas', 'Capacidad media para recetas rápidas.', 4),
    makeProductUSD('Aspiradora Robot Automática', 12.5, 'cocinas', 'Robot básico para limpieza automática.', 2),
    makeProductUSD('Aspiradora Conga 2499', 180, 'cocinas', 'Aspiradora inteligente funciones avanzadas.', 3),
    makeProductARS('Aspiradora Escobar Conga Rockstar 1500', 264990, 'cocinas', 'Aspiradora inalámbrica potente.', 3),
    makeProductUSD('Minipimer Winco', 35, 'cocinas', 'Batidora de mano compacta.', 0.8),
    makeProductARS('Tostadora Cecotec', 49000, 'cocinas', 'Tostadora eléctrica diseño moderno.', 1.5),
    makeProductUSD('Waflera Winco', 19, 'cocinas', 'Aparato para waffles caseros.', 1.2),
    makeProductUSD('Exprimidor Winco 1L', 17, 'cocinas', 'Exprimidor eléctrico para jugos.', 1),
    makeProductARS('Pava Nuvoh Vidrio Templado', 29990, 'cocinas', 'Hervidor con diseño elegante.', 0.8),
    makeProductARS('Pava Nuvoh Digital con Selector', 49990, 'cocinas', 'Control de temperatura digital.', 0.9),
    makeProductARS('Pava Lusqtoff Acero Inox 1.7L', 44490, 'cocinas', 'Hervidor clásico en acero inoxidable.', 0.9),
    makeProductARS('Cafetera Telefunken Verona Plus 1.2L', 32000, 'cocinas', 'Cafetera eléctrica tamaño medio.', 1.5),
    makeProductARS('Cafetera Lusqtoff 3 en 1 Expresso', 409450, 'cocinas', 'Expresso multifunción varias modalidades.', 4),
    makeProductARS('Microondas Embassy', 118000, 'cocinas', 'Microondas básico para uso diario.', 10),
    makeProductARS('Microondas Lusqtoff 20L', 139990, 'cocinas', 'Microondas compacto 20 litros.', 10.5),
    makeProductARS('Freidora Embassy 2.8L', 42500, 'cocinas', 'Freidora eléctrica tamaño medio.', 3),
    makeProductARS('Freidora Embassy 5.5L', 65000, 'cocinas', 'Freidora gran capacidad.', 4),
    makeProductARS('Freidora de Aire Telefunken EasyFryer-6900', 96000, 'cocinas', 'Cocina saludable con poco aceite.', 4.5),
    makeProductARS('Cecotec Horno y Freidora de Aire 15L', 187500, 'cocinas', 'Horno multifunción con freidora de aire.', 6),
    makeProductUSD('Anafe Individual Winco W40', 16, 'cocinas', 'Anafe eléctrico portátil para camping.', 1),
    makeProductARS('Anafe Eléctrico Doble Telefunken TF-AE10500', 46490, 'cocinas', 'Anafe doble para cocinar dos platos.', 2.5),
    makeProductARS('Horno Eléctrico Lusqtoff LQ-HE45C', 147000, 'cocinas', 'Horno eléctrico compacto.', 7),
    makeProductARS('Horno Eléctrico Lusqtoff LO-HE85CL', 170500, 'cocinas', 'Horno mayor capacidad.', 9),
    makeProductARS('Horno Eléctrico Pioneer Home 50L', 156000, 'cocinas', 'Horno tamaño medio versátil.', 8),
    makeProductARS('Horno Eléctrico Pioneer Home 75L', 180000, 'cocinas', 'Gran capacidad para familias.', 10),
    makeProductUSD('Horno Eléctrico Telefunken TF-E6500', 144, 'cocinas', 'Horno eléctrico confiable tamaño estándar.', 8),
    makeProductUSD('Horno Eléctrico Telefunken TF-E1500C 150L', 187, 'cocinas', 'Horno gran capacidad.', 15),
    makeProductUSD('Horno Eléctrico Empotrable Ultracomb UC-E60M', 301, 'cocinas', 'Horno empotrable moderno diseño elegante.', 12),
    makeProductARS('Cocina Eléctrica Embassy Negra', 400000, 'cocinas', 'Cocina eléctrica completa para hogar.', 30),
    makeProductUSD('Multicocina Winco W152', 23, 'cocinas', 'Cocina eléctrica portátil multifunción.', 2.5),
    makeProductUSD('Cortadora de Alimentos Ultracomb FS-6301', 63.8, 'cocinas', 'Cortadora eléctrica para fiambres y quesos.', 3),
    makeProductARS('Rallador Eléctrico Lusqtoff 200W', 64990, 'cocinas', 'Rallador potente para cocina rápida.', 1.5),
    makeProductARS('Máquina de Hielo Harly', 149500, 'cocinas', 'Produce hielo rápido y práctico.', 6),
    makeProductARS('Máquina de Helado Atma', 380000, 'cocinas', 'Máquina para helados caseros.', 7),
    makeProductUSD('Yogurtera Ultracomb YG-2707', 23.8, 'cocinas', 'Yogurtera eléctrica para yogur casero.', 1.5),
    
    // ─── BAÑO ────────────────────────────────────────────────
    makeProductUSD('Estante de Baño', 17, 'bano', 'Estante metálico para organizar accesorios.', 0.5),
    makeProductUSD('Toallero Premium', 11, 'bano', 'Porta toallas elegante y resistente.', 0.3),
    makeProductUSD('Set de Baño Completo', 17.5, 'bano', 'Incluye accesorios básicos de baño.', 0.4),
    makeProductUSD('Cortinas de Baño', 4.8, 'bano', 'Cortina plástica estándar fácil de instalar.', 0.2),
    makeProductUSD('Barra de Cortina de Baño', 4.8, 'bano', 'Barra ajustable para cortinas de baño.', 0.3),
    makeProductUSD('Porta Rollo Papel', 3.5, 'bano', 'Soporte sencillo para papel higiénico.', 0.1),
    makeProductUSD('Alfombra de Baño', 5.9, 'bano', 'Alfombra absorbente para salida de ducha.', 0.3),
    makeProductUSD('Caja de Papel de Baño', 3.9, 'bano', 'Caja organizadora para papel higiénico.', 0.15),
    
    // ─── BELLEZA ─────────────────────────────────────────────
    makeProductUSD('Mascarilla Capilar Karseell Original', 11, 'belleza', 'Tratamiento nutritivo con colágeno.', 0.15),
    makeProductUSD('Mascarilla Capilar Karseell AAA Importada', 8, 'belleza', 'Versión económica hidratación y brillo.', 0.12),
    makeProductUSD('Epilator depiladora eléctrica', 3.5, 'belleza', 'Depiladora compacta de uso rápido.', 0.1),
    makeProductARS('Cepillo Modelador Cecotec', 265300, 'belleza', 'Cepillo eléctrico multifunción para peinados.', 0.5),
    makeProductUSD('Secador de Pelo 2000W Exxtra Tech', 12, 'belleza', 'Potente secador con varias velocidades.', 0.5),
    makeProductUSD('Planchita de Pelo Exxtra Tech', 9, 'belleza', 'Plancha compacta para alisar rápidamente.', 0.3),
    makeProductUSD('Cepillo Alisador Secador Exxtra Tech', 10.5, 'belleza', 'Cepillo que combina secado y alisado.', 0.4),
    makeProductUSD('Cepillo Modelador 5 en 1 Exxtra Tech', 15, 'belleza', 'Incluye varios cabezales para distintos estilos.', 0.5),
    makeProductUSD('Secador de Pelo Silencioso Exxtra Tech', 11, 'belleza', 'Modelo silencioso para uso prolongado.', 0.5),
    makeProductUSD('Secador de Pelo Flujo de Aire con Accesorios', 28, 'belleza', 'Secador profesional con kit de accesorios.', 0.6),
    makeProductUSD('Buclera Profesional Exxtra Tech', 9.5, 'belleza', 'Rizador eléctrico para ondas definidas.', 0.3),
    makeProductUSD('Buclera Triple Exxtra Tech', 11.5, 'belleza', 'Genera ondas más marcadas y voluminosas.', 0.3),
    makeProductUSD('Limpiador de Brochas Eléctrico 3 en 1', 20, 'belleza', 'Dispositivo para limpiar brochas de maquillaje.', 0.2),
    makeProductUSD('Body Splash Árabes', 10, 'belleza', 'Fragancias corporales inspiradas en aromas árabes.', 0.2),
    
    // ─── DECORACIÓN ─────────────────────────────────────────
    makeProductUSD('Jarrones Cerámica 21-17 cm', 15, 'decoracion', 'Juego de jarrones decorativos en cerámica.', 0.5),
    makeProductUSD('Jarrones Cerámica 21-25 cm', 20, 'decoracion', 'Jarrones más altos estilo clásico.', 0.6),
    makeProductUSD('Zapato Cristal Decorativo', 5, 'decoracion', 'Pieza decorativa en vidrio tallado.', 0.2),
    makeProductUSD('Astrolabio Decorativo', 5, 'decoracion', 'Objeto decorativo estilo vintage.', 0.2),
    makeProductUSD('Tateti Dorado', 60, 'decoracion', 'Juego decorativo en acabado dorado.', 0.5),
    makeProductUSD('Porta Vino Cadena', 4.5, 'decoracion', 'Soporte decorativo con efecto flotante.', 0.2),
    makeProductARS('Tocadisco Winco W407', 145550, 'decoracion', 'Tocadiscos retro con estilo clásico.', 2),
    makeProductUSD('Ajedrez de Vidrio 20x20 cm', 13, 'decoracion', 'Juego de ajedrez decorativo en vidrio.', 0.8),
    makeProductUSD('Ajedrez de Vidrio 25x25 cm', 14, 'decoracion', 'Versión más grande ideal para exhibición.', 1),
    makeProductUSD('Ajedrez de Vidrio 35x35 cm', 18, 'decoracion', 'Tablero amplio pieza decorativa y funcional.', 1.5),
    
    // ─── ILUMINACIÓN Y GADGETS ──────────────────────────────
    makeProductUSD('Cámaras Foco 360 WiFi', 14, 'iluminacion-gadgets', 'Cámara panorámica visión 360° seguridad.', 0.2),
    makeProductUSD('Solar Lamp Induction Wall Lamp', 7, 'iluminacion-gadgets', 'Lámpara solar con sensor de movimiento.', 0.3),
    makeProductUSD('Linterna de Mano LED COB/XPE', 3, 'iluminacion-gadgets', 'Linterna portátil con enfoque ajustable.', 0.15),
    makeProductUSD('Luz LED Emergencia Portátil Solar', 10, 'iluminacion-gadgets', 'Luz recargable para cortes de energía.', 0.2),
    makeProductUSD('Soporte Cargador para Auto', 12, 'iluminacion-gadgets', 'Soporte con cargador integrado para celular.', 0.15),
    makeProductUSD('Mini Printer Portátil', 10, 'iluminacion-gadgets', 'Impresora compacta para notas y etiquetas.', 0.2),
    makeProductUSD('Luz Panda Silicona', 10, 'iluminacion-gadgets', 'Lámpara nocturna infantil diseño panda.', 0.15),
    
    // ─── HERRAMIENTAS ────────────────────────────────────────
    makeProductUSD('Manguera 15 metros', 10, 'herramientas', 'Manguera extensible para jardín o limpieza.', 0.5),
    makeProductUSD('Manguera 30 metros', 15, 'herramientas', 'Versión más larga para espacios amplios.', 0.8),
    makeProductUSD('Compresor/Inflador portátil', 22, 'herramientas', 'Inflador eléctrico para neumáticos y pelotas.', 0.5),
    makeProductUSD('Soplador de Aire', 18, 'herramientas', 'Herramienta para limpieza de polvo y hojas.', 0.6),
    makeProductUSD('Taladro Inalámbrico + Kit Herramientas', 65, 'herramientas', 'Taladro con accesorios completos para bricolaje.', 2),
    makeProductUSD('Taladro BAT Konan 21V', 67, 'herramientas', 'Taladro inalámbrico alta potencia batería litio.', 2),
    makeProductUSD('Motosierra Eléctrica 21V', 27, 'herramientas', 'Herramienta compacta para cortes pequeños.', 1.5),
    makeProductUSD('Caja de Herramientas 108 piezas', 36, 'herramientas', 'Set completo para reparaciones domésticas.', 3),
    makeProductUSD('Caja de Herramientas 46 piezas', 6.5, 'herramientas', 'Kit básico para tareas simples.', 1),
    makeProductARS('Hidrolavadora Blaupunkt Hidrowash-1400', 240000, 'herramientas', 'Hidrolavadora potente para limpieza exterior.', 5),
    makeProductUSD('Hidrolavadora con 2 Baterías', 28, 'herramientas', 'Hidrolavadora portátil para autos y patios.', 2),
    
    // ─── HOGAR Y MUEBLES ────────────────────────────────────
    makeProductUSD('Tender de Plástico 20kg Nuvoh', 15, 'hogar-muebles', 'Tendedero liviano soporta hasta 20 kg.', 1),
    makeProductUSD('Tender Vertical 40kg', 20, 'hogar-muebles', 'Modelo vertical ahorra espacio ideal departamentos.', 1.5),
    makeProductUSD('Tender Retráctil Redondo Laundry', 14, 'hogar-muebles', 'Compacto y retráctil para espacios reducidos.', 0.8),
    makeProductUSD('Mesa de Arrime', 15, 'hogar-muebles', 'Mesa auxiliar pequeña y práctica.', 3),
    makeProductUSD('Cesto de Secado', 13, 'hogar-muebles', 'Cesto liviano para secar o almacenar ropa.', 0.5),
    makeProductUSD('Perchero con Ruedas', 14, 'hogar-muebles', 'Perchero móvil para ropa y accesorios.', 2),
    makeProductUSD('Mesa con Ruedas', 17, 'hogar-muebles', 'Mesa versátil con ruedas para oficina o cocina.', 4),
    makeProductUSD('Manta Premium con Bolsa Sellada', 19, 'hogar-muebles', 'Manta de calidad empaquetada al vacío.', 0.8),
    makeProductUSD('Manta Premium sin Bolsa', 14.5, 'hogar-muebles', 'Versión económica suave y abrigada.', 0.7),
    makeProductUSD('Estante Hogar 50x70 cm', 8, 'hogar-muebles', 'Estante metálico para organización.', 1.5),
    makeProductARS('Silla Plegable Camping Noga', 16000, 'hogar-muebles', 'Silla portátil para camping ligera y resistente.', 2),
    makeProductARS('Silla de Oficina Ergonómica', 55000, 'hogar-muebles', 'Silla cómoda para largas jornadas de trabajo.', 8),
    makeProductARS('Silla de Oficina Operativa 3009PVC', 73500, 'hogar-muebles', 'Modelo robusto para oficinas.', 9),
    makeProductARS('Silla Plegable Genérica', 30990, 'hogar-muebles', 'Silla plegable práctica para eventos.', 3),
    makeProductARS('Silla Gamer DreadPro', 125000, 'hogar-muebles', 'Silla ergonómica para largas sesiones de juego.', 12),
    makeProductARS('Silla Gamer con Luces LED y Apoya Pies', 245000, 'hogar-muebles', 'Modelo premium con iluminación y soporte extra.', 15),
    makeProductUSD('Plancha Seca Winco W35 1000W', 19.4, 'hogar-muebles', 'Plancha básica ligera y económica.', 0.8),
    makeProductUSD('Plancha a Vapor Winco W38 2000W', 22.5, 'hogar-muebles', 'Plancha potente con función de vapor.', 1),
    makeProductUSD('Juego 21 piezas Carote Antiadherente', 115, 'hogar-muebles', 'Set completo ollas y sartenes desmontables.', 5),
    makeProductARS('Smart Scale Balanza Blaupunkt Blanca', 23990, 'hogar-muebles', 'Balanza inteligente para control de peso.', 0.5),
    makeProductUSD('Set Sartenes 15 piezas', 95, 'hogar-muebles', 'Juego completo sartenes antiadherentes.', 4),
    makeProductUSD('Set Cuchillo + Tabla Heesem 7 piezas', 10, 'hogar-muebles', 'Kit básico de cuchillos con tabla.', 0.8),
    makeProductUSD('Kit Cocina Heesem', 14, 'hogar-muebles', 'Set de utensilios básicos para cocina.', 0.8),
    makeProductUSD('Kit Cocina Bali', 16, 'hogar-muebles', 'Kit de cocina con diseño moderno.', 0.8),
    makeProductUSD('Termo Media Manija negro/gris', 10, 'hogar-muebles', 'Termo práctico para bebidas calientes.', 0.6),
    makeProductUSD('Electric Mixing Cup 400ml', 12, 'hogar-muebles', 'Vaso mezclador eléctrico portátil.', 0.4),
    makeProductUSD('Taza Nube', 2.8, 'hogar-muebles', 'Taza decorativa con diseño de nube.', 0.2),
    makeProductUSD('Spray Akro OL', 3, 'hogar-muebles', 'Botella spray multiuso.', 0.1),
    makeProductUSD('Batidora de Mano', 16, 'hogar-muebles', 'Batidora portátil para mezclas rápidas.', 0.6),
    makeProductUSD('Extendedor de Canilla', 2, 'hogar-muebles', 'Adaptador para grifos práctico en cocina.', 0.05),
    makeProductUSD('Rack Microondas', 11, 'hogar-muebles', 'Soporte metálico para microondas.', 1.5),
    makeProductUSD('Seca Platos Rack de Cocina 65cm', 16, 'hogar-muebles', 'Escurridor de platos grande.', 0.8),
    makeProductUSD('Mopa Triangular', 5, 'hogar-muebles', 'Mopa compacta para limpieza de esquinas.', 0.3),
    makeProductUSD('Mopa para Fregar', 9, 'hogar-muebles', 'Mopa clásica para pisos.', 0.4),
    makeProductUSD('Mopa Kabolai SpinMop', 24, 'hogar-muebles', 'Mopa giratoria con sistema de filtrado.', 0.6),
    
    // ─── EXTERIORES ──────────────────────────────────────────
    makeProductARS('Gazebo Plegable 3x3 Noga Azul', 76230, 'exteriores', 'Carpa plegable para exteriores fácil de montar.', 10),
    makeProductARS('Gazebo Plegable 3x3 Noga Pro Rojo', 117400, 'exteriores', 'Versión reforzada para eventos al aire libre.', 12),
    
    // ─── LIMPIEZA ────────────────────────────────────────────
    makeProductARS('Robot Limpiapiscinas Scuba ET', 520000, 'limpieza', 'Robot automático para limpieza de piletas.', 8),
    
    // ─── GADGETS ─────────────────────────────────────────────
    makeProductUSD('Contadora de Plata', 19.5, 'gadgets', 'Máquina para contar billetes compacta y precisa.', 0.5),
    makeProductUSD('Pistola Masajeadora Gadnic', 11, 'gadgets', 'Masajeador eléctrico portátil para relajación.', 0.4),
    makeProductUSD('Foot Massage', 5, 'gadgets', 'Masajeador básico para pies cansados.', 0.2),
    makeProductUSD('Mini Masajeador', 1.8, 'gadgets', 'Masajeador portátil económico.', 0.1),
    makeProductUSD('Mini Cooling Fan Portátil', 19, 'gadgets', 'Ventilador portátil recargable para verano.', 0.3),
    makeProductUSD('Roseador para Mosquito', 9, 'gadgets', 'Dispositivo para repeler insectos en interiores.', 0.15),
    makeProductUSD('Aromaterapia Campire', 23, 'gadgets', 'Difusor de aromas para relajación ambiental.', 0.3),
    makeProductUSD('Humidificador Campire', 17.5, 'gadgets', 'Humidificador compacto para mejorar el aire.', 0.4),
    makeProductUSD('Humidificador de Ambiente Grande', 16, 'gadgets', 'Modelo de gran capacidad.', 0.6),
    makeProductUSD('Humidificador de Ambiente Económico', 5, 'gadgets', 'Versión básica portátil y accesible.', 0.2),
    makeProductUSD('Soporte de Televisor 14"-42"', 5, 'gadgets', 'Soporte metálico para pantallas hasta 25 kg.', 0.5),
    makeProductUSD('Magnetic Nasal Starter Kit', 7, 'gadgets', 'Kit magnético para mejorar respiración nasal.', 0.05),
    makeProductUSD('Parche Frío', 4.5, 'gadgets', 'Parche refrescante para aliviar molestias.', 0.05),
    makeProductUSD('Peines de Capybara', 2, 'gadgets', 'Peines decorativos y funcionales.', 0.05),
];

// ─── SUBIR A FIRESTORE ─────────────────────────────────────
(async () => {
    console.log(`📦 Subiendo ${products.length} productos a Firestore...`);
    let ok = 0, err = 0;
    for (const p of products) {
        try {
            await db.collection('products').add(p);
            ok++;
            console.log(`✅ [${ok}/${products.length}] ${p.name}`);
        } catch (e) {
            err++;
            console.error(`❌ Error al subir "${p.name}":`, e);
        }
    }
    console.log(`\n🎉 ¡Proceso completado! ${ok} subidos, ${err} errores.`);
    if (err > 0) console.log('⚠️  Revisá los errores arriba y volvé a intentar los que fallaron.');
})();
