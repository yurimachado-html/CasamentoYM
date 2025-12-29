import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDwKcOp0Zc1UZAqHXOFY7pAgZ8psHxvUMA",
  authDomain: "mesas-casamento.firebaseapp.com",
  projectId: "mesas-casamento",
  storageBucket: "mesas-casamento.appspot.com",
  messagingSenderId: "1059652003536",
  appId: "1:1059652003536:web:2cd36d5d489f80f359e0d5"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
