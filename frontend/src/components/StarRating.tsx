import React, { useState } from "react";
import { View, Pressable, StyleSheet, ViewStyle } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { theme } from "@/theme";
import AppText from "@/components/AppText";

interface StarRatingProps {
  maxStars?: number;
  rating: number;
  onRatingChange: (rating: number) => void;
  starSize?: number;
  starColor?: string;
  unratedStarColor?: string;
  disabled?: boolean;
  showRating?: boolean;
  style?: ViewStyle;
}

export default function StarRating({
  maxStars = 5,
  rating,
  onRatingChange,
  starSize = 32,
  starColor = theme.colors.primary,
  unratedStarColor = theme.colors.gray,
  disabled = false,
  showRating = true,
  style,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarPress = (starIndex: number) => {
    if (!disabled) {
      onRatingChange(starIndex);
    }
  };

  const renderStar = (index: number) => {
    const starNumber = index + 1;
    const isFilled =
      hoverRating > 0 ? starNumber <= hoverRating : starNumber <= rating;

    return (
      <Pressable
        key={index}
        onPress={() => handleStarPress(starNumber)}
        onPressIn={() => setHoverRating(starNumber)}
        onPressOut={() => setHoverRating(0)}
        style={styles.starContainer}
        disabled={disabled}
      >
        <AntDesign
          name="star"
          size={starSize}
          color={isFilled ? starColor : unratedStarColor}
        />
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxStars }, (_, index) => renderStar(index))}
      </View>
      {showRating && (
        <AppText style={styles.ratingText}>
          {rating} / {maxStars}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  starContainer: {
    padding: 4,
  },
  ratingText: {
    marginTop: 8,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.primary,
  },
});
