const firebaseConfig = {
  apiKey: "AIzaSyCilME1Fv3Sjb6YBIBSZT3zZshCedEL9LM",
  authDomain: "tienda-mimo.firebaseapp.com",
  projectId: "tienda-mimo",
  storageBucket: "tienda-mimo.firebasestorage.app",
  messagingSenderId: "451218117227",
  appId: "1:451218117227:web:96a87214151a03db63172e",
  measurementId: "G-DQWL3HL2VG"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Evitar errores al inicializar Analytics en protocolo local file:// o bloqueadores de cookies
let analytics;
try {
  if (location.protocol !== 'file:') {
    analytics = firebase.analytics();
  }
} catch (e) {
  console.warn("Analytics no pudo inicializarse:", e);
}
