import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')

console.log("Servicio de notificación de registro iniciado");

Deno.serve(async (req) => {
  // Manejar el preflight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    })
  }

  try {
    const payload = await req.json()
    console.log("Recibido el payload de registro:", JSON.stringify(payload));
    
    // El payload de un webhook de Supabase tiene la estructura: { type, table, record, schema, old_record }
    const { record } = payload
    const userEmail = record?.email || 'Desconocido'
    const createdAt = record?.created_at || new Date().toISOString()

    if (!RESEND_API_KEY || !ADMIN_EMAIL) {
      throw new Error("Faltan variables de entorno: RESEND_API_KEY o ADMIN_EMAIL en el Dashboard");
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Naranjos App <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject: '🔔 ¡Nuevo Registro de Usuario!',
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #000; color: #fff;">
            <h2 style="color: #d4af37;">Nuevo usuario registrado</h2>
            <p>Se ha registrado un nuevo usuario en la plataforma:</p>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Email:</strong> ${userEmail}</li>
              <li><strong>Fecha:</strong> ${new Date(createdAt).toLocaleString('es-ES')}</li>
            </ul>
            <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
            <p style="font-size: 11px; color: #888;">Notificación automática de Naranjo's Liquors</p>
          </div>
        `,
      }),
    })

    const data = await res.json()
    console.log("Respuesta de Resend:", JSON.stringify(data));

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (error) {
    console.error("Error procesando la notificación:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})

