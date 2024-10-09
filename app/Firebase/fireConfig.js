// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from '@firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref } from 'firebase/storage'; // Import getStorage and ref

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5kNczOeKwp52ZlcjsSM9mWXHp-YRyMuc",
  authDomain: "nloop-d674e.firebaseapp.com",
  projectId: "nloop-d674e",
  storageBucket: "nloop-d674e.appspot.com",
  messagingSenderId: "64907955295",
  appId: "1:64907955295:web:3bd2736773fb74a19edfea",
  measurementId: "G-376488B2VH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage
const storageRef = ref(storage); // Get a reference to the root of the default Firebase Storage bucket

export { app, auth, firestore, storageRef }; // Export the initialized storageRef
