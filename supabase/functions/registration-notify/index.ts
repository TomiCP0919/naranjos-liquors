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
        subject: '🔐 Solicitud de Acceso Pendiente - Naranjo\'s Liquors',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; border: 1px solid #d4af37; border-radius: 15px; background-color: #0b0b0b; color: #ffffff; max-width: 500px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="color: #d4af37; margin: 0; font-size: 24px;">🔔 Nueva Solicitud</h1>
              <p style="color: #888; margin-top: 5px;">Revisión de acceso requerida</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">Hola Administrador,</p>
            <p style="font-size: 16px; line-height: 1.6;">
              Un nuevo usuario se ha registrado en la plataforma y está **esperando tu autorización** para acceder. Accede a la paltaforma de administración para gestionar el acceso, apruebalo o deniegalo.
            </p>
            
            <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #d4af37;">
              <p style="margin: 0; font-size: 14px; color: #d4af37; text-transform: uppercase; letter-spacing: 1px;">Datos del Usuario</p>
              <p style="margin: 10px 0 5px 0; font-size: 18px; font-weight: bold;">${userEmail}</p>
              <p style="margin: 0; font-size: 13px; color: #666;">Registrado el: ${new Date(createdAt).toLocaleString('es-ES')}</p>
            </div>
            
            <div style="text-align: center; margin-top: 35px;">
              <a href="https://naranjos-liquors.vercel.app/admin" 
                 style="background-color: #d4af37; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; transition: background 0.3s;">
                Gestionar Acceso
              </a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #333; margin: 30px 0;" />
            <p style="font-size: 11px; color: #555; text-align: center;">
              Este es un aviso automático de seguridad generado por el sistema de Naranjo's Liquors.
            </p>
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

