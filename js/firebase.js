// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// A configuração fornecida pelo Firebase Console para seu projeto
const firebaseConfig = {
  apiKey: "AIzaSyCb8JmXwlzSyHRCHbbLZRMXVfMXDwIJOV4",
  authDomain: "teste-a5d7e.firebaseapp.com",
  projectId: "teste-a5d7e",
  storageBucket: "teste-a5d7e.appspot.com",
  messagingSenderId: "60982122182",
  appId: "1:60982122182:web:a24c5cbec9e63d6efaa9c7",
  measurementId: "G-P3RW7FNTQF"
};

// Inicializa o app Firebase com as configurações acima
const app = initializeApp(firebaseConfig);

// Exporta instâncias do Auth e do Firestore
export const auth = getAuth(app);
export const db   = getFirestore(app);
