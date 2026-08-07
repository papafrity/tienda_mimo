const { MercadoPagoConfig, Payment } = require('mercadopago');
const fmt = n => Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const telegramNotifier = require("../lib/telegramNotifier");
const { admin, db } = require("../lib/firebase-admin");

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-TU-ACCESS-TOKEN-AQUI' 
});

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
        const { payment_id, orderId, orderDetails } = req.body;
        if (!payment_id || !orderId || !orderDetails) {
            return res.status(400).json({ message: 'Datos incompletos' });
        }

        // â”€â”€â”€ VALIDATE PAYMENT WITH MercadoPago â”€â”€â”€
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: payment_id });

        if (paymentData.status !== 'approved') {
            return res.status(400).json({ message: 'El pago no estÃ¡ aprobado' });
        }

        if (paymentData.external_reference !== orderId) {
            return res.status(400).json({ message: 'El ID de orden no coincide' });
        }

        // â"€â"€â"€ UPDATE ORDER STATUS TO PAID (server-side with Admin SDK) â"€â"€â"€
        try {
            await db.collection('orders').doc(orderId).update({
                status: 'paid',
                paymentId: String(payment_id),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (fireErr) {
            console.error('Firestore update failed:', fireErr && fireErr.message ? fireErr.message : fireErr);
            return res.status(500).json({ message: 'El pago se verificó pero no se pudo actualizar la orden.' });
        }

        // ConfiguraciÃ³n de Resend
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.error('Falta RESEND_API_KEY en las variables de entorno.');
            return res.status(500).json({ message: 'Error de configuraciÃ³n del servidor de emails.' });
        }

        const adminEmail = 'sebastian.bustos4994@gmail.com';
        const customerEmail = orderDetails.customer.email;

        // Estructurar el detalle del pedido para el correo
        let itemsHtml = '';
        let totalCostARS = 0;
        let totalProfit = 0;
        orderDetails.cart.forEach(item => {
            const subtotal = Number(item.price) * item.qty;
            const costItem = Number(item.costARS || 0) * item.qty;
            const profitItem = subtotal - costItem;
            totalCostARS += costItem;
            totalProfit += profitItem;
            const costLabel = item.costCurrency === 'USD'
                ? `US$${fmt(Number(item.cost) * item.qty)} (≈ $${fmt(Math.round(costItem))} ARS)`
                : `$${fmt(costItem)} ARS`;
            itemsHtml += `<li><strong>${item.name}</strong> x${item.qty} - Venta: $${fmt(subtotal)} | Costo prov.: ${costLabel} | Ganancia: $${fmt(Math.round(profitItem))}</li>`;
        });

        // HTML para el email que recibe el administrador (Proveedor)
        const emailHtml = `
            <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #0c0f17; color: #ffffff;\">
                <h2 style=\"color: #00f0ff; border-bottom: 2px solid #00f0ff; padding-bottom: 10px; font-family: 'Outfit', sans-serif;\">¡Nueva Venta en Mimo Tienda! </h2>
                <p style=\"color: #8c9ba5;\">El pago de la orden <strong>#${orderId}</strong> ha sido verificado con éxito en Mercado Pago (ID de pago: ${payment_id}).</p>
                
                <h3 style=\"color: #a855f7; margin-top: 20px;\">DETALLES DEL ENVÍO Y FACTURACIÓN</h3>
                <table style=\"width: 100%; border-collapse: collapse; margin-top: 10px; color: #ffffff;\">
                    <tr style=\"background: rgba(255,255,255,0.03);\"><td style=\"padding: 8px; font-weight: bold; width: 150px; color: #8c9ba5;\">Nombre:</td><td style=\"padding: 8px;\">${orderDetails.customer.name}</td></tr>
                    <tr><td style=\"padding: 8px; font-weight: bold; color: #8c9ba5;\">DNI / CUIL:</td><td style=\"padding: 8px;\">${orderDetails.customer.dni}</td></tr>
                    <tr style=\"background: rgba(255,255,255,0.03);\"><td style=\"padding: 8px; font-weight: bold; color: #8c9ba5;\">Teléfono:</td><td style=\"padding: 8px;\">${orderDetails.customer.phone}</td></tr>
                    <tr><td style=\"padding: 8px; font-weight: bold; color: #8c9ba5;\">Email:</td><td style=\"padding: 8px;\">${customerEmail}</td></tr>
                    <tr style=\"background: rgba(255,255,255,0.03);\"><td style=\"padding: 8px; font-weight: bold; color: #8c9ba5;\">Dirección:</td><td style=\"padding: 8px;\">${orderDetails.customer.address}</td></tr>
                    <tr><td style=\"padding: 8px; font-weight: bold; color: #8c9ba5;\">Localidad:</td><td style=\"padding: 8px;\">${orderDetails.customer.city}</td></tr>
                    <tr style=\"background: rgba(255,255,255,0.03);\"><td style=\"padding: 8px; font-weight: bold; color: #8c9ba5;\">Provincia:</td><td style=\"padding: 8px;\">${orderDetails.customer.province}</td></tr>
                    <tr><td style=\"padding: 8px; font-weight: bold; color: #8c9ba5;\">Código Postal:</td><td style=\"padding: 8px;\">${orderDetails.customer.zip}</td></tr>
                </table>

                <h3 style=\"color: #a855f7; margin-top: 25px;\">DETALLE DE LOS PRODUCTOS</h3>
                <ul style=\"padding-left: 20px; line-height: 1.6; color: #ffffff;\">
                    ${itemsHtml}
                </ul>
                <h3 style=\"color: #2ed573;\">Total Cobrado: $${fmt(orderDetails.total)}</h3>
                <div style=\"margin-top: 15px; padding: 12px; background: rgba(168,85,247,0.1); border-left: 4px solid #a855f7; border-radius: 4px;\">
                    <p style=\"margin: 0 0 4px 0; font-weight: bold; color: #a855f7;\">Resumen para vos (no se muestra al cliente):</p>
                    <p style=\"margin: 0; color: #8c9ba5; font-size: 0.95rem;\">Costo proveedor total: $${fmt(Math.round(totalCostARS))} ARS · Ganancia estimada: $${fmt(Math.round(totalProfit))} ARS</p>
                </div>
                
                <div style=\"margin-top: 30px; padding: 15px; background: rgba(46,213,115,0.1); border-left: 4px solid #2ed573; border-radius: 4px;\">
                    <p style=\"margin: 0; font-weight: bold; color: #2ed573;\">Instrucciones para Dropshipping:</p>
                    <p style=\"margin: 5px 0 0 0; color: #8c9ba5; font-size: 0.9rem;\">Copia los datos de envÃo de arriba y realiza el pedido a tu proveedor para que lo despache directamente a esta direcciÃ³n.</p>
                </div>
            </div>
        `;

        const responseResend = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Mimo Tienda <onboarding@resend.dev>',
                to: [adminEmail],
                subject: `¡Nueva Venta Mimo! - Orden #${orderId}`,
                html: emailHtml
            })
        });

        const resendData = await responseResend.json();
        
        if (!responseResend.ok) {
            console.error('Error de Resend:', resendData);
            return res.status(500).json({ message: 'El pago se verificó pero falló el envió del email.', error: resendData });
        }

        // Notificación por Telegram (no debe bloquear flujo de compra)
        try {
            const notifText = `Nueva venta - Orden #${orderId} - Cliente: ${orderDetails.customer.name} - Total: $${fmt(orderDetails.total)} - Costo prov.: $${fmt(Math.round(totalCostARS))} - Ganancia est.: $${fmt(Math.round(totalProfit))} - Items: ${orderDetails.cart.map(i => i.name).join(', ')}`;
            await telegramNotifier.notify(notifText);
        } catch (err) {
            console.error('Telegram notification failed:', err && err.message ? err.message : err);
        }

        return res.status(200).json({ message: 'Pago verificado e email enviado con éxito' });

    } catch (error) {
        console.error("Error en la confirmación del pago:", error);
        return res.status(500).json({ message: 'Error en la verificación del pago: ' + error.message });
    }
};
