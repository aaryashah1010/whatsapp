import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, updateDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "whatsappclone-e0e60.firebaseapp.com",
  projectId: "whatsappclone-e0e60",
  storageBucket: "whatsappclone-e0e60.appspot.com",
  messagingSenderId: "224591342750",
  appId: "1:224591342750:web:dd1ff1d8e52ae9e7d45f8f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
