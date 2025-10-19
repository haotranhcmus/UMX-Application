import React from "react";
import { StyleSheet, View, Image } from "react-native";

import GreenButton from "@/components/GreenButton";
import Logo from "@/components/Logo";
import { Images } from "@/constants/images";
import AppText from "@/components/AppText";
import { theme } from "@/theme";

import { useRouter } from "expo-router";
import { ROUTES } from "@/constants/routes";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Logo />
      <Image style={styles.backgroundImage} source={Images.welcomeScreenImg} />
      <AppText style={styles.maintitle} bold>
        Xin chào quý phụ huynh!
      </AppText>
      <AppText style={styles.subtitle}>
        Chúc quý phụ huynh một ngày tốt lành
      </AppText>
      <GreenButton
        title="Đăng nhập"
        onPress={() => router.push(ROUTES.AUTH.LOGIN)}
        style={styles.loginButton}
        variant="primary"
      />
      <GreenButton
        title="Đăng ký"
        onPress={() => router.push(ROUTES.AUTH.REGISTER)}
        style={styles.signinButton}
        variant="secondary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.backgroundLight,
    width: "100%",
  },
  backgroundImage: {
    resizeMode: "contain",
    width: 280,
    height: 280,
  },
  maintitle: {
    fontSize: theme.typography.fontSizes.xxxl,
    marginBottom: theme.layout.spacing.sm,
    textAlign: "center",
    paddingHorizontal: theme.layout.spacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    marginBottom: theme.layout.spacing.lg,
  },
  loginButton: {
    width: "80%",
    padding: theme.layout.spacing.md,
    borderRadius: theme.layout.borderRadius.md,
    alignItems: "center",
  },
  signinButton: {
    width: "80%",
    padding: theme.layout.spacing.md,
    borderRadius: theme.layout.borderRadius.md,
    alignItems: "center",
    marginTop: theme.layout.spacing.sm,
  },
});
