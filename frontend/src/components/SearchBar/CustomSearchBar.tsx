import React from "react";
import { SearchBar } from "react-native-elements";
import { StyleSheet } from "react-native";

interface CustomSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  lightTheme?: boolean;
}

/**
 * CustomSearchBar - Wrapper component cho SearchBar với styling tùy chỉnh
 *
 * @param value - Giá trị hiện tại của search bar
 * @param onChangeText - Callback khi text thay đổi
 * @param placeholder - Placeholder text
 * @param lightTheme - Sử dụng light theme
 */
export const CustomSearchBar = ({
  value,
  onChangeText,
  placeholder = "Tìm kiếm...",
  lightTheme = true,
}: CustomSearchBarProps) => {
  const handleChangeText = (text: string) => {
    onChangeText(text);
  };
  return (
    <SearchBar
      placeholder={placeholder}
      // @ts-ignore - Type issue with react-native-elements
      onChangeText={handleChangeText}
      value={value}
      containerStyle={styles.container}
      inputContainerStyle={styles.inputContainer}
      lightTheme={lightTheme}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
  },
});
