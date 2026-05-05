// Configuração Firebase para Produção
// IMPORTANTE: Use variáveis de ambiente em produção!

// Configuração para desenvolvimento (mantenha as chaves atuais)
window.firebaseConfig = {
  apiKey: "AIzaSyB8vh5TxODwXXQIq49vkhtfCK6VLk9bMRs",
  authDomain: "app-pedidos-4656c.firebaseapp.com",
  projectId: "app-pedidos-4656c",
  storageBucket: "app-pedidos-4656c.firebasestorage.app",
  messagingSenderId: "979848418674",
  appId: "1:979848418674:web:c591005f8f262702cdb9eb"
};

// Detectar ambiente e inicializar Firebase
// Inicialização única do Firebase
let firebaseApp;
if (!window._firebaseApp) {
  console.log('🔥 Inicializando Firebase...');
  firebaseApp = firebase.initializeApp(window.firebaseConfig);
  window._firebaseApp = firebaseApp;
  console.log('✅ Firebase inicializado com sucesso');
} else {
  firebaseApp = window._firebaseApp;
  console.log('ℹ️ Firebase já estava inicializado');
}

// Configurar instâncias globais
window.auth = firebase.auth();
window.db = firebase.firestore();

console.log('🔑 Auth configurado:', !!window.auth);
console.log('🗄️ Firestore configurado:', !!window.db);