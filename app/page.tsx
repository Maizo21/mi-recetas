"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Clock, ChefHat, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { db, getRecipes, type Recipe } from "@/lib/firebase"

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [useFirebase, setUseFirebase] = useState(true)
  const [searchIngredients, setSearchIngredients] = useState<string[]>([])

  useEffect(() => {
    loadRecipes()
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      searchByIngredients(searchTerm)
    } else {
      setFilteredRecipes(recipes)
      setSearchIngredients([])
    }
  }, [searchTerm, recipes])

  const loadRecipes = async () => {
    if (!db) {
      console.error("❌ Firebase no está disponible")
      setUseFirebase(false)
      setLoading(false)
      return
    }

    try {
      console.log("🔥 Cargando recetas desde Firebase...")
      const recipesData = await getRecipes()
      setRecipes(recipesData)
      setFilteredRecipes(recipesData)
      setUseFirebase(true)
      console.log(`✅ Cargadas ${recipesData.length} recetas desde Firebase`)
    } catch (error) {
      console.error("❌ Error cargando desde Firebase:", error)
      setUseFirebase(false)
    } finally {
      setLoading(false)
    }
  }

  const searchByIngredients = async (searchText: string) => {
    if (!db || !useFirebase) {
      console.log("❌ Firebase no disponible para búsqueda")
      return
    }

    try {
      // Procesar múltiples ingredientes separados por comas
      const ingredients = searchText
        .split(",")
        .map((ing) => ing.trim().toLowerCase())
        .filter((ing) => ing.length > 0)

      setSearchIngredients(ingredients)

      console.log(`🔍 Buscando ingredientes: [${ingredients.join(", ")}] en Firebase...`)

      // Filtrar recetas que contengan TODOS los ingredientes buscados
      const results = recipes.filter((recipe) => {
        const recipeIngredients = recipe.Ingredientes.toLowerCase()
        return ingredients.every((searchIngredient) => recipeIngredients.includes(searchIngredient))
      })

      setFilteredRecipes(results)
      console.log(`✅ Encontradas ${results.length} recetas con todos los ingredientes`)
    } catch (error) {
      console.error("❌ Error buscando en Firebase:", error)
      setFilteredRecipes([])
    }
  }

  const removeSearchIngredient = (ingredientToRemove: string) => {
    const newIngredients = searchIngredients.filter((ing) => ing !== ingredientToRemove)
    if (newIngredients.length === 0) {
      setSearchTerm("")
      setSearchIngredients([])
      setFilteredRecipes(recipes)
    } else {
      const newSearchTerm = newIngredients.join(", ")
      setSearchTerm(newSearchTerm)
    }
  }

  // Función para convertir string de ingredientes a array para mostrar
  const getIngredientsArray = (ingredientsString: string): string[] => {
    return ingredientsString
      .split(",")
      .map((ing) => ing.trim())
      .filter((ing) => ing.length > 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
        <div className="text-center">
          <ChefHat className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-orange-600 animate-pulse" />
          <p className="text-base sm:text-lg text-gray-600">Conectando con Firebase...</p>
          <p className="text-sm text-gray-500 mt-2">Cargando tus recetas...</p>
        </div>
      </div>
    )
  }

  if (!useFirebase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
        <div className="text-center">
          <ChefHat className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-red-400" />
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
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Libro de Recetas</h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-lg px-4">Organiza tus recetas favoritas y descubre qué cocinar</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs sm:text-sm text-green-600 font-medium">
              Conectado a Firebase - {recipes.length} recetas disponibles
            </p>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por ingredientes (ej: pan, queso, tomate...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 sm:h-12 text-sm sm:text-lg"
            />
          </div>

          {/* Search Ingredients Tags */}
          {searchIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchIngredients.map((ingredient, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs flex items-center gap-1 bg-orange-100 text-orange-800 hover:bg-orange-200"
                >
                  {ingredient}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-orange-900"
                    onClick={() => removeSearchIngredient(ingredient)}
                  />
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild size="default" className="bg-orange-600 hover:bg-orange-700 h-11 sm:h-12">
              <Link href="/nueva-receta">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Receta
              </Link>
            </Button>
            <Button asChild variant="outline" size="default" className="h-11 sm:h-12">
              <Link href="/recordatorios">
                <Clock className="h-4 w-4 mr-2" />
                Recordatorios
              </Link>
            </Button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-4 sm:mb-6 px-2">
            <p className="text-gray-600 text-sm sm:text-base">
              {filteredRecipes.length > 0 ? (
                <>
                  Encontradas <span className="font-semibold">{filteredRecipes.length}</span> receta(s) con{" "}
                  <span className="font-semibold">todos</span> los ingredientes:{" "}
                  <span className="text-orange-600">{searchIngredients.join(", ")}</span>
                </>
              ) : (
                <>
                  No se encontraron recetas con <span className="font-semibold">todos</span> los ingredientes:{" "}
                  <span className="text-orange-600">{searchIngredients.join(", ")}</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <ChefHat className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? "No se encontraron recetas" : "No hay recetas en Firebase"}
            </h3>
            <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
              {searchTerm
                ? "Intenta buscar con otros ingredientes o menos ingredientes"
                : "¡Comienza agregando tu primera receta a Firebase!"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredRecipes.map((recipe) => {
              const ingredientsArray = getIngredientsArray(recipe.Ingredientes)
              return (
                <Card
                  key={recipe.id}
                  className="hover:shadow-lg transition-shadow duration-200 bg-white cursor-pointer border-l-4 border-l-green-500"
                  onClick={() => {
                    setSelectedRecipe(recipe)
                    setIsDialogOpen(true)
                  }}
                >
                  <CardHeader className="pb-3 sm:pb-6">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg sm:text-xl text-gray-800 leading-tight">{recipe.Receta}</CardTitle>
                      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded ml-2 flex-shrink-0">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Firebase
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                      {recipe.prepTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          {recipe.prepTime} min
                        </span>
                      )}
                      {recipe.servings && <span>{recipe.servings} porciones</span>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="mb-3 sm:mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Ingredientes:</h4>
                      <div className="flex flex-wrap gap-1">
                        {ingredientsArray.slice(0, 4).map((ingredient, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                        {ingredientsArray.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{ingredientsArray.length - 4} más
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Preparación:</h4>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3">
                        {recipe.Preparacion}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Recipe Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto mx-2 sm:mx-auto">
          {selectedRecipe && (
            <>
              <DialogHeader className="pb-4">
                <div className="flex items-start gap-2">
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight flex-1">
                    {selectedRecipe.Receta}
                  </DialogTitle>
                  <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Firebase
                  </div>
                </div>
                <DialogDescription className="flex items-center gap-3 sm:gap-4 text-sm">
                  {selectedRecipe.prepTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedRecipe.prepTime} min
                    </span>
                  )}
                  {selectedRecipe.servings && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {selectedRecipe.servings} porciones
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-6">
                {/* Ingredients */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Ingredientes</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {getIngredientsArray(selectedRecipe.Ingredientes).map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm sm:text-base">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Preparación</h3>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {selectedRecipe.Preparacion}
                    </p>
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
