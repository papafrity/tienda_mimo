const { MercadoPagoConfig, Preference } = require('mercadopago');

// Vercel inyectará esto desde las variables de entorno
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-TU-ACCESS-TOKEN-AQUI' 
});

module.exports = async (req, res) => {
    // CORS headers just in case
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { cart, orderId } = req.body;
        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }
        if (!orderId) {
            return res.status(400).json({ message: 'Falta el ID del pedido' });
        }

        // Convertir formato del carrito frontend a formato Mercado Pago
        const items = cart.map(item => ({
            id: item.id,
            title: item.name,
            unit_price: Number(item.offerPrice != null ? item.offerPrice : item.price),
            quantity: Number(item.qty),
            currency_id: 'ARS',
        }));

        const preference = new Preference(client);
        
        // URL a la que volverá el usuario luego de pagar (debe ser la web final)
        const hostUrl = req.headers.origin || `https://${req.headers.host}`;
        
        const result = await preference.create({
            body: {
                items: items,
                external_reference: orderId,
                back_urls: {
                    success: `${hostUrl}/gracias.html`,
                    failure: `${hostUrl}/index.html?pago=error`,
                    pending: `${hostUrl}/index.html?pago=pendiente`
                },
                payment_methods: {
                    installments: 12
                },
                auto_return: 'approved'
            }
        });

        res.status(200).json({ 
            id: result.id,
            init_point: result.init_point
        });

    } catch (error) {
        console.error("Error en Mercado Pago:", error);
        // Si error.cause existe en MP v2, a veces tiene los detalles de validación
        const detail = error.cause ? JSON.stringify(error.cause) : error.message;
        res.status(500).json({ message: 'Error procesando el pago: ' + detail, error: error.message });
    }
};
