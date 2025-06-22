"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, Mail, Clock, Calendar } from "lucide-react"
import Link from "next/link"

interface Reminder {
  id: string
  email: string
  frequency: string
  nextSend: Date
  active: boolean
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    frequency: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const savedReminders = localStorage.getItem("reminders")
    if (savedReminders) {
      const parsedReminders = JSON.parse(savedReminders).map((reminder: any) => ({
        ...reminder,
        nextSend: new Date(reminder.nextSend),
      }))
      setReminders(parsedReminders)
    }
    setLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.frequency) {
      alert("Por favor completa todos los campos")
      return
    }

    try {
      const newReminder: Reminder = {
        id: Date.now().toString(),
        email: formData.email,
        frequency: formData.frequency,
        nextSend: new Date(),
        active: true,
      }

      const existingReminders = localStorage.getItem("reminders")
      const reminders: Reminder[] = existingReminders ? JSON.parse(existingReminders) : []
      reminders.push(newReminder)
      localStorage.setItem("reminders", JSON.stringify(reminders))

      alert("¡Recordatorio configurado correctamente!")
      setFormData({ email: "", frequency: "" })
      loadData()
    } catch (error) {
      console.error("Error adding reminder:", error)
      alert("No se pudo configurar el recordatorio")
    }
  }

  const handleDeleteReminder = (reminderId: string) => {
    try {
      const existingReminders = localStorage.getItem("reminders")
      if (existingReminders) {
        const reminders: Reminder[] = JSON.parse(existingReminders)
        const filteredReminders = reminders.filter((r) => r.id !== reminderId)
        localStorage.setItem("reminders", JSON.stringify(filteredReminders))
        loadData()
        alert("Recordatorio eliminado correctamente")
      }
    } catch (error) {
      console.error("Error deleting reminder:", error)
      alert("No se pudo eliminar el recordatorio")
    }
  }

  const getFrequencyText = (frequency: string) => {
    const frequencies: { [key: string]: string } = {
      daily: "Diario",
      weekly: "Semanal",
      monthly: "Mensual",
    }
    return frequencies[frequency] || frequency
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-orange-600 animate-pulse" />
          <p className="text-lg text-gray-600">Cargando recordatorios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Recordatorios de Recetas</h1>
            <p className="text-gray-600">Configura recordatorios para no olvidar registrar tus comidas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Reminder Form */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nuevo Recordatorio
              </CardTitle>
              <CardDescription>Configura recordatorios para motivarte a registrar nuevas recetas</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frecuencia</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="¿Con qué frecuencia?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                  <Mail className="h-4 w-4 mr-2" />
                  Configurar Recordatorio
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Reminders */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recordatorios Activos
              </CardTitle>
              <CardDescription>Gestiona tus recordatorios configurados</CardDescription>
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No tienes recordatorios configurados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">Recordatorio de Recetas</h4>
                        <p className="text-sm text-gray-600">{reminder.email}</p>
                        <p className="text-xs text-gray-500">Frecuencia: {getFrequencyText(reminder.frequency)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
      </div>
    </div>
  )
}
