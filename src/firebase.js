import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACLArNFeFgcN3DLx_N___pnjiMMP9874Q",
  authDomain: "musafirwords-9b2ce.firebaseapp.com",
  projectId: "musafirwords-9b2ce",
  storageBucket: "musafirwords-9b2ce.firebasestorage.app",
  messagingSenderId: "544456697959",
  appId: "1:544456697959:web:3357739efaf20945420cc2",
  measurementId: "G-HXF4EB7W4S",
};

const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);

// Analytics
export const analytics = getAnalytics(app);

export default app;