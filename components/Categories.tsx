import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "../context/ThemeContext";

const categories = ["For You", "Technology", "Business", "Entertainment", "Sports", "Health"];

const Categories = ({ activeCategory, setActiveCategory }: { activeCategory: string, setActiveCategory: (cat: string) => void }) => {
  const { colors, isDark } = useTheme();

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
              activeOpacity={0.7}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: isActive ? colors.primary : (isDark ? '#333' : '#f0f0f0'),
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : (isDark ? '#444' : '#e0e0e0'),
                  elevation: isActive ? 4 : 0,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isActive ? 0.3 : 0,
                  shadowRadius: 4,
                }
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: isActive ? '#fff' : colors.text,
                    fontWeight: isActive ? "700" : "500"
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
    paddingVertical: verticalScale(16),
  },
  scrollContainer: {
    paddingHorizontal: scale(20),
    alignItems: "center",
  },
  categoryButton: {
    marginRight: scale(10),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(20),
  },
  categoryText: {
    fontSize: moderateScale(13),
  },
});

export default Categories;
