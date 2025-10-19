import React, { useState, useMemo, useCallback, useEffect } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { theme } from "@/theme";
import { View } from "@/components/Themed";
import { CustomSearchBar } from "@/components/SearchBar";
import { StudentList } from "@/components/StudentList";
import MOCK_STUDENTS from "@assets/fake_data/student";
import { Student } from "@/types/student";
import AppText from "@/components/AppText";

const Search = () => {
  const [search, setSearch] = useState("");
  const [student, setStudent] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate data fetching
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Simulating network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setStudent(MOCK_STUDENTS);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter students based on search text
  const filteredStudents = useMemo(() => {
    if (!search.trim()) {
      return student;
    }

    const searchLower = search.toLowerCase();
    return student.filter((item) =>
      item.name.toLowerCase().includes(searchLower)
    );
  }, [search, student]);

  // Handle student selection
  const handleStudentPress = useCallback((selectedStudent: Student) => {
    console.log("Selected student:", selectedStudent.name);
    // TODO: Navigate to student detail or add to report
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <AppText style={{ color: theme.colors.error }}>{error.message}</AppText>
      </View>
    );
  }

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
        ListEmptyComponent={<AppText>Student not found</AppText>}
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
