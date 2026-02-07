import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, verticalScale } from "react-native-size-matters";
import { useTheme } from "../context/ThemeContext";

// ----------------------------------------------------------------------
// CONFIGURATION
// ----------------------------------------------------------------------
const API_KEY = "79579e4543b64ee38629f44c55ea5ae0";
const BASE_URL = "https://api.twelvedata.com";

// INDICES
const INDICES = ["SPY", "QQQ", "DIA", "IWM"];

// FULL LIST
const POPULAR_STOCKS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "TSLA",
  "META",
];

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 mins
const ScreenWidth = Dimensions.get("window").width;

const StockMarket = () => {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chart State
  const [activeSymbol, setActiveSymbol] = useState("SPY");
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<string | null>(null);
  const [isChartPositive, setIsChartPositive] = useState(true);
  const [yAxisOffset, setYAxisOffset] = useState(0);

  // List State
  const [stockList, setStockList] = useState<any[]>([]);

  // ----------------------------------------------------------------------
  // EFFECTS
  // ----------------------------------------------------------------------
  useEffect(() => {
    fetchStockList();
  }, []);

  useEffect(() => {
    fetchChartData(activeSymbol);
  }, [activeSymbol]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setErrorMsg(null);
    Promise.all([fetchStockList(), fetchChartData(activeSymbol)]).then(() => {
      setRefreshing(false);
    });
  }, [activeSymbol]);

  // ----------------------------------------------------------------------
  // DATA FETCHING: CHART
  // ----------------------------------------------------------------------
  const fetchChartData = async (symbol: string) => {
    setChartLoading(true);
    const cacheKey = `chart_data_${symbol}_real`; // New cache key to avoid mixed mock/real

    try {
      // 1. Try Cache
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { timestamp, data, meta, offset } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setChartData(data);
          if (meta) {
            setCurrentPrice(meta.price);
            setPriceChange(meta.change);
            setIsChartPositive(meta.isPositive);
          }
          setYAxisOffset(offset || 0);
          setChartLoading(false);
          return;
        }
      }

      // 2. Try API
      const response = await fetch(
        `${BASE_URL}/time_series?symbol=${symbol}&interval=2h&outputsize=30&apikey=${API_KEY}`,
      );
      const json = await response.json();

      if (json.code === 429) {
        // USER REQUESTED NO MOCK -> SHOW ERROR
        setChartLoading(false);
        if (!errorMsg) setErrorMsg("Rate Limit (8/min). Please wait.");
        return;
      }

      if (!json.values) {
        setChartLoading(false);
        return;
      }

      // Process Data
      const rawData = json.values.reverse();

      // Calculate Min value for dynamic scaling
      // We find the real min value in dataset and subtract a buffer
      // This makes the "ups and downs" look significant
      let minVal = Number.MAX_VALUE;

      const formattedData = rawData.map((item: any) => {
        const val = parseFloat(item.close);
        if (val < minVal) minVal = val;
        return {
          value: val,
          label: item.datetime.split(" ")[0].slice(5),
          dataPointText: "", // clean look
        };
      });

      // Calculate meta
      const newest = formattedData[formattedData.length - 1];
      const oldest = formattedData[0];
      const current = newest.value;
      const change = current - oldest.value;
      const changePercent = (change / oldest.value) * 100;
      const isPositive = change >= 0;

      const meta = {
        price: current.toFixed(2),
        change: `${change >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`,
        isPositive,
      };

      // Offset logic: floor(minVal) - padding
      // e.g. if min is 105, start axis at 100? or 104?
      const calculatedOffset = Math.floor(minVal * 0.98); // 2% buffer below min

      setCurrentPrice(meta.price);
      setPriceChange(meta.change);
      setIsChartPositive(isPositive);
      setChartData(formattedData);
      setYAxisOffset(calculatedOffset);

      // Cache it
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data: formattedData,
          meta,
          offset: calculatedOffset,
        }),
      );
    } catch (error) {
      console.log("Chart API Error:", error);
      setErrorMsg("Network Error");
    } finally {
      setChartLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // DATA FETCHING: LIST
  // ----------------------------------------------------------------------
  const fetchStockList = async () => {
    const cacheKey = "stock_list_cache_real";

    // 1. Try Cache
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        setStockList(data);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const symbols = POPULAR_STOCKS.join(",");
      const response = await fetch(
        `${BASE_URL}/quote?symbol=${symbols}&apikey=${API_KEY}`,
      );
      const json = await response.json();

      if (json.code === 429) {
        setErrorMsg("API Limit Reached (8 calls/min).");
        setLoading(false);
        return;
      }

      let dataArray: any[] = [];
      if (json[POPULAR_STOCKS[0]]) {
        dataArray = Object.values(json);
      } else if (json.symbol) {
        dataArray = [json];
      }

      const formattedList = dataArray.map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        price: parseFloat(item.close || item.previous_close).toFixed(2),
        percent_change: parseFloat(item.percent_change).toFixed(2),
      }));

      setStockList(formattedList);
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data: formattedList,
        }),
      );
    } catch (error) {
      console.log("List API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  const renderStockItem = ({ item }: { item: any }) => {
    const isPositive = parseFloat(item.percent_change) >= 0;
    const color = isPositive ? "#00C853" : "#FF3D00";

    return (
      <TouchableOpacity
        key={item.symbol}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          },
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.iconPlaceholder,
              { backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5" },
            ]}
          >
            <Text style={[styles.iconText, { color: colors.text }]}>
              {item.symbol[0]}
            </Text>
          </View>
          <View>
            <Text style={[styles.symbol, { color: colors.text }]}>
              {item.symbol}
            </Text>
            <Text style={[styles.name, { color: colors.secondaryText }]}>
              {item.name.length > 20
                ? item.name.substring(0, 18) + "..."
                : item.name}
            </Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={[styles.price, { color: colors.text }]}>
            ${item.price}
          </Text>
          <View
            style={[
              styles.changeBadge,
              {
                backgroundColor: isPositive
                  ? "rgba(0,200,83,0.1)"
                  : "rgba(255,61,0,0.1)",
              },
            ]}
          >
            <Text style={[styles.changeText, { color }]}>
              {isPositive ? "+" : ""}
              {item.percent_change}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Chart Styling - Dynamic based on Trend
  const chartMainColor = isChartPositive ? "#00C853" : "#FF3D00";
  const startFill = isChartPositive
    ? "rgba(0, 200, 83, 0.2)"
    : "rgba(255, 61, 0, 0.2)";
  const endFill = isChartPositive
    ? "rgba(0, 200, 83, 0.01)"
    : "rgba(255, 61, 0, 0.01)";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: top },
      ]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Market Overview
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Main Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartSymbol, { color: colors.text }]}>
                {activeSymbol}
              </Text>
              <Text style={[styles.chartDate, { color: colors.secondaryText }]}>
                Last 30 Days
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.chartPrice, { color: colors.text }]}>
                ${currentPrice || "---"}
              </Text>
              <Text
                style={[
                  styles.chartChange,
                  {
                    color: isChartPositive ? "#00C853" : "#FF3D00",
                  },
                ]}
              >
                {priceChange || "---"}
              </Text>
            </View>
          </View>

          <View
            style={{
              height: verticalScale(220),
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            {chartLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <LineChart
                data={chartData}
                yAxisOffset={yAxisOffset} // Dynamic Offset for "Ups and Downs"
                height={verticalScale(200)}
                width={ScreenWidth}
                spacing={ScreenWidth / (chartData.length + 6)}
                initialSpacing={20}
                endSpacing={20}
                color={chartMainColor}
                thickness={3}
                startFillColor={chartMainColor}
                endFillColor={chartMainColor}
                startOpacity={0.2}
                endOpacity={0.0}
                areaChart
                curved
                isAnimated
                animationDuration={1200}
                hideDataPoints
                hideRules
                hideYAxisText
                hideAxesAndRules
                adjustToWidth={true}
                xAxisLabelTextStyle={{
                  color: colors.secondaryText,
                  fontSize: 10,
                }}
                onPress={() => Haptics.selectionAsync()}
                pointerConfig={{
                  pointerStripHeight: 160,
                  pointerStripColor: colors.text,
                  pointerStripWidth: 2,
                  pointerColor: chartMainColor,
                  radius: 6,
                  pointerLabelWidth: 100,
                  pointerLabelHeight: 90,
                  activatePointersOnLongPress: false, // Instant touch
                  persistPointer: true,
                  autoAdjustPointerLabelPosition: true,
                  pointerLabelComponent: (items: any) => {
                    return (
                      <View
                        style={{
                          height: 90,
                          width: 100,
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: -30,
                          marginLeft: -40,
                          backgroundColor: colors.card,
                          borderRadius: 16,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.15,
                          shadowRadius: 8,
                          elevation: 10,
                          padding: 8,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: 16,
                            fontWeight: "800",
                            textAlign: "center",
                            marginBottom: 4,
                          }}
                        >
                          ${items[0].value.toFixed(2)}
                        </Text>
                        <Text
                          style={{
                            color: colors.secondaryText,
                            fontSize: 10,
                            fontWeight: "600",
                            textAlign: "center",
                          }}
                        >
                          {items[0].label}
                        </Text>
                      </View>
                    );
                  },
                }}
              />
            )}
          </View>

          {/* Indices Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorContent}
          >
            {INDICES.map((idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveSymbol(idx)}
                style={[
                  styles.selectorChip,
                  {
                    backgroundColor:
                      activeSymbol === idx
                        ? colors.primary
                        : isDark
                          ? "#333"
                          : "#F0F0F0",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.selectorText,
                    { color: activeSymbol === idx ? "#fff" : colors.text },
                  ]}
                >
                  {idx}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular List Section */}
        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Popular Assets
          </Text>

          {errorMsg && (
            <View
              style={{
                padding: 12,
                backgroundColor: "rgba(255,59,48,0.1)",
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: "#FF3B30",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                {errorMsg}
              </Text>
            </View>
          )}

          {loading && !refreshing ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : (
            <View>{stockList.map((item) => renderStockItem({ item }))}</View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default StockMarket;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
    marginLeft: -5,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  chartSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartSymbol: {
    fontSize: moderateScale(24),
    fontWeight: "800",
  },
  chartDate: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    marginTop: 4,
    opacity: 0.7,
  },
  chartPrice: {
    fontSize: moderateScale(24),
    fontWeight: "800",
  },
  chartChange: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    marginTop: 4,
  },
  selectorContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  selectorChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  selectorText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
  },
  listSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: "800",
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconText: {
    fontSize: 20,
    fontWeight: "800",
  },
  symbol: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    marginBottom: 4,
  },
  name: {
    fontSize: moderateScale(13),
    opacity: 0.8,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    marginBottom: 6,
  },
  changeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  changeText: {
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
});
