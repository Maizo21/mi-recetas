import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Simple test endpoint working! 🚀",
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      hasCronSecret: !!process.env.CRON_SECRET,
      hasResendKey: !!process.env.RESEND_API_KEY,
    },
  })
}
