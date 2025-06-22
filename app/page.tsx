"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Clock, ChefHat, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Recipe {
  id: string
  name: string
  ingredients: string[]
  instructions: string
  prepTime: number
  servings: number
  createdAt: Date
}

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadRecipes()
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      searchByIngredient(searchTerm)
    } else {
      setFilteredRecipes(recipes)
    }
  }, [searchTerm, recipes])

  const loadRecipes = () => {
    // Cargar recetas desde localStorage
    const savedRecipes = localStorage.getItem("recipes")
    if (savedRecipes) {
      const parsedRecipes = JSON.parse(savedRecipes).map((recipe: any) => ({
        ...recipe,
        createdAt: new Date(recipe.createdAt),
      }))
      const sortedRecipes = parsedRecipes.sort(
        (a: Recipe, b: Recipe) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setRecipes(sortedRecipes)
      setFilteredRecipes(sortedRecipes)
    } else {
      // Recetas de ejemplo
      const exampleRecipes: Recipe[] = [
        {
          id: "1",
          name: "Pasta con Tomate",
          ingredients: ["pasta", "tomate", "ajo", "aceite de oliva", "albahaca"],
          instructions:
            "1. Hervir la pasta\n2. Sofreír ajo en aceite\n3. Agregar tomate\n4. Mezclar con pasta\n5. Servir con albahaca",
          prepTime: 20,
          servings: 4,
          createdAt: new Date(),
        },
        {
          id: "2",
          name: "Ensalada César",
          ingredients: ["lechuga", "pollo", "queso parmesano", "croutons", "aderezo césar"],
          instructions:
            "1. Lavar y cortar lechuga\n2. Cocinar pollo a la plancha\n3. Mezclar todos los ingredientes\n4. Agregar aderezo\n5. Servir inmediatamente",
          prepTime: 15,
          servings: 2,
          createdAt: new Date(Date.now() - 86400000), // 1 día atrás
        },
      ]
      setRecipes(exampleRecipes)
      setFilteredRecipes(exampleRecipes)
      localStorage.setItem("recipes", JSON.stringify(exampleRecipes))
    }
    setLoading(false)
  }

  const searchByIngredient = (ingredient: string) => {
    const results = recipes.filter((recipe) =>
      recipe.ingredients.some((ing) => ing.toLowerCase().includes(ingredient.toLowerCase())),
    )
    setFilteredRecipes(results)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 mx-auto mb-4 text-orange-600 animate-pulse" />
          <p className="text-lg text-gray-600">Cargando recetas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-800">Mi Libro de Recetas</h1>
          </div>
          <p className="text-gray-600 text-lg">Organiza tus recetas favoritas y descubre qué cocinar</p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por ingrediente (ej: tomate, cebolla, pollo...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          <div className="flex gap-2">
            <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
              <Link href="/nueva-receta">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Receta
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/recordatorios">
                <Clock className="h-4 w-4 mr-2" />
                Recordatorios
              </Link>
            </Button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredRecipes.length > 0
                ? `Encontradas ${filteredRecipes.length} receta(s) con "${searchTerm}"`
                : `No se encontraron recetas con "${searchTerm}"`}
            </p>
          </div>
        )}

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? "No se encontraron recetas" : "No hay recetas guardadas"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? "Intenta buscar con otro ingrediente" : "¡Comienza agregando tu primera receta!"}
            </p>
            {!searchTerm && (
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <Link href="/nueva-receta">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primera Receta
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="hover:shadow-lg transition-shadow duration-200 bg-white cursor-pointer"
                onClick={() => {
                  setSelectedRecipe(recipe)
                  setIsDialogOpen(true)
                }}
              >
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">{recipe.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.prepTime} min
                    </span>
                    <span>{recipe.servings} porciones</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Ingredientes:</h4>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients.slice(0, 6).map((ingredient, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                      {recipe.ingredients.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{recipe.ingredients.length - 6} más
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Preparación:</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">{recipe.instructions}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800">{selectedRecipe.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedRecipe.prepTime} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedRecipe.servings} porciones
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Ingredients */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Ingredientes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Preparación</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedRecipe.instructions}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
