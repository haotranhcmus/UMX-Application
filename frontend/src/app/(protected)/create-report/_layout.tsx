import AppText from "@/components/AppText";
import { Stack, router } from "expo-router";
import Icon from "@expo/vector-icons/AntDesign";
import { Pressable } from "react-native";
import { theme } from "@/theme";
import { ROUTES } from "@/constants/routes";

export default function CreateReportLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="index"
        options={{
          headerLeft: () => (
            <Pressable
              onPress={() => {
                // Handle back navigation
                router.push(ROUTES.APP.HOME);
              }}
              style={{ marginHorizontal: 8 }}
            >
              <Icon name="left" size={24} color="black" />
            </Pressable>
          ),
          headerRight: () => (
            <AppText style={{ marginRight: 16 }}>
              {new Date().toLocaleDateString("vi-VN")}
            </AppText>
          ),
          headerTitle: () => (
            <AppText bold style={{ fontSize: 18 }}>
              Tạo báo cáo
            </AppText>
          ),
          headerStyle: {
            backgroundColor: theme.colors.backgroundLight,
          },
        }}
      />
      <Stack.Screen name="[studentId]" options={{ headerShown: false }} />
    </Stack>
  );
}
