const { MercadoPagoConfig, Preference } = require('mercadopago');

module.exports = async (req, res) => {
    // CORS headers
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
        // ─── VALIDATE ACCESS TOKEN ─────────────────────────────
        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (!accessToken || accessToken === 'TEST-TU-ACCESS-TOKEN-AQUI') {
            console.error('MP_ACCESS_TOKEN no configurado o es el placeholder por defecto.');
            return res.status(500).json({ 
                message: 'Error de configuración: Falta el Access Token de Mercado Pago en las variables de entorno de Vercel.' 
            });
        }

        const client = new MercadoPagoConfig({ accessToken });

        const { cart, orderId } = req.body;
        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }
        if (!orderId) {
            return res.status(400).json({ message: 'Falta el ID del pedido' });
        }

        // Convertir formato del carrito frontend a formato Mercado Pago
        // Validar que cada item tenga un precio válido > 0
        const items = cart.map(item => {
            const unitPrice = Number(item.offerPrice != null ? item.offerPrice : item.price);
            if (!unitPrice || unitPrice <= 0) {
                throw new Error(`Precio inválido para el producto "${item.name}": ${unitPrice}`);
            }
            return {
                id: String(item.id),
                title: String(item.name).substring(0, 256),
                unit_price: unitPrice,
                quantity: Number(item.qty) || 1,
                currency_id: 'ARS',
            };
        });

        const preference = new Preference(client);
        
        // URL a la que volverá el usuario luego de pagar
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
        console.error("Error completo en Mercado Pago:", JSON.stringify({
            message: error.message,
            cause: error.cause,
            status: error.status,
            stack: error.stack
        }, null, 2));

        let userMessage = 'Error procesando el pago';
        if (error.message && error.message.includes('unauthorized')) {
            userMessage = 'Error de autenticación con Mercado Pago. El Access Token puede estar expirado o ser incorrecto. Revisá las variables de entorno en Vercel.';
        } else if (error.cause) {
            userMessage += ': ' + JSON.stringify(error.cause);
        } else {
            userMessage += ': ' + error.message;
        }

        res.status(500).json({ message: userMessage, error: error.message });
    }
};

