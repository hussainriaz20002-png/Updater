import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  // @ts-ignore
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPr5Vmrm8MkRFx7P0NOGsxS5NdC0tO4qk",
  authDomain: "updater-5a872.firebaseapp.com",
  projectId: "updater-5a872",
  storageBucket: "updater-5a872.firebasestorage.app",
  messagingSenderId: "162490579780",
  appId: "1:162490579780:web:78371df526bea381b4b511",
  measurementId: "G-LPDB0W9RMB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
