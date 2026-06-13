import { View, Text, StyleSheet, Image } from "react-native";

interface PageHeaderProps {
  title: string;
}

export default function PageHeader({
  title,
}: PageHeaderProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
  },

  logo: {
    width: 45,
    height: 45,
    resizeMode: "contain",
  },

  title: {
    marginLeft: 14,
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
  },
});