import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSuAV4_ZJLVgy-1VJAXRPaiSnU3KSIMl8",
  authDomain: "acegrader-329eb.firebaseapp.com",
  projectId: "acegrader-329eb",
  storageBucket: "acegrader-329eb.firebasestorage.app",
  messagingSenderId: "422710721022",
  appId: "1:422710721022:web:2da28d54558884d8daa8af",
  measurementId: "G-8SFZJ0EK74"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };