import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    const { email, name, frequency } = await request.json()

    // Verificar que existe la API key
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing")
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 })
    }

    // Crear instancia de Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Personalizar el mensaje según la frecuencia
    const getFrequencyMessage = (freq: string) => {
      const messages = {
        diaria: "¡Es hora de tu recordatorio diario! 🌅",
        semanal: "¡Tu recordatorio semanal está aquí! 📅",
        bisemanal: "¡Han pasado dos semanas! ⏰",
        mensual: "¡Tu recordatorio mensual! 📆",
        bimensual: "¡Ya pasaron dos meses! 🗓️",
      }
      return messages[freq.toLowerCase() as keyof typeof messages] || "¡Recordatorio de recetas! 🍽️"
    }

    const getFrequencyEmoji = (freq: string) => {
      const emojis = {
        diaria: "🌅",
        semanal: "📅",
        bisemanal: "⏰",
        mensual: "📆",
        bimensual: "🗓️",
      }
      return emojis[freq.toLowerCase() as keyof typeof emojis] || "🍽️"
    }

    await resend.emails.send({
      from: "Mi Recetario <contacto@hernanamaiz.dev>",
      to: email,
      subject: `${getFrequencyMessage(frequency)} - ¿Cocinaste algo delicioso?`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #fff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #fed7aa 0%, #fecaca 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <div style="font-size: 48px; margin-bottom: 10px;">${getFrequencyEmoji(frequency)}</div>
            <h1 style="color: #9a3412; margin: 0; font-size: 28px; font-weight: bold;">¡Hola ${name}! 👋</h1>
            <p style="color: #7c2d12; margin: 10px 0 0 0; font-size: 18px;">${getFrequencyMessage(frequency)}</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px; background-color: #ffffff;">
            <div style="background-color: #fff7ed; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #ea580c;">
              <h2 style="color: #9a3412; margin-top: 0; font-size: 22px; margin-bottom: 15px;">¿Preparaste algo especial hoy?</h2>
              <p style="color: #7c2d12; font-size: 16px; line-height: 1.6; margin: 0;">
                Sabemos que eres creativo en la cocina. Si hiciste algo delicioso y diferente, ¡no dejes que se olvide! 
                Registra esa receta especial en tu libro personal de recetas.
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/nueva-receta" 
                 style="display: inline-block; background-color: #ea580c; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.3); transition: all 0.3s ease;">
                📝 Agregar Nueva Receta
              </a>
            </div>

            <!-- Secondary CTA -->
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" 
                 style="display: inline-block; color: #ea580c; text-decoration: none; font-size: 14px; border-bottom: 1px solid #ea580c;">
                🍽️ Ver mis recetas guardadas
              </a>
            </div>

            <!-- Frequency Info -->
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 25px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
                <strong>Frecuencia de recordatorios:</strong> ${frequency.charAt(0).toUpperCase() + frequency.slice(1)}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              ¡Cada receta cuenta una historia! 📖✨
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Recibiste este email porque configuraste recordatorios ${frequency}s en Mi Recetario.
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: `Reminder sent successfully to ${name} (${email})`,
    })
  } catch (error) {
    console.error("Error sending reminder:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send reminder",
      },
      { status: 500 },
    )
  }
}
