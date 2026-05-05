// Configuração Firebase para Produção
// IMPORTANTE: Use variáveis de ambiente em produção!

// Configuração para desenvolvimento (mantenha as chaves atuais)
const firebaseConfigDev = {
  apiKey: "AIzaSyB8vh5TxODwXXQIq49vkhtfCK6VLk9bMRs",
  authDomain: "app-pedidos-4656c.firebaseapp.com",
  projectId: "app-pedidos-4656c",
  storageBucket: "app-pedidos-4656c.firebasestorage.app",
  messagingSenderId: "979848418674",
  appId: "1:979848418674:web:c591005f8f262702cdb9eb"
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