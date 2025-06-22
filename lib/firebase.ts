;/import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app
"
import { getFirestore, type Firestore } from "firebase/firestore"

// Inicializar (o reutilizar) la app de Firebase
let firebaseApp: FirebaseApp
if (getApps().length) {
  firebaseApp = getApp()
} else {
  firebaseApp = initializeApp({
    apiKey: "AIzaSyA0XoOMeV7KK2CQzhWXFXaKJGmJaDj0KXA",
    authDomain: "mi-recetario-9216a.firebaseapp.com",
    projectId: "mi-recetario-9216a",
    storageBucket: "mi-recetario-9216a.appspot.com",
    messagingSenderId: "273759926492",
    appId: "1:273759926492:web:e280662d531aa439d91c19",
  })
}

// Instancia única de Firestore
const db: Firestore = getFirestore(firebaseApp)
