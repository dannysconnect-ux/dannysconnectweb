// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBu1qn6Kiplii4KiP6tVOnEyrv6U_zDXU4",
  authDomain: "dannysconnect-11381.firebaseapp.com",
  projectId: "dannysconnect-11381",
  storageBucket: "dannysconnect-11381.firebasestorage.app",
  messagingSenderId: "1028267746236",
  appId: "1:1028267746236:web:a7ec484d3e6f256dec41b9",
  measurementId: "G-L6T3N0PXD9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);