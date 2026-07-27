export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { content } = req.body;

    try {
        // Creamos la preferencia de pago en Mercado Pago
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: content.items.map(item => ({
                    title: item.name,
                    unit_price: item.price,
                    quantity: item.quantity,
                    currency_id: 'ARS'
                })),
                back_urls: {
                    success: `https://${req.headers.host}/`,
                    failure: `https://${req.headers.host}/`,
                    pending: `https://${req.headers.host}/`
                },
                auto_return: 'approved'
            })
        });

        const data = await response.json();

        // Devolvemos la URL a la que Snipcart debe redirigir al usuario
        return res.status(200).json({
            redirectUrl: data.init_point
        });
    } catch (error) {
        console.error('Error al crear preferencia de Mercado Pago:', error);
        return res.status(500).json({ error: error.message });
    }
}