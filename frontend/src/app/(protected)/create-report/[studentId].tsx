import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import AppText from "@/components/AppText";

export default function CreateReportScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();

  return (
    // You can use the studentId to fetch or display data related to the student
    <View>
      <AppText>Create Report for Student ID: {studentId}</AppText>
    </View>
  );
}
