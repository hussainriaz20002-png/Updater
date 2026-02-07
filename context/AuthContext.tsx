import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";

interface AuthContextType {
  user: User | null;
  userData: any;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  error: string | null;
  resetError: () => void;
  refreshUserData: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map Firebase errors to user-friendly messages
  const mapAuthError = (err: any) => {
    console.log("Firebase Auth Error:", err.code, err.message);
    switch (err.code) {
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-disabled":
        return "This user account has been disabled.";
      case "auth/user-not-found":
        return "No user found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "This email is already registered.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-credential":
        return "Invalid credentials provided.";
      case "auth/requires-recent-login":
        return "Please log in again to delete your account.";
      default:
        return "An authentication error occurred. Please try again.";
    }
  };

  const fetchUserData = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        // Also sync with AsyncStorage for offline/faster access if needed
        if (data.name) await AsyncStorage.setItem("user_name", data.name);
        if (data.role) await AsyncStorage.setItem("userRole", data.role);
        if (data.bio) await AsyncStorage.setItem("user_bio", data.bio);
        if (data.photoURL)
          await AsyncStorage.setItem("user_image", data.photoURL);
      } else {
        console.log("No such user document!");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    // setLoading(true); // Don't trigger global loading to avoid unmounting layout
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      const friendlyMsg = mapAuthError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    } finally {
      // setLoading(false);
    }
  };

  const signUp = async (email: string, pass: string) => {
    // setLoading(true);
    setError(null);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        pass,
      );
      return credential;
    } catch (err: any) {
      const friendlyMsg = mapAuthError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    } finally {
      // setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    // We don't set global loading here because we want the UI to handle it (e.g. inside the button)
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      setError(mapAuthError(e));
      throw e;
    }
  };

  const logout = async () => {
    // setLoading(true);
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("userRole"); // Clear persisted role
      await AsyncStorage.removeItem("user_name");
      await AsyncStorage.removeItem("user_bio");
      await AsyncStorage.removeItem("user_image");
      setUserData(null);
    } catch (err: any) {
      console.error("Logout Error:", err);
    } finally {
      // setLoading(false);
    }
  };

  const deleteAccount = async () => {
    setError(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user logged in");

      // 1. Delete Firestore User Document
      await deleteDoc(doc(db, "users", currentUser.uid));

      // 2. Delete Authentication User
      await deleteUser(currentUser);

      // 3. Clear Local Storage (reuse logout cleanup logic essentially)
      await AsyncStorage.removeItem("userRole");
      await AsyncStorage.removeItem("user_name");
      await AsyncStorage.removeItem("user_bio");
      await AsyncStorage.removeItem("user_image");
      setUserData(null);
    } catch (err: any) {
      const friendlyMsg = mapAuthError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.uid);
    }
  };

  const resetError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData, // Expose user data (role, name, etc.)
        loading,
        signIn,
        signUp,
        logout,
        error,
        resetError,
        refreshUserData,
        resetPassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
