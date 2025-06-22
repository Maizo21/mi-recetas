import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing")
      return NextResponse.json({ success: false, error: "Email service mis-configured" }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: "noreply@tu-dominio.com",
      to: email,
      subject: "¿Comiste algo delicioso hoy? 🍽️",
      html: `<p>¿Comiste algo distinto hoy? Registra tus comidas para armar tu recetario.</p>
             <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/nueva-receta">
               Agregar Nueva Receta
             </a>`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending reminder:", error)
    return NextResponse.json({ success: false, error: "Failed to send reminder" }, { status: 500 })
  }
}
