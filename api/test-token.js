module.exports = async (req, res) => {
    // Permitir CORS para probar desde el navegador fácilmente
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const token = process.env.MP_ACCESS_TOKEN;
    
    // 1. Verificar si la variable existe en Vercel
    if (!token) {
        return res.status(200).json({ 
            status: '🔴 ERROR', 
            motivo: 'No se encontró la variable MP_ACCESS_TOKEN en Vercel. Asegurate de haber hecho el "Redeploy" después de guardarla.' 
        });
    }
    
    // 2. Verificar si es el texto por defecto
    if (token === 'TEST-TU-ACCESS-TOKEN-AQUI') {
         return res.status(200).json({ 
             status: '🔴 ERROR', 
             motivo: 'El token actual es el texto de prueba ("TEST-TU..."). Tenés que poner tu token real en Vercel.' 
         });
    }

    try {
        // 3. Conectar con Mercado Pago para verificar si el token es real y tiene permisos
        const response = await fetch('https://api.mercadopago.com/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return res.status(200).json({ 
                status: '🟢 ÉXITO', 
                mensaje: '¡Tu Access Token es VÁLIDO!',
                cuenta_mp: data.email,
                tipo_token: token.startsWith('TEST-') ? 'Token de Prueba (Sandbox)' : 'Token de Producción (Real)',
                instrucciones: 'El código backend está perfecto. Si el checkout sigue dando error "unauthorized", el problema NO es el código ni Vercel. Podría ser que estás intentando pagarte a vos mismo, o que MP te pide llenar el formulario de homologación.'
            });
        } else {
            return res.status(200).json({ 
                status: '🔴 ERROR DE MERCADO PAGO', 
                motivo: 'Mercado Pago dijo que el token es INVÁLIDO o no tiene permisos.',
                detalle_mp: data
            });
        }
    } catch (error) {
        return res.status(500).json({ status: 'ERROR DEL SERVIDOR', message: error.message });
    }
};
