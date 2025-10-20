import AppText from "@/components/AppText";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { router, Stack } from "expo-router";
import { theme } from "@/theme";

import DomainGoalsList from "@/components/DomainGoalsList";

import MOCK_DOMAINS from "@assets/fake_data/domain";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDomain } from "@/providers/DomainProvider";

export default function SelectDomainGoalsScreen() {
  const { domains, setDomains } = useDomain();
  const [totalCount, setTotalCount] = React.useState(0);
  const [selectedCount, setSelectedCount] = React.useState(0);

  React.useEffect(() => {
    let total = 0;
    let selected = 0;
    domains.forEach((domain) => {
      domain.goals.forEach((goal) => {
        total += 1;
        if (goal.isSelected) {
          selected += 1;
        }
      });
    });
    setTotalCount(total);
    setSelectedCount(selected);
  }, [domains]);

  const handlePress = () => {
    console.log(domains);
    setDomains(MOCK_DOMAINS);
    console.log(domains.map((d) => d.goals.map((g) => g.isSelected)));
    router.back();
  };

  const handleExit = () => {
    router.back();
  };

  // Handle select all goals
  const handleSelectAll = (isSelected: boolean) => {
    const updatedDomains = domains.map((domain) => ({
      ...domain,
      goals: domain.goals.map((goal) => ({
        ...goal,
        isSelected,
      })),
    }));
    setDomains(updatedDomains);
  };

  // Handle domain toggle (select/unselect all goals)
  const handleDomainToggle = (domainId: string, isSelected: boolean) => {
    const updatedDomains = domains.map((domain) =>
      domain.id === domainId
        ? {
            ...domain,
            goals: domain.goals.map((goal) => ({
              ...goal,
              isSelected,
            })),
          }
        : domain
    );
    setDomains(updatedDomains);
  };

  // Handle individual goal toggle
  const handleGoalToggle = (
    domainId: string,
    goalId: string,
    isSelected: boolean
  ) => {
    const updatedDomains = domains.map((domain) =>
      domain.id === domainId
        ? {
            ...domain,
            goals: domain.goals.map((goal) =>
              goal.id === goalId ? { ...goal, isSelected } : goal
            ),
          }
        : domain
    );
    setDomains(updatedDomains);
  };
  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: theme.colors.blueLight,
      }}
    >
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View>
              <AppText style={styles.topHeader} bold>
                Kết quả mục tiêu
              </AppText>
              <AppText>Chọn mục tiêu cần báo cáo</AppText>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={handleExit}
            >
              <Ionicons
                name="exit-outline"
                size={theme.typography.fontSizes.xl}
                color={theme.colors.error}
              />
              <AppText>Thoát</AppText>
            </TouchableOpacity>
          ),
          headerLeft: () => <></>,
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.backgroundLight },
        }}
      />
      <DomainGoalsList
        domains={domains}
        onSelectAll={handleSelectAll}
        onDomainToggle={handleDomainToggle}
        onGoalToggle={handleGoalToggle}
      />

      <View style={styles.footerContainer}>
        <Pressable style={styles.button} onPress={handleExit}>
          <AppText bold>Quay lại</AppText>
        </Pressable>
        <Pressable style={styles.button} onPress={handlePress}>
          <AppText style={{ color: theme.colors.primary }} bold>
            {`Tiếp tục (${selectedCount} / ${totalCount})`}
          </AppText>
          <Ionicons
            name="arrow-forward-circle-outline"
            size={theme.typography.fontSizes.lg}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    fontSize: theme.typography.fontSizes.lg,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.colors.white,
  },
  button: {
    padding: theme.layout.spacing.md,
    alignItems: "center",
    flexDirection: "row",
  },
});
