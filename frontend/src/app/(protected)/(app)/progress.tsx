import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "@/components/AppText";
import { theme } from "@/theme";

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <AppText>Hello from Progress</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundLight,
  },
});
