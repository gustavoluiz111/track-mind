import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEknmXSi8eUm15FGvZYjKk_5yNCXoC1Yw",
  authDomain: "salesss-ced73.firebaseapp.com",
  databaseURL: "https://salesss-ced73-default-rtdb.firebaseio.com",
  projectId: "salesss-ced73",
  storageBucket: "salesss-ced73.firebasestorage.app",
  messagingSenderId: "380358878642",
  appId: "1:380358878642:web:f44a8d0ab7262bbca7b0ab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
