// Configuração Firebase para Produção
// IMPORTANTE: Use variáveis de ambiente em produção!

// Configuração para desenvolvimento (mantenha as chaves atuais)
const firebaseConfigDev = {
  apiKey: "AIzaSyAogGkN5N24Puss4-kF9Z6npPYyEzVei3M",
  authDomain: "studio-5526632052-23813.firebaseapp.com",
  projectId: "studio-5526632052-23813",
  storageBucket: "studio-5526632052-23813.firebasestorage.app",
  messagingSenderId: "251931417472",
  appId: "1:251931417472:web:4b955052a184d114f57f65"
};

// Configuração para produção (substitua pelos valores do seu projeto de produção)
const firebaseConfigProd = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "your-production-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-production-project",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-project.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "your-app-id"
};

// Detectar ambiente
const isProduction = process.env.NODE_ENV === 'production' || 
                    window.location.hostname !== 'localhost';

// Exportar configuração baseada no ambiente
export const firebaseConfig = isProduction ? firebaseConfigProd : firebaseConfigDev;

// Log de segurança (remover em produção final)
if (!isProduction) {
  console.log('🔧 Firebase configurado para DESENVOLVIMENTO');
} else {
  console.log('🔒 Firebase configurado para PRODUÇÃO');
}