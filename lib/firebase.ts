import { initializeApp, getApps } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA0XoOMeV7KK2CQzhWXFXaKJGmJaDj0KXA",
  authDomain: "mi-recetario-9216a.firebaseapp.com",
  projectId: "mi-recetario-9216a",
  storageBucket: "mi-recetario-9216a.firebasestorage.app",
  messagingSenderId: "273759926492",
  appId: "1:273759926492:web:e280662d531aa439d91c19",
}

// Inicializar Firebase solo en el cliente
let app
let db

if (typeof window !== "undefined") {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    db = getFirestore(app)
  } catch (error) {
    console.error("Error initializing Firebase:", error)
  }
}

export { db }

// Interfaces adaptadas a tu estructura de Firebase
export interface Recipe {
  id?: string
  Receta: string // Nombre de la receta
  Ingredientes: string // Ingredientes como string separado por comas
  Preparacion: string // Instrucciones de preparación
  prepTime?: number // Opcional para compatibilidad
  servings?: number // Opcional para compatibilidad
  createdAt?: Date
}

// Update the Reminder interface to match the new Firebase structure
export interface Reminder {
  id?: string
  Nombre: string // Name field to match Firebase
  correo: string // Email field to match Firebase
  Periodicidad: string // Frequency field to match Firebase
  createdAt?: Date
  active?: boolean
}

// Funciones para trabajar con Firebase
export const getRecipes = async (): Promise<Recipe[]> => {
  if (!db) throw new Error("Firebase not initialized")

  try {
    const querySnapshot = await getDocs(collection(db, "comida"))
    const recipes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Recipe[]

    // Ordenar por fecha de creación (más recientes primero)
    return recipes.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
  } catch (error) {
    console.error("Error getting recipes from Firebase:", error)
    throw error
  }
}

export const addRecipe = async (recipe: {
  Receta: string
  Ingredientes: string
  Preparacion: string
}): Promise<void> => {
  if (!db) throw new Error("Firebase not initialized")

  try {
    await addDoc(collection(db, "comida"), {
      ...recipe,
      createdAt: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error adding recipe to Firebase:", error)
    throw error
  }
}

export const searchRecipesByIngredient = async (ingredient: string): Promise<Recipe[]> => {
  if (!db) throw new Error("Firebase not initialized")

  try {
    const recipes = await getRecipes()
    return recipes.filter((recipe) => recipe.Ingredientes.toLowerCase().includes(ingredient.toLowerCase()))
  } catch (error) {
    console.error("Error searching recipes:", error)
    throw error
  }
}

// Update the reminder functions to work with "usuarios" collection
export const getReminders = async (): Promise<Reminder[]> => {
  if (!db) throw new Error("Firebase not initialized")

  try {
    const querySnapshot = await getDocs(collection(db, "usuarios"))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Reminder[]
  } catch (error) {
    console.error("Error getting reminders:", error)
    throw error
  }
}

export const addReminder = async (reminder: {
  Nombre: string
  correo: string
  Periodicidad: string
}): Promise<void> => {
  if (!db) throw new Error("Firebase not initialized")

  try {
    await addDoc(collection(db, "usuarios"), {
      ...reminder,
      createdAt: Timestamp.now(),
      active: true,
    })
  } catch (error) {
    console.error("Error adding reminder:", error)
    throw error
  }
}

export const deleteReminder = async (reminderId: string): Promise<void> => {
  if (!db) throw new Error("Firebase not initialized")

  try {
    await deleteDoc(doc(db, "usuarios", reminderId))
  } catch (error) {
    console.error("Error deleting reminder:", error)
    throw error
  }
}

// Funciones de utilidad para convertir entre formatos
export const convertFirebaseToLocal = (firebaseRecipe: Recipe): Recipe => {
  return {
    id: firebaseRecipe.id,
    Receta: firebaseRecipe.Receta,
    Ingredientes: firebaseRecipe.Ingredientes,
    Preparacion: firebaseRecipe.Preparacion,
    prepTime: firebaseRecipe.prepTime || 0,
    servings: firebaseRecipe.servings || 1,
    createdAt: firebaseRecipe.createdAt,
  }
}

export const convertLocalToFirebase = (localRecipe: {
  name: string
  ingredients: string[]
  instructions: string
  prepTime: number
  servings: number
}) => {
  return {
    Receta: localRecipe.name,
    Ingredientes: localRecipe.ingredients.join(", "),
    Preparacion: localRecipe.instructions,
  }
}
