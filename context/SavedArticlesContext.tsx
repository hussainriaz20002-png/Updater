import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const SavedArticlesContext = createContext<any>(null);

export const SavedArticlesProvider = ({ children }: any) => {
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const { user } = useAuth();

  // Generate a user-specific storage key
  const getStorageKey = useCallback(() => {
    return user?.uid ? `savedArticles_${user.uid}` : null;
  }, [user?.uid]);

  // Load saved articles when user changes (login/logout)
  useEffect(() => {
    const loadSaved = async () => {
      const key = getStorageKey();
      if (key) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          setSavedArticles(JSON.parse(stored));
        } else {
          setSavedArticles([]);
        }
      } else {
        // No user logged in, clear saved articles from state
        setSavedArticles([]);
      }
    };
    loadSaved();
  }, [getStorageKey]);

  // Save whenever list changes (only if user is logged in)
  useEffect(() => {
    const saveArticles = async () => {
      const key = getStorageKey();
      if (key) {
        await AsyncStorage.setItem(key, JSON.stringify(savedArticles));
      }
    };
    saveArticles();
  }, [savedArticles, getStorageKey]);

  const addArticle = (article: any) => {
    if (!user) return; // Don't allow saving if not logged in
    const exists = savedArticles.some((a) => a.url === article.url);
    if (!exists) setSavedArticles([...savedArticles, article]);
  };

  const removeArticle = (url: string) => {
    if (!user) return; // Don't allow removing if not logged in
    setSavedArticles(savedArticles.filter((a) => a.url !== url));
  };

  return (
    <SavedArticlesContext.Provider
      value={{ savedArticles, addArticle, removeArticle }}
    >
      {children}
    </SavedArticlesContext.Provider>
  );
};

export const useSavedArticles = () => useContext(SavedArticlesContext);
