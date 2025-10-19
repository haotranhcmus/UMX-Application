import React from "react";
import { StyleSheet, View } from "react-native";

import Logo from "@/components/Logo";
import GreenButton from "@/components/GreenButton";
import Input from "@/components/Input";

import { theme } from "@/theme";

import { useRouter } from "expo-router";
import { ROUTES } from "@/constants/routes";

import AppText from "@/components/AppText";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo />
      </View>
      <View style={styles.formContainer}>
        <AppText style={styles.maintitle} bold>
          Quên mật khẩu
        </AppText>
        <AppText style={styles.subtitle}>
          Bạn hãy điền email đã đăng ký vào ô dưới đây nhé
        </AppText>
        <Input
          placeholder="Nhập email để nhận liên kết"
          containerStyle={styles.input}
          label=""
        />
        <GreenButton
          title="Gửi liên kết"
          onPress={() => router.push(ROUTES.AUTH.LOGIN)}
          style={styles.resetButton}
          textStyle={{ color: theme.colors.white }}
          variant="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.colors.backgroundLight,
    width: "100%",
  },
  header: {
    marginBottom: theme.layout.spacing.lg,
    flex: 1,
    justifyContent: "center",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 3,
  },
  maintitle: {
    fontSize: theme.typography.fontSizes.xxl,
    marginBottom: theme.layout.spacing.sm,
    textAlign: "center",
  },
  resetButton: {
    width: "80%",
  },
  subtitleContainer: {
    flexDirection: "row",
    marginTop: theme.layout.spacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textLight,
    marginBottom: theme.layout.spacing.lg,
  },
  input: {
    marginBottom: theme.layout.spacing.lg,
  },
});
