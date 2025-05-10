// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANapByXBl_NJ2MtJb89z653bwHY9kdu5Y",
  authDomain: "zaffaf-fcb1c.firebaseapp.com",
  projectId: "zaffaf-fcb1c",
  storageBucket: "zaffaf-fcb1c.firebasestorage.app",
  messagingSenderId: "292921691685",
  appId: "1:292921691685:web:0672dd0e7865843e3bb9cc",
  measurementId: "G-CB2KY8VE96"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics and Auth
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, analytics, db }; 