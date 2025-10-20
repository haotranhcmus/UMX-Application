import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../AppText";
import { theme } from "../../theme";
import { Tag } from "../../types/domain";

interface TagListProps {
  tags: Tag[];
  tagStyle?: object;
  textStyle?: object;
}

/**
 * TagList - Display list of tags
 *
 * @param tags - Array of tags to display
 * @param tagStyle - Custom style for tag container
 * @param textStyle - Custom style for tag text
 */
export const TagList = React.memo(
  ({ tags, tagStyle, textStyle }: TagListProps) => {
    if (!tags || tags.length === 0) return null;

    return (
      <View style={styles.container}>
        {tags.map((tag) => (
          <View key={tag.id} style={[styles.tag, tagStyle]}>
            <AppText style={[styles.tagText, textStyle]}>{tag.text}</AppText>
          </View>
        ))}
      </View>
    );
  }
);

TagList.displayName = "TagList";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.layout.spacing.xs,
    marginBottom: theme.layout.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.blueLight,
    paddingHorizontal: theme.layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.primary,
  },
});
