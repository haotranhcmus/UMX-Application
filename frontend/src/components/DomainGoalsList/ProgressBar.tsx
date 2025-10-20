import React from "react";
import { View, StyleSheet } from "react-native";
import { theme } from "../../theme";

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
}

/**
 * ProgressBar - Reusable progress bar component
 *
 * @param progress - Progress percentage (0-100)
 * @param height - Bar height in pixels
 * @param backgroundColor - Background color
 * @param fillColor - Fill color
 */
export const ProgressBar = React.memo(
  ({
    progress,
    height = 6,
    backgroundColor = theme.colors.border,
    fillColor = theme.colors.success,
  }: ProgressBarProps) => {
    // Clamp progress between 0 and 100
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
      <View style={[styles.container, { height }]}>
        <View style={[styles.background, { backgroundColor }]}>
          <View
            style={[
              styles.fill,
              { width: `${clampedProgress}%`, backgroundColor: fillColor },
            ]}
          />
        </View>
      </View>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    width: "80%",
  },
  background: {
    height: "100%",
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});
