import React from "react";
import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { View } from "@/components/Themed";
import AppText from "@/components/AppText";
import Icon from "@expo/vector-icons/AntDesign";
import { theme } from "@/theme";

interface Student {
  name: string;
  image: any;
}

interface StudentListItemProps {
  student: Student;
  onPress?: () => void;
}

/**
 * StudentListItem - Component hiển thị một học sinh trong danh sách
 *
 * @param student - Thông tin học sinh
 * @param onPress - Callback khi nhấn vào item
 */
export const StudentListItem = React.memo(
  ({ student, onPress }: StudentListItemProps) => {
    return (
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.container}>
          <View style={styles.leftContent}>
            <Image source={student.image} style={styles.avatar} />
            <AppText bold>{student.name}</AppText>
          </View>

          <Icon
            name="right"
            size={16}
            style={styles.icon}
            color={theme.colors.primary}
          />
        </View>
      </TouchableOpacity>
    );
  }
);

StudentListItem.displayName = "StudentListItem";

const styles = StyleSheet.create({
  touchable: {
    width: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 8,
    padding: 8,
    borderRadius: 10,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 70,
    aspectRatio: 1,
    marginHorizontal: 8,
    resizeMode: "contain",
  },
  icon: {
    fontWeight: "bold",
  },
});
