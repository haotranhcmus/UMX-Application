import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import AppText from "@/components/AppText";
import { theme } from "@/theme";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { Images } from "@/constants/images";
import Icon from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";

import { ROUTES } from "@/constants/routes";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <WeeklyCalendar
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
      />

      <TouchableOpacity
        style={styles.createReportContainer}
        onPress={() => router.push(ROUTES.APP.CREATE_REPORT)}
      >
        <Image source={Images.createReportImg} style={styles.createReportImg} />
        <AppText style={styles.createReportText} bold>
          Tạo báo cáo học tập
        </AppText>
        <Icon name="right" size={24} color={theme.colors.primary} />
      </TouchableOpacity>

      <Image source={Images.homeScreenImg} style={styles.backgroundImage} />
      <AppText style={styles.reportText} bold>
        Chưa có báo cáo nào được tạo
      </AppText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDateText: {
    marginTop: 20,
    fontSize: 16,
    color: theme.colors.text,
  },
  backgroundImage: {
    resizeMode: "contain",
    width: 280,
    height: 280,
  },
  reportText: {
    marginTop: 20,
    fontSize: 18,
    color: theme.colors.textLight,
    opacity: 0.7,
  },
  createReportImg: {
    resizeMode: "contain",
    width: 30,
    height: 30,
  },
  createReportText: {
    fontSize: 18,
    color: theme.colors.primary,
  },
  createReportContainer: {
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderColor: theme.colors.primary,
    borderWidth: 2,
    padding: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.white,
  },
});
