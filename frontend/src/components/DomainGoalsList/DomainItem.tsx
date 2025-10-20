import React from "react";
import { View, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import AppText from "../AppText";
import { theme } from "../../theme";
import { Domain } from "../../types/domain";

interface DomainItemProps {
  domain: Domain;
  isExpanded: boolean;
  isSelected: boolean;
  selectedGoalsCount: number;
  onToggleExpand: (domainId: string) => void;
  onToggleDomain: (domainId: string) => void;
}

/**
 * DomainItem - Display domain header with expand/collapse, checkbox, and goal count
 *
 * @param domain - Domain data object
 * @param isExpanded - Whether domain is expanded
 * @param isSelected - Whether all goals in domain are selected
 * @param selectedGoalsCount - Number of selected goals in domain
 * @param onToggleExpand - Callback when expand/collapse is triggered
 * @param onToggleDomain - Callback when domain checkbox is toggled
 */
export const DomainItem = React.memo(
  ({
    domain,
    isExpanded,
    isSelected,
    selectedGoalsCount,
    onToggleExpand,
    onToggleDomain,
  }: DomainItemProps) => {
    const handleToggleExpand = React.useCallback(() => {
      onToggleExpand(domain.id);
    }, [onToggleExpand, domain.id]);

    const handleToggleDomain = React.useCallback(() => {
      onToggleDomain(domain.id);
    }, [onToggleDomain, domain.id]);

    const goalCount = domain.goals?.length || 0;
    const goalCountText = `${selectedGoalsCount}/${goalCount} mục tiêu`;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.headerRow}
          onPress={handleToggleExpand}
          activeOpacity={0.7}
        >
          <FontAwesome5
            name={isExpanded ? "chevron-down" : "chevron-right"}
            size={16}
            color={theme.colors.textLight}
          />
          <View style={styles.titleContainer}>
            <AppText style={styles.domainTitle}>
              {domain.order}. {domain.name}
            </AppText>
            <AppText style={styles.goalCount}>{goalCountText}</AppText>
          </View>
        </TouchableOpacity>

        <Pressable
          onPress={handleToggleDomain}
          style={styles.checkboxContainer}
        >
          <Checkbox
            value={isSelected}
            onValueChange={handleToggleDomain}
            color={isSelected ? theme.colors.primary : undefined}
            style={styles.checkbox}
          />
        </Pressable>
      </View>
    );
  }
);

DomainItem.displayName = "DomainItem";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.layout.spacing.md,
    paddingVertical: theme.layout.spacing.md,
    backgroundColor: "#F5F5F5", // Light gray background
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.layout.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  domainTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 2,
  },
  goalCount: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textLight,
  },
  checkbox: {
    marginHorizontal: theme.layout.spacing.sm,
  },
  checkboxContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: theme.layout.spacing.sm,
  },
});
