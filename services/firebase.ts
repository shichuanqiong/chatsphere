import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getDatabase, ref, set, onValue, off, push, remove } from 'firebase/database';

// Firebase配置（从环境变量获取）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCKog0F-iSoETRwdK_puwR6Xfd0gflrXiM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chatsphere-28c89.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chatsphere-28c89",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chatsphere-28c89.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "918885541055",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:918885541055:web:54a48c173c4b81f219520a"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDB = getDatabase(app);

export default app;
