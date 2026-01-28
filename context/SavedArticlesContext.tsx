import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const SavedArticlesContext = createContext<any>(null);

export const SavedArticlesProvider = ({ children }: any) => {
  const [savedArticles, setSavedArticles] = useState<any[]>([]);

  // Load from storage on start
  useEffect(() => {
    const loadSaved = async () => {
      const stored = await AsyncStorage.getItem("savedArticles");
      if (stored) setSavedArticles(JSON.parse(stored));
    };
    loadSaved();
  }, []);

  // Save whenever list changes
  useEffect(() => {
    AsyncStorage.setItem("savedArticles", JSON.stringify(savedArticles));
  }, [savedArticles]);

  const addArticle = (article: any) => {
    const exists = savedArticles.some((a) => a.url === article.url);
    if (!exists) setSavedArticles([...savedArticles, article]);
  };

  const removeArticle = (url: string) => {
    setSavedArticles(savedArticles.filter((a) => a.url !== url));
  };

  return (
    <SavedArticlesContext.Provider value={{ savedArticles, addArticle, removeArticle }}>
      {children}
    </SavedArticlesContext.Provider>
  );
};

export const useSavedArticles = () => useContext(SavedArticlesContext);
