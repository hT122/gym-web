import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Cambio importante
import { getAuth } from "firebase/auth";           // Cambio importante

const firebaseConfig = {
  apiKey: "AIzaSyAQ7UbB4QeovI9EBfrwLxGfXc1wxIOpcX4",
  authDomain: "fantasy-gym-league.firebaseapp.com",
  projectId: "fantasy-gym-league",
  storageBucket: "fantasy-gym-league.firebasestorage.app",
  messagingSenderId: "801830266251",
  appId: "1:801830266251:web:595d301f37e8698ea73b8e",
  measurementId: "G-N5F78LEJZ"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas para usarlas en el resto de la web
export const db = getFirestore(app); // Esta es tu base de datos
export const auth = getAuth(app);    // Este es tu sistema de usuarios