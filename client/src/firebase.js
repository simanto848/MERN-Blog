// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-efd49.firebaseapp.com",
  projectId: "mern-blog-efd49",
  storageBucket: "mern-blog-efd49.appspot.com",
  messagingSenderId: "498135301653",
  appId: "1:498135301653:web:60f24eabbc91ca483b581c",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
