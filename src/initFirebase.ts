// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "@firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyAGCuAHu8052E705L4aYCK-aqHPmtMJCgA",
  authDomain: "humanitarian-help.firebaseapp.com",
  projectId: "humanitarian-help",
  storageBucket: "humanitarian-help.appspot.com",
  messagingSenderId: "1098915448468",
  appId: "1:1098915448468:web:a6056096cd299fa9ab9681",
  measurementId: "G-807K7E6TB9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app)

export default app;
