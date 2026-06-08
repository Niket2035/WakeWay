import React from "react";
import { View, Text, StyleSheet } from "react-native";

const HeroCard = () => {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.eyebrow}>WakeWay</Text>

      <Text style={styles.title}>
        Set a destination alarm
      </Text>

      <Text style={styles.subtitle}>
        Search for a place, start tracking,
        and get notified before you miss your stop.
      </Text>
    </View>
  );
};

export default HeroCard;

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 22,
    gap: 8,
  },
  eyebrow: {
    color: "#5eead4",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 15,
    lineHeight: 22,
  },
});