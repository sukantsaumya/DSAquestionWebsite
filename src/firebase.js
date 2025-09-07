// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANe3oJcdSIHJt-cq5E2RgxXi_BxSiQGKA",
  authDomain: "dsa-tracker-c3ee7.firebaseapp.com",
  projectId: "dsa-tracker-c3ee7",
  storageBucket: "dsa-tracker-c3ee7.appspot.com",
  messagingSenderId: "991575019516",
  appId: "1:991575019516:web:ff60079e1d746577806c79",
  measurementId: "G-DC2YY1FQ1D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll need
export const auth = getAuth(app);
export const db = getFirestore(app);