// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOKNHIDGLVgjKYOUBorOyIt8offbIcxwg",
  authDomain: "lagoshelprent.firebaseapp.com",
  projectId: "lagoshelprent",
  storageBucket: "lagoshelprent.firebasestorage.app",
  messagingSenderId: "127345111804",
  appId: "1:127345111804:web:f56392367f6b05372f1d79",
  measurementId: "G-9GS7FPK4SH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider();

export {auth, googleProvider};

