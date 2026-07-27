export default async function handler(req, res) {
    // Permitir llamadas CORS desde Snipcart
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        const body = req.body;
        // Snipcart envía los ítems dentro de invoice o content
        const items = body.content?.items || body.items || [];

        const mpItems = items.map(item => ({
            title: item.name,
            unit_price: Number(item.price),
            quantity: Number(item.quantity),
            currency_id: 'ARS'
        }));

        // Crear la preferencia en Mercado Pago
        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: mpItems,
                back_urls: {
                    success: `https://${req.headers.host}/`,
                    failure: `https://${req.headers.host}/`,
                    pending: `https://${req.headers.host}/`
                },
                auto_return: 'approved'
            })
        });

        const mpData = await mpResponse.json();

        if (!mpResponse.ok) {
            console.error('Error MP:', mpData);
            return res.status(500).json({ error: 'Error al comunicarse con Mercado Pago' });
        }

        // Devolver el formato esperado por Snipcart para redirección
        return res.status(200).json({
            redirectUrl: mpData.init_point
        });
    } catch (error) {
        console.error('Error interno:', error);
        return res.status(500).json({ error: error.message });
    }
}