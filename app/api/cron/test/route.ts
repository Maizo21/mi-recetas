import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get("authorization")
    const expectedAuth = process.env.CRON_SECRET

    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: "Cron job test successful!",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Cron test failed",
      },
      { status: 500 },
    )
  }
}