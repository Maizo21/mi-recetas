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

interface Recipe {
  id: string
  name: string
  ingredients: string[]
  instructions: string
  prepTime: number
  servings: number
  createdAt: Date
}

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
      // Obtener recetas existentes
      const existingRecipes = localStorage.getItem("recipes")
      const recipes: Recipe[] = existingRecipes ? JSON.parse(existingRecipes) : []

      // Crear nueva receta
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        ingredients,
        instructions: formData.instructions.trim(),
        prepTime: Number.parseInt(formData.prepTime) || 0,
        servings: Number.parseInt(formData.servings) || 1,
        createdAt: new Date(),
      }

      // Agregar al inicio del array
      recipes.unshift(newRecipe)

      // Guardar en localStorage
      localStorage.setItem("recipes", JSON.stringify(recipes))

      alert("¡Receta guardada correctamente!")
      router.push("/")
    } catch (error) {
      console.error("Error saving recipe:", error)
      alert("No se pudo guardar la receta. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const previewIngredients = processIngredients(formData.ingredientsText)

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
          <div className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-800">Nueva Receta</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Información de la Receta</CardTitle>
                  <CardDescription>Completa los detalles de tu nueva receta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Recipe Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Receta *</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Pasta con tomate y albahaca"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="text-lg"
                    />
                  </div>

                  {/* Time and Servings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prepTime" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Tiempo (minutos)
                      </Label>
                      <Input
                        id="prepTime"
                        type="number"
                        placeholder="30"
                        value={formData.prepTime}
                        onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="servings" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Porciones
                      </Label>
                      <Input
                        id="servings"
                        type="number"
                        placeholder="4"
                        value={formData.servings}
                        onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="space-y-2">
                    <Label htmlFor="ingredients" className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Ingredientes *
                    </Label>
                    <div className="space-y-2">
                      <Textarea
                        id="ingredients"
                        placeholder={`Escribe cada ingrediente en una línea separada:

2 tazas de harina
1 huevo
1 taza de leche
1 cucharadita de sal
2 cucharadas de aceite
crema de leche`}
                        value={formData.ingredientsText}
                        onChange={(e) => setFormData({ ...formData, ingredientsText: e.target.value })}
                        rows={8}
                        required
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        💡 Tip: Escribe cada ingrediente en una línea separada. Ejemplo: "crema de leche" será un solo
                        ingrediente.
                      </p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instrucciones de Preparación *</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Describe paso a paso cómo preparar la receta...

1. Precalentar el horno a 180°C
2. En un bowl, mezclar la harina con la sal
3. Agregar el huevo y la leche gradualmente
4. Batir hasta obtener una mezcla homogénea
5. Cocinar en sartén caliente por 2-3 minutos de cada lado"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      rows={8}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      "Guardando..."
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Receta
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Preview Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-white sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Vista Previa</CardTitle>
                  <CardDescription>Así se verá tu receta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Recipe Name Preview */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{formData.name || "Nombre de la receta"}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
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
                  </div>

                  {/* Ingredients Preview */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Ingredientes ({previewIngredients.length})</h4>
                    {previewIngredients.length > 0 ? (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {previewIngredients.map((ingredient, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{ingredient}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Los ingredientes aparecerán aquí...</p>
                    )}
                  </div>

                  {/* Instructions Preview */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Preparación</h4>
                    {formData.instructions ? (
                      <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-6">
                          {formData.instructions}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Las instrucciones aparecerán aquí...</p>
                    )}
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
