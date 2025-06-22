import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Verificar que existe la API key
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing")
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 })
    }

    // Crear instancia de Resend dentro del handler
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: "contacto@hernanamaiz.dev",
      to: email,
      subject: "¿Comiste algo delicioso hoy? 🍽️",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ea580c; text-align: center;">¡Hola! 👋</h2>
          
          <div style="background-color: #fff7ed; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #9a3412; margin-top: 0;">¿Comiste algo distinto hoy?</h3>
            <p style="color: #7c2d12; font-size: 16px; line-height: 1.6;">
              Registra tus comidas para armar tu recetario personal y nunca olvides esas recetas especiales que tanto te gustan.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/nueva-receta" 
               style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Agregar Nueva Receta
            </a>
          </div>
          
          <p style="color: #78716c; font-size: 14px; text-align: center;">
            ¡Cada receta cuenta una historia! 📖✨
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: "Reminder sent successfully" })
  } catch (error) {
    console.error("Error sending reminder:", error)
    return NextResponse.json({ success: false, error: "Failed to send reminder" }, { status: 500 })
  }
}
