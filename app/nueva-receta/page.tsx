"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Clock, Users, ChefHat, List } from "lucide-react"
import Link from "next/link"
import { db, addRecipe, convertLocalToFirebase } from "@/lib/firebase"

export default function NewRecipePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    prepTime: "",
    servings: "",
    instructions: "",
    ingredientsText: "",
  })

  const processIngredients = (text: string): string[] => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const ingredients = processIngredients(formData.ingredientsText)

    if (!formData.name.trim() || ingredients.length === 0 || !formData.instructions.trim()) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    setLoading(true)

    try {
      const newRecipe = {
        name: formData.name.trim(),
        ingredients,
        instructions: formData.instructions.trim(),
        prepTime: Number.parseInt(formData.prepTime) || 0,
        servings: Number.parseInt(formData.servings) || 1,
      }

      if (db) {
        console.log("💾 Guardando en Firebase...")
        const firebaseRecipe = convertLocalToFirebase(newRecipe)
        await addRecipe(firebaseRecipe)
        console.log("✅ Receta guardada en Firebase correctamente!")
        alert("¡Receta guardada en Firebase correctamente! 👨🏻‍🍳👩🏻‍🍳")
        router.push("/")
      } else {
        throw new Error("Firebase not available")
      }
    } catch (error) {
      console.error("❌ Error guardando en Firebase:", error)
      alert("Error al guardar en Firebase. Verifica tu conexión.")
    } finally {
      setLoading(false)
    }
  }

  const previewIngredients = processIngredients(formData.ingredientsText)

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
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Nueva Receta</h1>
          </div>
          {db ? (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Se guardará en Firebase
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
              ❌ Firebase no disponible
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-l-4 border-l-green-500">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    Información de la Receta
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Se guardará en Firebase"></div>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Completa los detalles de tu nueva receta para Firebase
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Recipe Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm sm:text-base">
                      Nombre de la Receta *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ej: Pan con huevo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="text-base sm:text-lg h-11 sm:h-12"
                    />
                  </div>

                  {/* Time and Servings */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prepTime" className="flex items-center gap-2 text-sm sm:text-base">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        Tiempo (min)
                      </Label>
                      <Input
                        id="prepTime"
                        type="number"
                        placeholder="30"
                        value={formData.prepTime}
                        onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                        className="h-11 sm:h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="servings" className="flex items-center gap-2 text-sm sm:text-base">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        Porciones
                      </Label>
                      <Input
                        id="servings"
                        type="number"
                        placeholder="4"
                        value={formData.servings}
                        onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                        className="h-11 sm:h-12"
                      />
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="space-y-2">
                    <Label htmlFor="ingredients" className="flex items-center gap-2 text-sm sm:text-base">
                      <List className="h-3 w-3 sm:h-4 sm:w-4" />
                      Ingredientes *
                    </Label>
                    <div className="space-y-2">
                      <Textarea
                        id="ingredients"
                        placeholder={`Escribe cada ingrediente en una línea separada:

Pan
Huevo
Sal
Aceite`}
                        value={formData.ingredientsText}
                        onChange={(e) => setFormData({ ...formData, ingredientsText: e.target.value })}
                        rows={6}
                        required
                        className="font-mono text-sm resize-none"
                      />
                      <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        🔥 Se guardarán en Firebase como: "{previewIngredients.join(", ")}"
                      </p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2">
                    <Label htmlFor="instructions" className="text-sm sm:text-base">
                      Instrucciones de Preparación *
                    </Label>
                    <Textarea
                      id="instructions"
                      placeholder="Describe paso a paso cómo preparar la receta...

Cocer el huevo, meterlo en el pan"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      rows={6}
                      required
                      className="resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 h-11 sm:h-12"
                    size="lg"
                    disabled={loading || !db}
                  >
                    {loading ? (
                      "Guardando en Firebase..."
                    ) : !db ? (
                      "Firebase no disponible"
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar en Firebase
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Preview Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-white sticky top-4">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base sm:text-lg">Vista Previa Firebase</CardTitle>
                  <CardDescription className="text-sm">Estructura que se guardará en tu base de datos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Firebase Preview */}
                  <div className="border border-green-200 bg-green-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                      🔥 Documento Firebase
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div>
                        <strong className="text-green-700">Receta:</strong>
                        <p className="text-gray-700 bg-white p-2 rounded mt-1 text-xs sm:text-sm">
                          {formData.name || "Nombre de la receta..."}
                        </p>
                      </div>
                      <div>
                        <strong className="text-green-700">Ingredientes:</strong>
                        <p className="text-gray-700 bg-white p-2 rounded mt-1 text-xs sm:text-sm">
                          {previewIngredients.join(", ") || "Ingredientes separados por comas..."}
                        </p>
                      </div>
                      <div>
                        <strong className="text-green-700">Preparacion:</strong>
                        <p className="text-gray-700 bg-white p-2 rounded mt-1 max-h-16 sm:max-h-20 overflow-y-auto text-xs sm:text-sm">
                          {formData.instructions || "Instrucciones de preparación..."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Regular Preview */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Vista de Usuario</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">
                        {formData.name || "Nombre de la receta"}
                      </h3>
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                        {formData.prepTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formData.prepTime} min
                          </span>
                        )}
                        {formData.servings && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {formData.servings} porciones
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{previewIngredients.length} ingrediente(s) • Firebase</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
