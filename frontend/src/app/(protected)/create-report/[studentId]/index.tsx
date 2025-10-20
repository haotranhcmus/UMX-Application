import {
  useLocalSearchParams,
  Stack,
  router,
  useFocusEffect,
} from "expo-router";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AppText from "@/components/AppText";
import { useEffect, useState, useCallback } from "react";
import { Student } from "@/types/student";
import MOCK_STUDENTS from "@assets/fake_data/student";
import StarRating from "@/components/StarRating";
import { theme } from "@/theme";
import Icon from "@expo/vector-icons/AntDesign";
import { SafeAreaView } from "react-native-safe-area-context";
import GreenButton from "@/components/GreenButton";
import Ionicons from "@expo/vector-icons/build/Ionicons";

import { ROUTES } from "@/constants/routes";
import { useDomain } from "@/providers/DomainProvider";

import { GoalItem } from "@/components/DomainGoalsList/GoalItem";

export default function CreateReportScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [rating, setRating] = useState(0);
  const { domains, setDomains } = useDomain();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleExit = () => {
    router.replace(ROUTES.APP.HOME);
  };

  const handleCancelReport = () => {
    router.replace(ROUTES.APP.CREATE_REPORT);
  };

  // Reset button state when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      setIsButtonDisabled(false);
    }, [])
  );

  useEffect(() => {
    // Simulate data fetching
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Simulating network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setStudent(MOCK_STUDENTS.find((s) => s.id === studentId) || null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen
          options={{
            headerLeft: () => (
              <View style={styles.imageContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ),
            headerTitle: () => (
              <View>
                <AppText style={styles.name} bold>
                  Đang tải...
                </AppText>
                <AppText>{new Date().toLocaleDateString()}</AppText>
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
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.backgroundLight },
          }}
        />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <AppText style={styles.errorText}>Error: {error.message}</AppText>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.centerContainer}>
        <AppText>No student found.</AppText>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Image source={student.image} style={styles.imageContainer} />
          ),
          headerTitle: () => (
            <View>
              <AppText style={styles.name} bold>
                {student.name}
              </AppText>
              <AppText>{new Date().toLocaleDateString()}</AppText>
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
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.backgroundLight },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ratingContainer}>
          <View style={styles.titleContainer}>
            <AppText style={{ fontSize: 20 }} bold>
              Mức độ tham gia
            </AppText>
            <Icon
              name="question-circle"
              size={16}
              color={theme.colors.white}
              style={{
                backgroundColor: theme.colors.info,
                marginLeft: 8,
                borderRadius: 20,
              }}
            />
          </View>
          <AppText style={styles.label}>
            Mức độ chủ động, hợp tác, tập trung của con là:{" "}
          </AppText>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            maxStars={5}
            starSize={40}
            starColor={theme.colors.yellow}
            unratedStarColor={theme.colors.gray}
            showRating={false}
          />
        </View>

        {/* Button Cancel */}
        <View style={styles.cancelContainer}>
          <TouchableOpacity
            style={{ marginTop: theme.layout.spacing.md }}
            onPress={handleCancelReport}
          >
            <AppText style={{ color: theme.colors.error }}>
              <Ionicons
                name="trash"
                size={theme.layout.spacing.lg}
                color={theme.colors.error}
              />{" "}
              Hủy báo cáo
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.feedbackContainer}>
          <AppText style={styles.feedbackText}>
            {domains.length > 0 ? "Có dữ liệu" : "Không có dữ liệu"}
          </AppText>
          <View>
            {domains.map((domain) =>
              domain.goals.map(
                (goal) =>
                  goal.isSelected && (
                    <GoalItem
                      key={goal.id}
                      goal={goal}
                      domainId={domain.id}
                      isSelected={goal.isSelected}
                      onToggle={() => {}}
                    />
                  )
              )
            )}
          </View>
        </View>
      </ScrollView>
      <GreenButton
        title="Báo cáo kết quả của mục tiêu"
        onPress={() => {
          setIsButtonDisabled(true);
          router.push(`/create-report/${student.id}/select-domain-goals`);
        }}
        style={{ margin: theme.layout.spacing.lg }}
        disabled={isButtonDisabled}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.blueLight,
    justifyContent: "space-between",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: theme.colors.blueLight,
  },
  content: {
    padding: theme.layout.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    marginBottom: theme.layout.spacing.lg,
    fontWeight: "bold",
  },
  infoContainer: {
    marginBottom: theme.layout.spacing.lg,
    padding: theme.layout.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    marginBottom: theme.layout.spacing.xs,
  },
  value: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  ratingContainer: {
    padding: theme.layout.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: theme.layout.spacing.md,
  },
  feedbackContainer: {
    padding: theme.layout.spacing.md,
    backgroundColor: theme.colors.blueLight,
    borderRadius: 8,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.md,
  },
  name: {
    fontSize: theme.typography.fontSizes.lg,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.layout.spacing.md,
    justifyContent: "space-between",
    width: "100%",
  },
  cancelContainer: {
    alignItems: "center",
  },
});
