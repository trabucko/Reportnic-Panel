import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC7j7F6nDf54wiiloUWP854fs5XoQIbcCk",
  authDomain: "reportnic-9942b.firebaseapp.com",
  projectId: "reportnic-9942b",
  storageBucket: "reportnic-9942b.firebasestorage.app",
  messagingSenderId: "243381277021",
  appId: "1:243381277021:web:29f9279b48ca1d100f58b4",
  measurementId: "G-99743VE1DS",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
