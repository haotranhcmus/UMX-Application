import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  Pressable,
} from "react-native";
import AppText from "./AppText";
import { theme } from "@/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const GreenButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        };
      case "secondary":
        return {
          backgroundColor: theme.colors.white,
          borderColor: theme.colors.primary,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: theme.colors.primary,
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          paddingVertical: theme.layout.spacing.sm,
          paddingHorizontal: theme.layout.spacing.md,
        };
      case "md":
        return {
          paddingVertical: theme.layout.spacing.md,
          paddingHorizontal: theme.layout.spacing.lg,
        };
      case "lg":
        return {
          paddingVertical: theme.layout.spacing.lg,
          paddingHorizontal: theme.layout.spacing.xl,
        };
      default:
        return {};
    }
  };

  const getTextColor = () => {
    if (variant === "primary") {
      return theme.colors.white;
    }
    return theme.colors.primary;
  };

  return (
    <Pressable
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <AppText
          style={[styles.text, { color: getTextColor() }, textStyle]}
          bold
        >
          {title}
        </AppText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.layout.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: theme.layout.spacing.xs,
    borderWidth: 1,
  },
  text: {
    fontSize: theme.typography.fontSizes.md,
  },
  disabled: {
    opacity: 0.5,
  },
});

// Keep the default export as Button to avoid breaking existing code
export default GreenButton;
