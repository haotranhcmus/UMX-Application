import React from "react";
import { View, StyleSheet } from "react-native";

import { theme } from "@/theme";
import AppText from "@/components/AppText";

export default function AACScreen() {
  return (
    <View style={styles.container}>
      <AppText>Hello from AAC</AppText>
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
