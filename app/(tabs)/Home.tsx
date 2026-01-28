import { FlashList } from "@shopify/flash-list";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import Articles from '../../components/Articles';
import Categories from '../../components/Categories';
import HomeHeader from '../../components/HomeHeader';
import { useTheme } from '../../context/ThemeContext';

const Home = () => {
  const { colors, isDark } = useTheme();
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

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <Articles
      urlToImage={item.urlToImage}
      title={item.title}
      description={item.description}
      author={item.author}
      publishedAt={item.publishedAt}
      source={item.source?.name}
      url={item.url}
      content={item.content}
    />
  ), []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
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
        <View style={{ flex: 1 }}>
          <FlashList
            data={articles}
            keyExtractor={(item, index) => item.url || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          // estimatedItemSize={moderateScale(380)}
          />
        </View>
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
