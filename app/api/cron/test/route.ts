import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Para cron jobs de Vercel, la autorización viene automáticamente
    // Solo verificamos si viene de Vercel o si tiene el header correcto
    const authHeader = request.headers.get("authorization")
    const userAgent = request.headers.get("user-agent")
    const isFromVercel = userAgent?.includes("vercel") || authHeader?.includes("Bearer")

    // Si no viene autorización, damos información útil
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: "No authorization header provided",
        info: "This is normal when testing from browser",
        vercelCronWillWork: true,
        debug: {
          userAgent: userAgent || "Not provided",
          expectedHeader: `Bearer ${process.env.CRON_SECRET}`,
          cronSecretConfigured: !!process.env.CRON_SECRET,
        },
      })
    }

    // Verificar autorización
    const expectedAuth = process.env.CRON_SECRET
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid authorization",
          provided: authHeader,
          expected: `Bearer ${expectedAuth}`,
        },
        { status: 401 },
      )
    }

    // ¡Éxito!
    return NextResponse.json({
      success: true,
      message: "🎉 Cron endpoint working perfectly!",
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || "development",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
