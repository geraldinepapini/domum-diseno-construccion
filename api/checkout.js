import { MercadoPagoConfig, Preference } from 'mercadopago';

// 1. Inicializamos Mercado Pago con el token que guardaste en Vercel
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

export default async function handler(req, res) {
  // Snipcart nos enviará los datos mediante un método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // 2. Recibimos la información del carrito que envía Snipcart
    const snipcartOrder = req.body;

    // Convertimos los productos de Snipcart al formato que pide Mercado Pago
    const itemsMP = snipcartOrder.items.map(item => ({
      id: item.id,
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'ARS' // Moneda para Argentina
    }));

    // 3. Creamos la "Preferencia de Pago" en Mercado Pago
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: itemsMP,
        // URLs a donde vuelve el cliente tras pagar (puedes cambiarlas por las tuyas)
        back_urls: {
          success: `https://${req.headers.host}/index.html`,
          failure: `https://${req.headers.host}/index.html`,
          pending: `https://${req.headers.host}/index.html`
        },
        auto_return: 'approved',
      }
    });

    // 4. Le respondemos a Snipcart con el link de pago generado
    // Snipcart exige este formato exacto de respuesta para pasarelas personalizadas
    return res.status(200).json({
      checkoutUrl: result.init_point // Este es el link de la pasarela de Mercado Pago
    });

  } catch (error) {
    console.error('Error procesando el pago:', error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
