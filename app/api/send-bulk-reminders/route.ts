import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { initializeApp, getApps } from "firebase/app"
import { getFirestore, collection, getDocs } from "firebase/firestore"

// Configuración de Firebase para el servidor
const firebaseConfig = {
  apiKey: "AIzaSyA0XoOMeV7KK2CQzhWXFXaKJGmJaDj0KXA",
  authDomain: "mi-recetario-9216a.firebaseapp.com",
  projectId: "mi-recetario-9216a",
  storageBucket: "mi-recetario-9216a.firebasestorage.app",
  messagingSenderId: "273759926492",
  appId: "1:273759926492:web:e280662d531aa439d91c19",
}

// Inicializar Firebase en el servidor
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

export async function POST(request: NextRequest) {
  try {
    // Verificar API key de autorización (opcional, para seguridad)
    const authHeader = request.headers.get("authorization")
    const expectedAuth = process.env.CRON_SECRET || "your-secret-key"

    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verificar que existe la API key de Resend
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing")
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 })
    }

    // Obtener la frecuencia del query parameter
    const { searchParams } = new URL(request.url)
    const frequency = searchParams.get("frequency") || "semanal"

    console.log(`🔥 Enviando recordatorios ${frequency}s...`)

    // Obtener usuarios de Firebase
    const querySnapshot = await getDocs(collection(db, "usuarios"))
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Filtrar usuarios por frecuencia
    const targetUsers = users.filter((user) => user.Periodicidad?.toLowerCase() === frequency.toLowerCase())

    console.log(`📧 Encontrados ${targetUsers.length} usuarios con frecuencia ${frequency}`)

    if (targetUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No users found with frequency: ${frequency}`,
        sent: 0,
      })
    }

    // Crear instancia de Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    let successCount = 0
    let errorCount = 0

    // Enviar emails a cada usuario
    for (const user of targetUsers) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-reminder`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.correo,
              name: user.Nombre,
              frequency: user.Periodicidad,
            }),
          },
        )

        if (response.ok) {
          successCount++
          console.log(`✅ Email enviado a ${user.Nombre} (${user.correo})`)
        } else {
          errorCount++
          console.error(`❌ Error enviando email a ${user.correo}`)
        }

        // Pequeña pausa entre emails para evitar rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        errorCount++
        console.error(`❌ Error enviando email a ${user.correo}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk reminders sent for frequency: ${frequency}`,
      sent: successCount,
      errors: errorCount,
      total: targetUsers.length,
    })
  } catch (error) {
    console.error("Error sending bulk reminders:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send bulk reminders",
      },
      { status: 500 },
    )
  }
}
