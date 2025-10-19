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
import ModalInfo from "@/components/ModalInfo";

import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/theme";

import validateEmail from "@/utils/validateEmail";
import validatePassword from "@/utils/validatePassword";

import { useRouter } from "expo-router";
import { ROUTES } from "@/constants/routes";

import { VALIDATION_MESSAGES } from "@/constants/messages";

export default function RegisterScreen() {
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<{
    fullname?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate fullname
    if (!fullname.trim()) {
      newErrors.fullname = VALIDATION_MESSAGES.REQUIRED("Full name");
    } else if (fullname.trim().length < 3) {
      newErrors.fullname = VALIDATION_MESSAGES.FULLNAME_TOO_SHORT(3);
    }

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

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = VALIDATION_MESSAGES.PASSWORD_MISMATCH;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSignUp = () => {
    if (!validateForm()) {
      return;
    }
    // handle the registration logic (e.g., API call)
    toggleModal();
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        {!isConfirmPasswordFocused && (
          <View style={styles.header}>
            <Logo />
          </View>
        )}
        <View style={styles.formContainer}>
          <AppText style={styles.maintitle} bold>
            Đăng kí tài khoản
          </AppText>
          <Input
            label="Họ và tên phụ huynh"
            placeholder="Họ và tên"
            value={fullname}
            onChangeText={setFullname}
            errorMessage={errors.fullname}
            onFocus={() =>
              setErrors((prev) => ({ ...prev, fullname: undefined }))
            }
          />
          <Input
            label="Email"
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            errorMessage={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
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
          <Input
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
            onBlur={() => setIsConfirmPasswordFocused(false)}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            errorMessage={errors.confirmPassword}
            onFocus={() => {
              setIsConfirmPasswordFocused(true);
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
          />
          <GreenButton
            title="Đăng ký"
            onPress={onSignUp}
            style={styles.loginButton}
            variant="primary"
          />
        </View>
        <View style={styles.subtitleContainer}>
          <AppText style={styles.subtitleText}>Bạn đã có tài khoản? </AppText>
          <Pressable onPress={() => router.push(ROUTES.AUTH.LOGIN)}>
            <AppText style={styles.signupText} bold>
              Đăng nhập ngay
            </AppText>
          </Pressable>
        </View>
        <ModalInfo
          isVisible={isModalVisible}
          onClose={toggleModal}
          title="Thông tin đăng ký"
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={theme.colors.primary}
            />
            <AppText>Đăng kí thành công!</AppText>
          </View>
          <View
            style={{ alignItems: "center", marginTop: theme.layout.spacing.sm }}
          >
            <GreenButton
              title="Tiếp tục"
              onPress={() => {
                router.push(ROUTES.AUTH.LOGIN);
                toggleModal();
              }}
              style={styles.loginButton}
              variant="primary"
            />
          </View>
        </ModalInfo>
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
    marginBottom: theme.layout.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    flex: 3.5,
  },
  loginButton: {
    width: "80%",
    backgroundColor: theme.colors.primary,
  },
  forgotPassword: {
    marginTop: theme.layout.spacing.sm,
    fontSize: theme.typography.fontSizes.md,
    textDecorationLine: "underline",
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    marginTop: theme.layout.spacing.sm,
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
    flex: 1,
  },
  subtitleText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
  },
});
