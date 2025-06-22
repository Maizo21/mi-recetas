import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get("authorization")
    const expectedAuth = process.env.CRON_SECRET

    console.log("🔍 Auth header received:", authHeader ? "Present" : "Missing")
    console.log("🔍 Expected auth:", expectedAuth ? "Configured" : "Missing")

    if (!expectedAuth) {
      return NextResponse.json(
        {
          error: "CRON_SECRET not configured in environment variables",
          debug: "Check Vercel Environment Variables",
        },
        { status: 500 },
      )
    }

    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          debug: {
            received: authHeader || "No authorization header",
            expected: `Bearer ${expectedAuth}`,
            help: "Add 'Authorization: Bearer your-secret' header",
          },
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Cron job test successful! 🎉",
      timestamp: new Date().toISOString(),
      timezone: "UTC",
    })
  } catch (error) {
    console.error("Cron test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Cron test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// También permitir POST para mayor flexibilidad
export async function POST(request: NextRequest) {
  return GET(request)
}
