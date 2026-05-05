// Configuração Firebase para Produção
// IMPORTANTE: Use variáveis de ambiente em produção!

// Configuração para desenvolvimento (mantenha as chaves atuais)
window.firebaseConfig = {
  apiKey: "AIzaSyAogGkN5N24Puss4-kF9Z6npPYyEzVei3M",
  authDomain: "studio-5526632052-23813.firebaseapp.com",
  projectId: "studio-5526632052-23813",
  storageBucket: "studio-5526632052-23813.firebasestorage.app",
  messagingSenderId: "251931417472",
  appId: "1:251931417472:web:4b955052a184d114f57f65"
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