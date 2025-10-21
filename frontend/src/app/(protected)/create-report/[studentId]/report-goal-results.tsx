import { Stack } from "expo-router/build/layouts/Stack";
import React, { useState, useCallback, memo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";

import Ionicons from "@expo/vector-icons/build/Ionicons";
import { theme } from "@/theme";
import AppText from "@/components/AppText";
import { router, useLocalSearchParams } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { useDomain } from "@/providers/DomainProvider";

import { Slider } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";

interface GoalItemProps {
  goal: any;
  domainId: string;
  onProgressChange: (
    domainId: string,
    goalId: string,
    progress: number
  ) => void;
}

const GoalItem = memo(({ goal, domainId, onProgressChange }: GoalItemProps) => {
  const [value, setValue] = useState(goal.resultProgress || 0); // Khởi tạo từ resultProgress

  // ✅ Chỉ update local state khi đang kéo (smooth UX)
  const handleValueChange = useCallback((newValue: number) => {
    setValue(newValue);
  }, []);

  // ✅ Chỉ update vào Provider khi thả tay ra (tối ưu performance)
  const handleSlidingComplete = useCallback(
    (newValue: number) => {
      onProgressChange(domainId, goal.id, newValue);
    },
    [domainId, goal.id, onProgressChange]
  );

  return (
    <View style={{ marginBottom: 16 }}>
      <AppText style={{ marginLeft: 16 }}>
        {goal.order}. {goal.description}
      </AppText>

      {/* 3. Component Slider */}
      <Slider
        value={value} // Giá trị hiện tại của slider
        // Update local state (smooth)
        onValueChange={handleValueChange} // Update local state (smooth)
        onSlidingComplete={handleSlidingComplete} // Update Provider (khi thả tay)
        maximumValue={100} // Giá trị lớn nhất
        minimumValue={0} // Giá trị nhỏ nhất
        step={1} // Bước nhảy (ví dụ: 0, 1, 2,...)
        allowTouchTrack // Cho phép nhấn vào track để thay đổi giá trị
        thumbStyle={{
          height: 15,
          width: 15,
          backgroundColor: "#fff",
          borderColor: "black",
          borderWidth: 1,
        }}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.border}
        thumbProps={{
          children: (
            // 5. Đây chính là cái label "75%"
            <View style={styles.labelContainer}>
              <AppText style={styles.labelText}>{value}%</AppText>
            </View>
          ),
        }}
        style={{ marginHorizontal: 16, marginTop: 20 }}
      />
    </View>
  );
});

GoalItem.displayName = "GoalItem";

export default function ReportResultScreen() {
  const studentId = useLocalSearchParams().studentId as string;

  const handleExit = () => {
    router.replace(ROUTES.APP.HOME);
  };

  const handleContinue = () => {
    router.push(ROUTES.APP.CREATE_REPORT + "/" + studentId);
  };

  const handleBack = () => {
    router.back();
  };

  const { domains, setDomains } = useDomain();
  const selectedDomains = domains.filter((domain) =>
    domain.goals.some((goal) => goal.isSelected)
  );

  // ✅ Memoize handler để tránh re-create function mỗi lần render
  const handleProgressChange = useCallback(
    (domainId: string, goalId: string, progress: number) => {
      const updatedDomains = domains.map((domain) =>
        domain.id === domainId
          ? {
              ...domain,
              goals: domain.goals.map((goal) =>
                goal.id === goalId
                  ? { ...goal, resultProgress: progress }
                  : goal
              ),
            }
          : domain
      );
      setDomains(updatedDomains);
    },
    [domains, setDomains]
  );

  console.log(selectedDomains);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["bottom"]}
    >
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View>
              <AppText style={styles.topHeader} bold>
                Kết quả mục tiêu
              </AppText>
              <AppText>Báo cáo kết quả</AppText>
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

      <View style={{ flex: 1 }}>
        <FlatList
          data={selectedDomains}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <AppText>{`${item.order}. ${item.name}`}</AppText>
              {item.goals
                .filter((goal) => goal.isSelected)
                .map((goal) => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    domainId={item.id}
                    onProgressChange={handleProgressChange}
                  />
                ))}
            </View>
          )}
          style={{ flex: 1, backgroundColor: theme.colors.blueLight }}
        />
      </View>

      <View style={styles.footerContainer}>
        <Pressable style={styles.button} onPress={handleBack}>
          <AppText bold>Quay lại</AppText>
        </Pressable>
        <Pressable style={styles.button} onPress={handleContinue}>
          <AppText style={{ color: theme.colors.primary }} bold>
            {`Tiếp tục `}
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
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  labelContainer: {
    position: "absolute",
    top: -30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    width: 40,
  },
  labelText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "bold",
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
