import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCXgu1s8FlpTEKc9CnXMerLjABafNrJdUA",
    authDomain: "aquesa-a2f44.firebaseapp.com",
    projectId: "aquesa-a2f44",
    storageBucket: "aquesa-a2f44.firebasestorage.app",
    messagingSenderId: "911265864370",
    appId: "1:911265864370:web:bd39ed1358067e4b54c7ab"
  };
  
initializeApp(firebaseConfig);

const auth = getAuth();
const provider = new GoogleAuthProvider();

export {auth, provider}