import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Checkbox } from "expo-checkbox";
import AppText from "../AppText";
import { theme } from "../../theme";
import { Goal } from "../../types/domain";
import { ProgressBar } from "./ProgressBar";
import { TagList } from "./TagList";

interface GoalItemProps {
  goal: Goal;
  domainId: string;
  isSelected: boolean;
  onToggle: (domainId: string, goalId: string) => void;
}

/**
 * GoalItem - Display individual goal with checkbox, description, tags, and progress
 *
 * @param goal - Goal data object
 * @param domainId - Parent domain ID
 * @param isSelected - Whether goal is selected
 * @param onToggle - Callback when goal checkbox is toggled
 */
export const GoalItem = React.memo(
  ({ goal, domainId, isSelected, onToggle }: GoalItemProps) => {
    const handleToggle = React.useCallback(() => {
      onToggle(domainId, goal.id);
    }, [onToggle, domainId, goal.id]);

    return (
      <Pressable style={styles.container} onPress={handleToggle}>
        <View style={styles.checkboxRow}>
          <Checkbox
            value={isSelected}
            onValueChange={handleToggle}
            color={isSelected ? theme.colors.primary : undefined}
          />
          <AppText style={styles.goalText}>{goal.description}</AppText>
        </View>

        {goal.tags && goal.tags.length > 0 && <TagList tags={goal.tags} />}

        <View style={styles.progressContainer}>
          <ProgressBar progress={goal.resultProgress} height={6} />
          <AppText style={styles.progressText}>{goal.resultProgress}%</AppText>
        </View>
      </Pressable>
    );
  }
);

GoalItem.displayName = "GoalItem";

const styles = StyleSheet.create({
  container: {
    paddingLeft: theme.layout.spacing.xl,
    paddingRight: theme.layout.spacing.md,
    paddingVertical: theme.layout.spacing.sm,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.layout.spacing.sm,
    gap: theme.layout.spacing.sm,
  },
  goalText: {
    flex: 1,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.layout.spacing.sm,
  },
  progressText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textLight,
    minWidth: 45,
  },
});
