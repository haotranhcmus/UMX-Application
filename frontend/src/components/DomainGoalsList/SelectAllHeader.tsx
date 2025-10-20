import React from "react";
import { View, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Checkbox } from "expo-checkbox";
import AppText from "../AppText";
import { theme } from "../../theme";

interface SelectAllHeaderProps {
  isAllSelected: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
}

/**
 * SelectAllHeader - Display "Select All" checkbox header
 *
 * @param isAllSelected - Whether all items are selected
 * @param selectedCount - Number of selected items
 * @param totalCount - Total number of items
 * @param onSelectAll - Callback when select all is toggled
 */
export const SelectAllHeader = React.memo(
  ({
    isAllSelected,
    selectedCount,
    totalCount,
    onSelectAll,
  }: SelectAllHeaderProps) => {
    const countText = `(${selectedCount}/${totalCount})`;

    return (
      <Pressable style={styles.container} onPress={onSelectAll}>
        <Checkbox
          value={isAllSelected}
          onValueChange={onSelectAll}
          color={isAllSelected ? theme.colors.primary : undefined}
        />
        <AppText style={styles.label}>Chọn tất cả {countText}</AppText>
      </Pressable>
    );
  }
);

SelectAllHeader.displayName = "SelectAllHeader";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.layout.spacing.md,
    paddingVertical: theme.layout.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.layout.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    fontWeight: "600" as const,
  },
});
