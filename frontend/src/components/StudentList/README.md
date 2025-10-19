# StudentList Component

## Overview

Component hiển thị danh sách học sinh với tính năng tìm kiếm và selection.

## Components

### StudentList

Component chính để hiển thị danh sách học sinh sử dụng FlatList.

**Props:**

```typescript
interface StudentListProps {
  data: Student[]; // Mảng dữ liệu học sinh
  onStudentPress?: (student: Student) => void; // Callback khi nhấn vào học sinh
  ListEmptyComponent?: React.ReactElement; // Component hiển thị khi rỗng
  ListHeaderComponent?: React.ReactElement; // Header của danh sách
  ListFooterComponent?: React.ReactElement; // Footer của danh sách
}
```

**Features:**

- Performance optimization với `React.memo`, `useCallback`
- Optimized FlatList với `removeClippedSubviews`, `maxToRenderPerBatch`, etc.
- Flexible với custom empty/header/footer components

### StudentListItem

Component con để render từng item trong danh sách.

**Props:**

```typescript
interface StudentListItemProps {
  student: Student; // Thông tin học sinh
  onPress?: () => void; // Callback khi nhấn
}
```

**Features:**

- Memoized để tránh re-render không cần thiết
- TouchableOpacity với activeOpacity
- Display: avatar + tên + chevron icon

## Usage

### Basic Usage

```tsx
import { StudentList } from "@/components/StudentList";

const MyComponent = () => {
  const handleStudentPress = (student) => {
    console.log("Selected:", student.name);
  };

  return <StudentList data={students} onStudentPress={handleStudentPress} />;
};
```

### With Search Filter

```tsx
import { useState, useMemo } from "react";
import { StudentList } from "@/components/StudentList";
import { CustomSearchBar } from "@/components/SearchBar";

const MyComponent = () => {
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    return students.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <>
      <CustomSearchBar value={search} onChangeText={setSearch} />
      <StudentList data={filteredStudents} />
    </>
  );
};
```

### With Empty State

```tsx
<StudentList
  data={filteredStudents}
  ListEmptyComponent={
    <View style={styles.emptyContainer}>
      <Text>Không tìm thấy học sinh</Text>
    </View>
  }
/>
```

## Performance Optimization

### FlatList Settings

- `removeClippedSubviews={true}`: Remove offscreen items
- `maxToRenderPerBatch={10}`: Render 10 items per batch
- `updateCellsBatchingPeriod={50}`: Update every 50ms
- `initialNumToRender={10}`: Initial render count
- `windowSize={10}`: Viewport size multiplier

### Memoization

- `React.memo` cho cả StudentList và StudentListItem
- `useCallback` cho event handlers và renderItem
- `keyExtractor` được memoized

## Best Practices

### 1. Data Structure

Ensure data has consistent structure:

```typescript
interface Student {
  name: string;
  image: any;
  // Add more fields as needed
}
```

### 2. Key Extractor

Sử dụng unique identifier thay vì index:

```typescript
keyExtractor={(item) => item.id || item.name}
```

### 3. Event Handling

Luôn memoize callbacks:

```typescript
const handlePress = useCallback(
  (student) => {
    // Handle selection
  },
  [dependencies]
);
```

### 4. Search Optimization

Sử dụng `useMemo` cho filtered data:

```typescript
const filtered = useMemo(() => {
  return data.filter(condition);
}, [data, condition]);
```

## Customization

### Styling

Override styles bằng cách truyền custom styles vào StudentListItem:

```typescript
// Trong StudentListItem.tsx
<View style={[styles.container, customStyle]}>
```

### Custom Item Component

Tạo custom item component thay thế StudentListItem:

```typescript
const CustomItem = ({ student, onPress }) => (
  // Custom implementation
);

// Trong StudentList, replace renderItem
```

## Migration from Old Code

### Before (Inline FlatList)

```tsx
<FlatList
  data={students}
  renderItem={({ item }) => (
    <TouchableOpacity>
      <View>
        <Image source={item.image} />
        <Text>{item.name}</Text>
      </View>
    </TouchableOpacity>
  )}
/>
```

### After (Component Extraction)

```tsx
<StudentList data={students} onStudentPress={handlePress} />
```

## Benefits

✅ **Code Reusability**: Tái sử dụng ở nhiều nơi
✅ **Maintainability**: Dễ maintain và update
✅ **Testability**: Dễ viết unit tests
✅ **Performance**: Optimized rendering
✅ **Clean Code**: Separation of concerns
✅ **Type Safety**: Full TypeScript support

## Future Improvements

1. **Pagination**: Add infinite scroll
2. **Sorting**: Add sort options
3. **Selection Mode**: Multiple selection
4. **Swipe Actions**: Delete/Edit với swipe
5. **Animations**: Add LayoutAnimation
6. **Accessibility**: Improve a11y support

## Related Components

- `CustomSearchBar`: Search input component
- `AppText`: Text component với custom fonts
- `Themed`: Theme-aware View component
