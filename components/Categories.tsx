import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const categories = ["For You", "Technology", "Business", "Entertainment", "Sports", "Health"];

const Categories = ({ activeCategory, setActiveCategory }: { activeCategory: string, setActiveCategory: (cat: string) => void }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                { backgroundColor: isActive ? colors.primary + "20" : colors.card }
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: isActive ? colors.primary : colors.text,
                    fontWeight: isActive ? "600" : "400"
                  }
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  scrollContainer: {
    paddingHorizontal: 15,
    alignItems: "center",
  },
  categoryButton: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
  },
});

export default Categories;
