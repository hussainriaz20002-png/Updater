import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import Articles from '../../components/Articles';
import Categories from '../../components/Categories';
import HomeHeader from '../../components/HomeHeader';
import { useTheme } from '../../context/ThemeContext';

const Home = () => {
  const { colors } = useTheme();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("For You");

  const getNews = async (category: string) => {
    setLoading(true);

    let url =
      "https://newsapi.org/v2/top-headlines?country=us&apiKey=44fc0061cdc94f23a4058a40482801df";

    if (category !== "For You") {
      url += `&category=${category.toLowerCase()}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      setArticles(data.articles);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNews(activeCategory);
  }, [activeCategory]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HomeHeader />
      <Categories
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Articles
              urlToImage={item.urlToImage}
              title={item.title}
              description={item.description}
              author={item.author}
              publishedAt={item.publishedAt}
              source={item.source?.name}
              url={item.url}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />

      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
});

export default Home;
