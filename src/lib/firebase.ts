import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCqSJ_ReLYeRjChAaTT6Jt5_M9OtD6MYiI",
  authDomain: "mess-management-44381.firebaseapp.com",
  projectId: "mess-management-44381",
  storageBucket: "mess-management-44381.firebasestorage.app",
  messagingSenderId: "700518943021",
  appId: "1:700518943021:web:9ec98f8ceb7090a8faeba4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);