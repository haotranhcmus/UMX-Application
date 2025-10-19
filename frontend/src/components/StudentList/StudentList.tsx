import React, { useCallback } from "react";
import { FlatList, StyleSheet, ListRenderItem } from "react-native";
import { StudentListItem } from "./StudentListItem";

interface Student {
  name: string;
  image: any;
}

interface StudentListProps {
  data: Student[];
  onStudentPress?: (student: Student) => void;
  ListEmptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
}

/**
 * StudentList - Component hiển thị danh sách học sinh
 *
 * @param data - Mảng dữ liệu học sinh
 * @param onStudentPress - Callback khi nhấn vào một học sinh
 * @param ListEmptyComponent - Component hiển thị khi danh sách rỗng
 * @param ListHeaderComponent - Component hiển thị ở đầu danh sách
 * @param ListFooterComponent - Component hiển thị ở cuối danh sách
 */
export const StudentList = React.memo(
  ({
    data,
    onStudentPress,
    ListEmptyComponent,
    ListHeaderComponent,
    ListFooterComponent,
  }: StudentListProps) => {
    const handleStudentPress = useCallback(
      (student: Student) => {
        onStudentPress?.(student);
      },
      [onStudentPress]
    );

    const renderItem: ListRenderItem<Student> = useCallback(
      ({ item }) => (
        <StudentListItem
          student={item}
          onPress={() => handleStudentPress(item)}
        />
      ),
      [handleStudentPress]
    );

    const keyExtractor = useCallback((item: Student) => item.name, []);

    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    );
  }
);

StudentList.displayName = "StudentList";

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
});
