import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import AppText from "@/components/AppText";
import { View } from "@/components/Themed"; // Adjust the import path as necessary
import { theme } from "@/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <AppText style={styles.title}>This screen doesn&apos;t exist.</AppText>

        <Link href="/" style={styles.link}>
          <AppText style={styles.linkText}>Go to home screen!</AppText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: theme.typography.fontSizes.sm,
    color: "#2e78b7",
  },
});
