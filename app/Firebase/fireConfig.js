// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Add this line

// Your Firebase configuration (replace with actual credentials)
const firebaseConfig = {
  apiKey: "AIzaSyBP7yVKtOa7EQtq3OxgWCytSC_naDVHhCw",
  authDomain: "binance-mate.firebaseapp.com",
  projectId: "binance-mate",
  storageBucket: "binance-mate.appspot.com",
  messagingSenderId: "870359730172",
  appId: "1:870359730172:web:2e9878fb813166c5f01479"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
const auth = getAuth(app); // Make sure to initialize auth

export { db, auth };
