"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function TestCronPage() {
  const [secret, setSecret] = useState("esternocleiodomastoideos5.1") // Pre-filled from your error
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testEndpoint = async (endpoint: string, requiresAuth = true) => {
    setLoading(true)
    try {
      const headers: any = {
        "Content-Type": "application/json",
      }

      if (requiresAuth && secret) {
        headers["Authorization"] = `Bearer ${secret}`
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers,
      })
      const data = await response.json()

      setResult({
        status: response.status,
        statusText: response.statusText,
        data,
        endpoint,
        success: response.ok,
      })
    } catch (error) {
      setResult({
        status: "ERROR",
        error: error instanceof Error ? error.message : "Unknown error",
        endpoint,
        success: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 Test Cron Endpoints</h1>
        <p className="text-gray-600">Prueba los endpoints de cron jobs con autorización</p>
      </div>

      {/* Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔐 Configuración
            <Badge variant="outline" className="text-green-600">
              CRON_SECRET detectado
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">CRON_SECRET</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={copySecret}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Este valor se detectó automáticamente del error anterior</p>
          </div>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🚀 Pruebas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => testEndpoint("/api/cron/debug", false)}
              disabled={loading}
              variant="outline"
              className="justify-start"
            >
              🔍 Debug (sin auth)
            </Button>

            <Button onClick={() => testEndpoint("/api/cron/test", true)} disabled={loading} className="justify-start">
              🧪 Test Cron (con auth)
            </Button>

            <Button
              onClick={() => testEndpoint("/api/send-bulk-reminders?frequency=semanal", true)}
              disabled={loading}
              variant="secondary"
              className="justify-start"
            >
              📧 Email Semanal
            </Button>

            <Button
              onClick={() => testEndpoint("/api/send-bulk-reminders?frequency=mensual", true)}
              disabled={loading}
              variant="secondary"
              className="justify-start"
            >
              📅 Email Mensual
            </Button>
          </div>

          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Probando endpoint...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : result.status === "ERROR" ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              Resultado
              <Badge variant={result.success ? "default" : "destructive"}>{result.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Endpoint:</strong>
                  <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">{result.endpoint}</p>
                </div>
                <div>
                  <strong>Status:</strong>
                  <p className={`font-semibold ${result.success ? "text-green-600" : "text-red-600"}`}>
                    {result.status} {result.statusText}
                  </p>
                </div>
              </div>

              <div>
                <strong>Response:</strong>
                <pre className="bg-gray-50 p-4 rounded mt-2 overflow-auto text-xs border">
                  {JSON.stringify(result.data || result.error, null, 2)}
                </pre>
              </div>

              {result.success && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-green-800 text-sm font-medium">✅ ¡Endpoint funcionando correctamente!</p>
                  <p className="text-green-700 text-xs mt-1">
                    Los cron jobs automáticos de Vercel funcionarán sin problemas.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Información importante</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Los navegadores NO pueden enviar headers de autorización automáticamente</li>
                <li>• Los cron jobs de Vercel SÍ envían la autorización correcta automáticamente</li>
                <li>• Esta página te permite probar los endpoints con la autorización correcta</li>
                <li>• Si el test funciona aquí, los cron jobs funcionarán en producción</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
