import React, { useState, useMemo, useCallback } from "react";
import { View, FlatList, StyleSheet, LayoutAnimation } from "react-native";
import { Domain } from "@/types/domain";
import { SelectAllHeader } from "./DomainGoalsList/SelectAllHeader";
import { DomainItem } from "./DomainGoalsList/DomainItem";
import { GoalItem } from "./DomainGoalsList/GoalItem";
import { theme } from "@/theme";

interface DomainGoalsListProps {
  domains: Domain[];
  onDomainToggle?: (domainId: string, isSelected: boolean) => void;
  onGoalToggle?: (
    domainId: string,
    goalId: string,
    isSelected: boolean
  ) => void;
  onSelectAll?: (isSelected: boolean) => void;
}

export default function DomainGoalsList({
  domains,
  onDomainToggle,
  onGoalToggle,
  onSelectAll,
}: DomainGoalsListProps) {
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set(domains.map((d) => d.id))
  );

  // Calculate if all goals are selected
  const isAllSelected = useMemo(() => {
    const totalGoals = domains.reduce((sum, d) => sum + d.goals.length, 0);
    if (totalGoals === 0) return false;

    const selectedGoals = domains.reduce(
      (sum, d) => sum + d.goals.filter((g) => g.isSelected).length,
      0
    );

    return selectedGoals === totalGoals;
  }, [domains]);

  // Calculate selected count
  const selectedCount = useMemo(() => {
    return domains.reduce(
      (sum, d) => sum + d.goals.filter((g) => g.isSelected).length,
      0
    );
  }, [domains]);

  // Calculate total count
  const totalCount = useMemo(() => {
    return domains.reduce((sum, d) => sum + d.goals.length, 0);
  }, [domains]);

  // Toggle expand/collapse domain
  const toggleDomain = useCallback((domainId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDomains((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(domainId)) {
        newSet.delete(domainId);
      } else {
        newSet.add(domainId);
      }
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    const newValue = !isAllSelected;
    onSelectAll?.(newValue);
  }, [isAllSelected, onSelectAll]);

  // Check if all goals in domain are selected
  const isDomainSelected = useCallback((domain: Domain): boolean => {
    if (domain.goals.length === 0) return false;
    return domain.goals.every((goal) => goal.isSelected);
  }, []);

  // Get selected count for domain
  const getSelectedGoalsCount = useCallback((domain: Domain): number => {
    return domain.goals.filter((goal) => goal.isSelected).length;
  }, []);

  // Toggle all goals in domain
  const handleDomainCheckbox = useCallback(
    (domainId: string) => {
      const domain = domains.find((d) => d.id === domainId);
      if (!domain) return;
      const newValue = !isDomainSelected(domain);
      onDomainToggle?.(domainId, newValue);
    },
    [domains, isDomainSelected, onDomainToggle]
  );

  // Toggle individual goal
  const handleGoalToggle = useCallback(
    (domainId: string, goalId: string) => {
      const domain = domains.find((d) => d.id === domainId);
      if (!domain) return;
      const goal = domain.goals.find((g) => g.id === goalId);
      if (!goal) return;
      const newValue = !goal.isSelected;
      onGoalToggle?.(domainId, goalId, newValue);
    },
    [domains, onGoalToggle]
  );

  // Render domain item
  const renderDomain = useCallback(
    ({ item: domain }: { item: Domain }) => {
      const isExpanded = expandedDomains.has(domain.id);
      const isSelected = isDomainSelected(domain);
      const selectedGoalsCount = getSelectedGoalsCount(domain);

      return (
        <View style={styles.domainContainer}>
          {/* Domain Header */}
          <DomainItem
            domain={domain}
            isExpanded={isExpanded}
            isSelected={isSelected}
            selectedGoalsCount={selectedGoalsCount}
            onToggleExpand={toggleDomain}
            onToggleDomain={handleDomainCheckbox}
          />

          {/* Goals List */}
          {isExpanded && domain.goals.length > 0 && (
            <View style={styles.goalsContainer}>
              {domain.goals.map((goal) => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  domainId={domain.id}
                  isSelected={goal.isSelected}
                  onToggle={handleGoalToggle}
                />
              ))}
            </View>
          )}
        </View>
      );
    },
    [
      expandedDomains,
      isDomainSelected,
      getSelectedGoalsCount,
      toggleDomain,
      handleDomainCheckbox,
      handleGoalToggle,
    ]
  );

  return (
    <View style={styles.container}>
      {/* Select All */}
      <SelectAllHeader
        isAllSelected={isAllSelected}
        selectedCount={selectedCount}
        totalCount={totalCount}
        onSelectAll={handleSelectAll}
      />

      {/* Domains List */}
      <FlatList
        data={domains}
        renderItem={renderDomain}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.blueLight,
  },
  domainContainer: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  goalsContainer: {
    backgroundColor: theme.colors.white,
  },
});
