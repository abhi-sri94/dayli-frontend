import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Replace with your Firebase project configuration
// You can find this in your Firebase Console: Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyATjMx2HbyAp1Z0XtLAZ-cNT-K6xyobR_I",
  authDomain: "dalyi-delivery.firebaseapp.com",
  projectId: "dalyi-delivery",
  storageBucket: "dalyi-delivery.firebasestorage.app",
  messagingSenderId: "786855902799",
  appId: "1:786855902799:web:3e7f23979ba7fd31df743a",
  measurementId: "G-TC7FG9HSX6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
