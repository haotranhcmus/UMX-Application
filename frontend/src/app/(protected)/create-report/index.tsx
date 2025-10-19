import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet } from "react-native";
import { theme } from "@/theme";
import { View } from "@/components/Themed";
import { CustomSearchBar } from "@/components/SearchBar";
import { StudentList } from "@/components/StudentList";
import student from "@assets/fake_data/student";

const Search = () => {
  const [search, setSearch] = useState("");

  // Filter students based on search text
  const filteredStudents = useMemo(() => {
    if (!search.trim()) {
      return student;
    }

    const searchLower = search.toLowerCase();
    return student.filter((item) =>
      item.name.toLowerCase().includes(searchLower)
    );
  }, [search]);

  // Handle student selection
  const handleStudentPress = useCallback(
    (selectedStudent: { name: string; image: any }) => {
      console.log("Selected student:", selectedStudent.name);
      // TODO: Navigate to student detail or add to report
    },
    []
  );

  return (
    <View style={styles.container}>
      <CustomSearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Tìm kiếm học sinh..."
      />

      <StudentList
        data={filteredStudents}
        onStudentPress={handleStudentPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.blueLight,
    flex: 1,
    paddingTop: 4,
    paddingHorizontal: 8,
  },
});

export default Search;
