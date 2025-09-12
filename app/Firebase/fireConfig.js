// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your Firebase configuration (replace with actual credentials)
const firebaseConfig = {
  apiKey: "AIzaSyBsTH3zxkJP8be3yZwVp3DihBuWZRik4rw",
  authDomain: "binance-mate-update.firebaseapp.com",
  projectId: "binance-mate-update",
  storageBucket: "binance-mate-update.firebasestorage.app",
  messagingSenderId: "784625377387",
  appId: "1:784625377387:web:40cfe9d4cd7b6a78cb912e",
  measurementId: "G-SBM925HD9S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { db, auth, googleProvider };
