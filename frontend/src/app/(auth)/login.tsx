import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AppText from "@/components/AppText";

import GreenButton from "@/components/GreenButton";
import Logo from "@/components/Logo";
import Input from "@/components/Input";

import { theme } from "@/theme";

import { useRouter } from "expo-router";
import { ROUTES } from "@/constants/routes";

import validateEmail from "@/utils/validateEmail";
import validatePassword from "@/utils/validatePassword";

import { VALIDATION_MESSAGES } from "@/constants/messages";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate email
    if (!email.trim()) {
      newErrors.email = VALIDATION_MESSAGES.REQUIRED("Email");
    } else if (!validateEmail(email)) {
      newErrors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
    }

    // Validate password
    if (!password) {
      newErrors.password = VALIDATION_MESSAGES.REQUIRED("Password");
    } else if (!validatePassword(password)) {
      newErrors.password = VALIDATION_MESSAGES.PASSWORD_REQUIREMENTS;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const router = useRouter();

  const handleLogin = () => {
    //Logic for login here
    if (!validateForm()) {
      return;
    }
    router.push(ROUTES.APP.HOME); // Navigate to Home screen on successful login
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Logo />
        </View>
        <View style={styles.formContainer}>
          <AppText style={styles.maintitle} bold>
            Đăng nhập
          </AppText>
          <Input
            label="Email"
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            errorMessage={errors.email}
            onFocus={() => setErrors((prev) => ({ ...prev, email: undefined }))}
          />
          <Input
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            errorMessage={errors.password}
            onFocus={() =>
              setErrors((prev) => ({ ...prev, password: undefined }))
            }
          />
          <GreenButton
            title="Đăng nhập"
            onPress={handleLogin}
            style={styles.loginButton}
            variant="primary"
          />
          <Pressable onPress={() => router.push(ROUTES.AUTH.FORGOT_PASSWORD)}>
            <AppText style={styles.forgotPassword}>Quên mật khẩu?</AppText>
          </Pressable>
        </View>
        <View style={styles.subtitleContainer}>
          <AppText style={styles.subTitleText}>Chưa có tài khoản? </AppText>
          <Pressable onPress={() => router.push(ROUTES.AUTH.REGISTER)}>
            <AppText style={styles.signupText} bold>
              Đăng ký ngay
            </AppText>
          </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
  signupText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.md,
  },
  maintitle: {
    fontSize: theme.typography.fontSizes.xxl,
    marginBottom: theme.layout.spacing.sm,
    textAlign: "center",
    paddingHorizontal: theme.layout.spacing.lg,
  },
  formContainer: {
    width: "100%",
    marginBottom: theme.layout.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flex: 3.5,
  },
  loginButton: {
    width: "80%",
    marginTop: theme.layout.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  forgotPassword: {
    marginTop: theme.layout.spacing.md,
    fontSize: theme.typography.fontSizes.md,
    textDecorationLine: "underline",
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    marginTop: theme.layout.spacing.lg,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  header: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.layout.spacing.lg,
    flex: 1,
  },
  subTitleText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.xs,
    marginBottom: theme.layout.spacing.sm,
    marginTop: -theme.layout.spacing.xs,
    textAlign: "left",
    width: "100%",
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
});
