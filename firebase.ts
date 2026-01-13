
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDEQmMxO6LXAb1h--ubBCE9-RDU9a_elSw",
  authDomain: "agrorain-33555.firebaseapp.com",
  projectId: "agrorain-33555", // Removido o "S" extra que estava no início
  storageBucket: "agrorain-33555.firebasestorage.app",
  messagingSenderId: "13192373504",
  appId: "1:13192373504:web:3fa49160648e950718bfe5"
};

// Inicializa o Firebase diretamente
let db: Firestore;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase inicializado com sucesso para o projeto:", firebaseConfig.projectId);
} catch (error) {
  console.error("Erro fatal ao inicializar Firebase:", error);
  throw error;
}

export { db };
