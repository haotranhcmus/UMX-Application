# DomainGoalsList Component

Hiển thị danh sách các lĩnh vực (domains) và mục tiêu (goals) với chức năng chọn, mở rộng/thu gọn.

## 📦 **Cấu trúc thư mục**

```
DomainGoalsList/
├── index.ts                # Barrel exports
├── ProgressBar.tsx         # Thanh tiến độ tái sử dụng
├── TagList.tsx             # Danh sách nhãn
├── GoalItem.tsx            # Item mục tiêu với checkbox, mô tả, tags, progress
├── DomainItem.tsx          # Header lĩnh vực với expand/collapse
├── SelectAllHeader.tsx     # Header "Chọn tất cả"
└── README.md               # Documentation (file này)
```

## 🎯 **Cách sử dụng**

### Import

```tsx
import DomainGoalsList from "@/components/DomainGoalsList";
// Hoặc import các component con:
import {
  DomainItem,
  GoalItem,
  ProgressBar,
} from "@/components/DomainGoalsList";
```

### Ví dụ cơ bản

```tsx
import DomainGoalsList from "@/components/DomainGoalsList";

function SelectDomainGoalsScreen() {
  const [domains, setDomains] = useState<Domain[]>([...]);

  const handleDomainToggle = (domainId: string, isSelected: boolean) => {
    // Logic chọn/bỏ chọn tất cả goals trong domain
  };

  const handleGoalToggle = (
    domainId: string,
    goalId: string,
    isSelected: boolean
  ) => {
    // Logic chọn/bỏ chọn goal cụ thể
  };

  const handleSelectAll = (isSelected: boolean) => {
    // Logic chọn/bỏ chọn tất cả
  };

  return (
    <DomainGoalsList
      domains={domains}
      onDomainToggle={handleDomainToggle}
      onGoalToggle={handleGoalToggle}
      onSelectAll={handleSelectAll}
    />
  );
}
```

## 📋 **Props**

### DomainGoalsList

| Prop             | Type                                                              | Required | Description                      |
| ---------------- | ----------------------------------------------------------------- | -------- | -------------------------------- |
| `domains`        | `Domain[]`                                                        | ✅       | Danh sách lĩnh vực và mục tiêu   |
| `onDomainToggle` | `(domainId: string, isSelected: boolean) => void`                 | ❌       | Callback khi chọn/bỏ chọn domain |
| `onGoalToggle`   | `(domainId: string, goalId: string, isSelected: boolean) => void` | ❌       | Callback khi chọn/bỏ chọn goal   |
| `onSelectAll`    | `(isSelected: boolean) => void`                                   | ❌       | Callback khi chọn/bỏ chọn tất cả |

### ProgressBar

| Prop              | Type     | Required | Default                | Description                  |
| ----------------- | -------- | -------- | ---------------------- | ---------------------------- |
| `progress`        | `number` | ✅       | -                      | Giá trị tiến độ (0-100)      |
| `height`          | `number` | ❌       | `8`                    | Chiều cao của thanh progress |
| `backgroundColor` | `string` | ❌       | `theme.colors.border`  | Màu nền                      |
| `fillColor`       | `string` | ❌       | `theme.colors.success` | Màu của phần đã hoàn thành   |

### TagList

| Prop        | Type     | Required | Description                    |
| ----------- | -------- | -------- | ------------------------------ |
| `tags`      | `Tag[]`  | ✅       | Mảng các tag cần hiển thị      |
| `tagStyle`  | `object` | ❌       | Custom style cho tag container |
| `textStyle` | `object` | ❌       | Custom style cho tag text      |

### GoalItem

| Prop         | Type                                         | Required | Description                   |
| ------------ | -------------------------------------------- | -------- | ----------------------------- |
| `goal`       | `Goal`                                       | ✅       | Dữ liệu mục tiêu              |
| `domainId`   | `string`                                     | ✅       | ID của domain cha             |
| `isSelected` | `boolean`                                    | ✅       | Trạng thái được chọn hay chưa |
| `onToggle`   | `(domainId: string, goalId: string) => void` | ✅       | Callback khi toggle checkbox  |

### DomainItem

| Prop                 | Type                         | Required | Description                       |
| -------------------- | ---------------------------- | -------- | --------------------------------- |
| `domain`             | `Domain`                     | ✅       | Dữ liệu lĩnh vực                  |
| `isExpanded`         | `boolean`                    | ✅       | Trạng thái mở rộng/thu gọn        |
| `isSelected`         | `boolean`                    | ✅       | Trạng thái tất cả goals được chọn |
| `selectedGoalsCount` | `number`                     | ✅       | Số lượng goals đã được chọn       |
| `onToggleExpand`     | `(domainId: string) => void` | ✅       | Callback khi mở/đóng domain       |
| `onToggleDomain`     | `(domainId: string) => void` | ✅       | Callback khi chọn/bỏ chọn domain  |

### SelectAllHeader

| Prop            | Type         | Required | Description                    |
| --------------- | ------------ | -------- | ------------------------------ |
| `isAllSelected` | `boolean`    | ✅       | Trạng thái tất cả được chọn    |
| `selectedCount` | `number`     | ✅       | Số lượng items đã chọn         |
| `totalCount`    | `number`     | ✅       | Tổng số items                  |
| `onSelectAll`   | `() => void` | ✅       | Callback khi toggle select all |

## 🔧 **Cấu trúc dữ liệu**

```typescript
interface Domain {
  id: string;
  name: string;
  order: number;
  goals: Goal[];
}

interface Goal {
  id: string;
  description: string;
  isSelected: boolean;
  tags: Tag[];
  resultProgress: number; // 0-100
}

interface Tag {
  id: string;
  text: string;
}
```

## 🎨 **Tính năng**

- ✅ **Expand/Collapse**: Mở rộng/thu gọn từng domain
- ✅ **Select All**: Chọn/bỏ chọn tất cả goals
- ✅ **Domain Selection**: Chọn/bỏ chọn tất cả goals trong 1 domain
- ✅ **Goal Selection**: Chọn/bỏ chọn từng goal riêng lẻ
- ✅ **Progress Display**: Hiển thị tiến độ của mỗi goal
- ✅ **Tags Display**: Hiển thị nhãn cho mỗi goal
- ✅ **Animation**: Smooth expand/collapse animation (LayoutAnimation)
- ✅ **Performance**: Tối ưu với React.memo, useCallback, useMemo
- ✅ **Modular**: Chia nhỏ thành nhiều components tái sử dụng

## 📝 **Best Practices**

1. **Tái sử dụng components con**:

   ```tsx
   import { ProgressBar } from "@/components/DomainGoalsList";

   <ProgressBar progress={75} height={10} fillColor="#00AA55" />;
   ```

2. **Sử dụng với FlatList optimization**:

   - Component đã sử dụng React.memo để tránh re-render không cần thiết
   - Callbacks được memoized với useCallback

3. **State management**:
   - Parent component giữ state của domains
   - Callbacks để update state từ child components

## 🐛 **Lưu ý**

- **New Architecture**: LayoutAnimation có thể không hoạt động trên React Native New Architecture
- **Performance**: Với danh sách lớn (>100 items), nên sử dụng VirtualizedList
- **Type Safety**: Đảm bảo domain.goals và goal.tags không null/undefined

## 📚 **Tham khảo**

- Tương tự component `StudentList` trong cùng thư mục
- Sử dụng theme system từ `@/theme`
- Icons từ `@expo/vector-icons`

---

**Tác giả**: UMX Team  
**Ngày tạo**: 2024  
**Version**: 1.0.0
