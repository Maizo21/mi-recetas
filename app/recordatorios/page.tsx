"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, Mail, Clock, Calendar, User } from "lucide-react"
import Link from "next/link"
import { db, getReminders, addReminder, deleteReminder, type Reminder } from "@/lib/firebase"

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    Nombre: "",
    correo: "",
    Periodicidad: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!db) {
      console.error("❌ Firebase no está disponible")
      setLoading(false)
      return
    }

    try {
      console.log("🔥 Cargando recordatorios desde Firebase...")
      const remindersData = await getReminders()
      setReminders(remindersData)
      console.log(`✅ Cargados ${remindersData.length} recordatorios desde Firebase`)
    } catch (error) {
      console.error("❌ Error cargando recordatorios:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.Nombre.trim() || !formData.correo || !formData.Periodicidad) {
      alert("Por favor completa todos los campos")
      return
    }

    if (!db) {
      alert("Firebase no está disponible")
      return
    }

    setSaving(true)

    try {
      console.log("💾 Guardando recordatorio en Firebase...")
      await addReminder({
        Nombre: formData.Nombre.trim(),
        correo: formData.correo,
        Periodicidad: formData.Periodicidad,
      })

      console.log("✅ Recordatorio guardado en Firebase!")
      alert("¡Recordatorio configurado correctamente en Firebase!")
      setFormData({ Nombre: "", correo: "", Periodicidad: "" })
      loadData()
    } catch (error) {
      console.error("❌ Error guardando recordatorio:", error)
      alert("No se pudo configurar el recordatorio en Firebase")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteReminder = async (reminderId: string) => {
    if (!db) {
      alert("Firebase no está disponible")
      return
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este recordatorio?")) {
      return
    }

    try {
      console.log("🗑️ Eliminando recordatorio de Firebase...")
      await deleteReminder(reminderId)
      console.log("✅ Recordatorio eliminado de Firebase!")
      alert("Recordatorio eliminado correctamente")
      loadData()
    } catch (error) {
      console.error("❌ Error eliminando recordatorio:", error)
      alert("No se pudo eliminar el recordatorio")
    }
  }

  const getFrequencyText = (frequency: string) => {
    const frequencies: { [key: string]: string } = {
      diaria: "Diaria",
      semanal: "Semanal",
      bisemanal: "Bisemanal (cada 2 semanas)",
      mensual: "Mensual",
      bimensual: "Bimensual (cada 2 meses)",
    }
    return frequencies[frequency] || frequency
  }

  const getFrequencyEmoji = (frequency: string) => {
    const emojis: { [key: string]: string } = {
      diaria: "📅",
      semanal: "📆",
      bisemanal: "🗓️",
      mensual: "📋",
      bimensual: "📊",
    }
    return emojis[frequency] || "⏰"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-orange-600 animate-pulse" />
          <p className="text-base sm:text-lg text-gray-600">Cargando recordatorios...</p>
          <p className="text-sm text-gray-500 mt-2">Conectando con Firebase...</p>
        </div>
      </div>
    )
  }

  if (!db) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Mail className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Error de Conexión</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">No se pudo conectar con Firebase</p>
          <Button onClick={() => window.location.reload()} className="bg-orange-600 hover:bg-orange-700">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button variant="ghost" asChild size="sm" className="self-start">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Recordatorios de Recetas</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Configura recordatorios para no olvidar registrar tus comidas
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Firebase conectado
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Add Reminder Form */}
          <Card className="bg-white border-l-4 border-l-blue-500">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Plus className="h-5 w-5" />
                Nuevo Recordatorio
              </CardTitle>
              <CardDescription className="text-sm">
                Configura recordatorios para motivarte a registrar nuevas recetas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="flex items-center gap-2 text-sm sm:text-base">
                    <User className="h-4 w-4" />
                    Nombre
                  </Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.Nombre}
                    onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                    required
                    className="h-11 sm:h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm sm:text-base">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    required
                    className="h-11 sm:h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency" className="flex items-center gap-2 text-sm sm:text-base">
                    <Clock className="h-4 w-4" />
                    Frecuencia
                  </Label>
                  <Select
                    value={formData.Periodicidad}
                    onValueChange={(value) => setFormData({ ...formData, Periodicidad: value })}
                  >
                    <SelectTrigger className="h-11 sm:h-12">
                      <SelectValue placeholder="¿Con qué frecuencia?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diaria">📅 Diaria</SelectItem>
                      <SelectItem value="semanal">📆 Semanal</SelectItem>
                      <SelectItem value="bisemanal">🗓️ Bisemanal (cada 2 semanas)</SelectItem>
                      <SelectItem value="mensual">📋 Mensual</SelectItem>
                      <SelectItem value="bimensual">📊 Bimensual (cada 2 meses)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 h-11 sm:h-12"
                  disabled={saving}
                >
                  {saving ? (
                    "Guardando en Firebase..."
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Configurar Recordatorio
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Reminders */}
          <Card className="bg-white border-l-4 border-l-green-500">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calendar className="h-5 w-5" />
                Recordatorios Activos
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Firebase
                </div>
              </CardTitle>
              <CardDescription className="text-sm">
                Gestiona tus recordatorios configurados ({reminders.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 text-sm sm:text-base">No tienes recordatorios configurados</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Agrega uno usando el formulario</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                            {reminder.Nombre}
                          </h4>
                          <span className="text-lg">{getFrequencyEmoji(reminder.Periodicidad)}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{reminder.correo}</p>
                        <p className="text-xs text-gray-500">Frecuencia: {getFrequencyText(reminder.Periodicidad)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReminder(reminder.id!)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-6 sm:mt-8 bg-blue-50 border-l-4 border-l-blue-500">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">
                  ¿Cómo funcionan los recordatorios?
                </h3>
                <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
                  Te enviaremos emails motivacionales según la frecuencia que elijas para recordarte que registres esas
                  comidas deliciosas y diferentes que preparas. ¡Nunca más olvides una receta especial!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
