import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

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
export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);