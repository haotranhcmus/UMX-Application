# 📱 UMX - Tài Liệu Frontend (Tiếng Việt)

**Dự án:** UMX - Hệ Thống Quản Lý Can Thiệp Học Sinh  
**Ngày:** 21 tháng 10, 2025  
**Phiên bản:** 1.0  
**Mục đích:** Hướng dẫn chi tiết frontend cho developers

---

## 📋 Mục Lục

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Cấu Trúc Project](#2-cấu-trúc-project)
3. [Luồng Hoạt Động Chính](#3-luồng-hoạt-động-chính)
4. [Danh Sách Màn Hình](#4-danh-sách-màn-hình)
5. [Thiết Kế Components](#5-thiết-kế-components)
6. [Quản Lý State](#6-quản-lý-state)
7. [Navigation & Routing](#7-navigation--routing)
8. [UI/UX Guidelines](#8-uiux-guidelines)
9. [Performance & Optimization](#9-performance--optimization)
10. [Testing Strategy](#10-testing-strategy)

---

## 1. Tổng Quan Hệ Thống

### 🎯 Mục Đích

UMX là ứng dụng mobile giúp giáo viên ABA quản lý học sinh tự kỷ và phụ huynh theo dõi tiến độ con em.

### 👥 Người Dùng

**1. Giáo Viên / Admin:**

- Quản lý học sinh (CRUD)
- Tạo và gán mục tiêu can thiệp
- Tạo báo cáo tiến độ hàng tuần
- Theo dõi thống kê tổng quan

**2. Phụ Huynh:**

- Xem thông tin con
- Xem báo cáo tiến độ
- Theo dõi mục tiêu
- Nhận thông báo

### 🎨 Tech Stack

**Framework:** React Native + Expo SDK 54  
**Router:** Expo Router v6 (file-based routing)  
**UI:** NativeWind (Tailwind CSS for React Native)  
**State Management:** Context API + Zustand  
**Forms:** React Hook Form  
**Icons:** Expo Icons  
**Fonts:** Open Sans, Roboto  
**Charts:** react-native-chart-kit  
**Storage:** AsyncStorage  
**Notifications:** expo-notifications

---

## 2. Cấu Trúc Project

### 📁 Folder Structure

```
frontend/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout
│   ├── +html.tsx                # HTML wrapper
│   ├── +not-found.tsx           # 404 screen
│   ├── (auth)/                  # Authentication screens
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx          # Landing page
│   │   ├── login.tsx            # Login screen
│   │   ├── register.tsx         # Register screen
│   │   └── forgot-password.tsx
│   ├── (protected)/             # Protected screens (after login)
│   │   ├── _layout.tsx          # Tab navigation
│   │   ├── index.tsx            # Dashboard
│   │   ├── students/
│   │   │   ├── index.tsx        # Students list
│   │   │   └── [id].tsx         # Student detail
│   │   ├── reports/
│   │   │   ├── index.tsx        # Reports list
│   │   │   └── [id].tsx         # Report detail
│   │   ├── create-report/
│   │   │   ├── _layout.tsx      # Multi-step layout
│   │   │   ├── step1.tsx        # Basic info
│   │   │   ├── step2.tsx        # Select goals
│   │   │   ├── step3.tsx        # Record progress
│   │   │   └── step4.tsx        # Review
│   │   ├── goals/
│   │   │   ├── select-domain.tsx
│   │   │   ├── templates.tsx
│   │   │   └── preview.tsx
│   │   └── profile.tsx
│   └── (parent)/                # Parent portal screens
│       ├── _layout.tsx
│       ├── dashboard.tsx
│       ├── children/
│       │   ├── index.tsx
│       │   └── [id].tsx
│       ├── reports/
│       │   └── [id].tsx
│       └── notifications.tsx
│
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Rating.tsx
│   │   └── Modal.tsx
│   ├── forms/                   # Form components
│   │   ├── FormInput.tsx
│   │   ├── FormSelect.tsx
│   │   ├── FormDatePicker.tsx
│   │   └── FormSlider.tsx
│   ├── student/                 # Student-related components
│   │   ├── StudentCard.tsx
│   │   ├── StudentList.tsx
│   │   └── StudentStats.tsx
│   ├── goal/                    # Goal-related components
│   │   ├── GoalCard.tsx
│   │   ├── GoalProgressBar.tsx
│   │   └── DomainCard.tsx
│   ├── report/                  # Report-related components
│   │   ├── ReportCard.tsx
│   │   ├── ReportSummary.tsx
│   │   └── GoalProgressTable.tsx
│   └── shared/                  # Shared components
│       ├── Header.tsx
│       ├── TabBar.tsx
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       └── ErrorBoundary.tsx
│
├── hooks/                        # Custom hooks
│   ├── useAuth.ts
│   ├── useStudents.ts
│   ├── useGoals.ts
│   ├── useReports.ts
│   └── useNotifications.ts
│
├── providers/                    # Context providers
│   ├── AuthProvider.tsx
│   ├── ThemeProvider.tsx
│   └── NotificationProvider.tsx
│
├── services/                     # API services
│   ├── api.ts                   # Base API config
│   ├── authService.ts
│   ├── studentService.ts
│   ├── goalService.ts
│   └── reportService.ts
│
├── store/                        # Zustand stores
│   ├── authStore.ts
│   ├── studentStore.ts
│   └── reportStore.ts
│
├── types/                        # TypeScript types
│   ├── Student.ts
│   ├── Goal.ts
│   ├── Report.ts
│   └── User.ts
│
├── utils/                        # Utility functions
│   ├── formatDate.ts
│   ├── calculateProgress.ts
│   ├── validation.ts
│   └── storage.ts
│
├── constants/                    # Constants
│   ├── Colors.ts
│   ├── images.ts
│   ├── routes.ts
│   └── config.ts
│
├── theme/                        # Theme configuration
│   ├── colors.ts
│   ├── typography.ts
│   └── layout.ts
│
└── assets/                       # Static assets
    ├── images/
    ├── fonts/
    └── icons/
```

---

## 3. Luồng Hoạt Động Chính

### 🔐 Luồng Authentication

```
[App Launch]
    ↓
[Check AsyncStorage for token]
    ↓
├─ Token hợp lệ → [Navigate to Dashboard]
└─ Không có token → [Navigate to Welcome Screen]
    ↓
[Welcome Screen]
    ↓
├─ Click "Đăng nhập" → [Login Screen]
│   ↓
│   [Nhập email/password]
│   ↓
│   [Gọi API /auth/login]
│   ↓
│   ├─ Success:
│   │   1. Lưu token vào AsyncStorage
│   │   2. Lưu user info vào AuthStore
│   │   3. Navigate to Dashboard
│   └─ Error:
│       Hiển thị thông báo lỗi
│
└─ Click "Đăng ký" → [Register Screen]
    [Tương tự Login]
```

---

### 🎯 Luồng Tạo Mục Tiêu (Create Goal)

```
[Dashboard/Students List]
    ↓
[Chọn học sinh]
    ↓
[Student Detail Screen]
    ↓
[Tab: Goals]
    ↓
[Click "Add Goal" button]
    ↓
[Select Domain Screen]
├─ Hiển thị 7 domains (Imitation, Language, etc.)
├─ Mỗi domain có icon, màu sắc, số lượng templates
└─ Click domain → Navigate to Goal Templates List
    ↓
[Goal Templates List Screen]
├─ Hiển thị danh sách templates theo domain đã chọn
├─ Có filters: Difficulty, Search
├─ Hiển thị tags cho mỗi template
└─ Click template → Navigate to Goal Preview
    ↓
[Goal Preview Screen]
├─ Hiển thị đầy đủ thông tin template
├─ Similar goals warning (nếu có)
└─ Actions:
    ├─ Cancel → Back
    ├─ Quick Assign → Gán với cấu hình mặc định
    └─ Customize → Navigate to Edit Goal Details
        ↓
[Edit Goal Details Screen]
├─ Input:
│   ├─ Target Progress (slider 50-100%)
│   ├─ Start Date (date picker)
│   ├─ Target End Date (optional)
│   └─ Notes (textarea)
├─ Validation real-time
└─ Save button
    ↓
[Gọi API POST /students/:id/goals]
    ↓
├─ Success:
│   1. Show success toast
│   2. Navigate back to Student Detail
│   3. Refresh goals list
└─ Error:
    Hiển thị error message
```

---

### 📝 Luồng Tạo Báo Cáo (Create Report)

```
[Dashboard/Students List/Reports List]
    ↓
[Chọn "Create Report"]
    ↓
[Chọn học sinh (nếu chưa chọn)]
    ↓
=== STEP 1: Basic Information ===
[Create Report - Step 1]
├─ Hiển thị thông tin học sinh (avatar, name, age)
├─ Input fields:
│   ├─ Session Date (date picker, default: hôm nay)
│   ├─ Duration (number input, default: 60 phút)
│   ├─ Rating (star rating 1-5)
│   └─ Participation Level (select dropdown)
├─ Real-time validation
└─ Next button (disabled nếu invalid)
    ↓
[Click Next]
    ↓
[Gọi API GET /students/:id/goals để load active goals]
    ↓
=== STEP 2: Select Goals ===
[Create Report - Step 2]
├─ Hiển thị active goals grouped by domain
├─ Mỗi goal có checkbox + info:
│   ├─ Description
│   ├─ Current progress bar
│   ├─ Last session progress
│   └─ Days since last practice
├─ "Select All" per domain
├─ Validation: Phải chọn ít nhất 1 goal
└─ Next button
    ↓
[Click Next]
    ↓
=== STEP 3: Record Progress ===
[Create Report - Step 3]
├─ Swipeable cards (1 goal per card)
├─ Progress indicator: "Goal 1 of 5"
├─ Mỗi card:
│   ├─ Goal description
│   ├─ Domain badge
│   ├─ Before/After progress comparison
│   ├─ Mini chart (last 5 sessions)
│   └─ Input fields:
│       ├─ Progress slider (0-100%)
│       ├─ Support Level (select)
│       ├─ Observations (textarea)
│       └─ Notes (textarea)
├─ Auto-save draft on blur
├─ Navigation:
│   ├─ Previous Goal
│   ├─ Next Goal
│   ├─ Skip Goal
│   └─ Back to Step 2
└─ "Save & Review" button (khi hoàn thành tất cả goals)
    ↓
[Click Save & Review]
    ↓
=== STEP 4: Review ===
[Create Report - Step 4]
├─ Display sections:
│   ├─ Session Summary (date, duration, rating)
│   ├─ Goals Progress Table
│   ├─ General Notes (textarea)
│   └─ Recommendations (textarea)
├─ Statistics:
│   ├─ Total goals: X
│   ├─ Avg progress change: +Y%
│   └─ Goals completed: Z
├─ Edit buttons per section → Navigate back to respective step
└─ Final actions:
    ├─ Save as Draft → POST /reports (status: 'draft')
    └─ Submit Report → POST /reports (status: 'submitted')
        ↓
[Gọi API POST /reports]
    ↓
├─ Success:
│   1. Show success toast
│   2. Nếu status = 'submitted':
│      - Gửi notifications cho phụ huynh
│      - Update student goals progress
│   3. Navigate to Report Detail
└─ Error:
    Hiển thị error message
```

---

### 👨‍👩‍👧 Luồng Phụ Huynh Xem Báo Cáo

```
[Parent App Launch]
    ↓
[Check AsyncStorage for parent token]
    ↓
├─ Có token → [Parent Dashboard]
└─ Không có → [Parent Login Screen]
    ↓
[Parent Login]
├─ Input: Email + Password
├─ Gọi API POST /parent/auth/login
└─ Success → Save token → Navigate to Dashboard
    ↓
[Parent Dashboard Screen]
├─ Hiển thị:
│   ├─ Welcome message
│   ├─ Quick stats (children, reports, notifications)
│   ├─ Recent reports (với unread badges)
│   ├─ Recent achievements
│   └─ Quick actions
├─ Pull to refresh
└─ Navigation options:
    ├─ View All Children → [Children List]
    ├─ View All Reports → [All Reports]
    ├─ Notifications (với badge) → [Notifications Screen]
    └─ Profile → [Parent Profile]
        ↓
[Children List Screen]
├─ Hiển thị danh sách con
├─ Mỗi child card:
│   ├─ Avatar, name, age
│   ├─ Teacher info
│   ├─ Stats (goals, reports, avg rating)
│   └─ Unread reports badge
└─ Click child → Navigate to Child Detail
    ↓
[Child Detail Screen]
├─ Tabs:
│   ├─ Overview
│   │   ├─ Basic info
│   │   ├─ Teacher contact
│   │   └─ Summary stats
│   ├─ Goals
│   │   ├─ Active goals list
│   │   ├─ Progress bars
│   │   └─ Click goal → Goal Detail Modal
│   ├─ Reports
│   │   ├─ Reports list
│   │   └─ Click report → Navigate to Report Detail
│   └─ Progress
│       ├─ Charts
│       └─ Timeline
└─ Actions: Call teacher, Message teacher
    ↓
[Report Detail Screen (Parent View)]
├─ Auto record view trong report_views table
├─ Display sections:
│   ├─ Header (student, date, rating, teacher)
│   ├─ Session info card
│   ├─ Goals progress table (grouped by domain)
│   │   └─ Click goal → Expand observations
│   ├─ Teacher's notes
│   └─ Recommendations
├─ Summary stats
└─ Actions:
    ├─ Export PDF → Generate + Download
    ├─ Share → WhatsApp/Email/etc
    └─ Print
        ↓
[Notifications Screen]
├─ Tabs: All / Unread
├─ List notifications:
│   ├─ Icon by type
│   ├─ Title + message
│   ├─ Timestamp
│   └─ Unread indicator
├─ Click notification:
│   1. Mark as read (API PUT /parent/notifications/:id/read)
│   2. Navigate to related entity
└─ Actions:
    ├─ Swipe: Mark read/Delete
    └─ Bulk: Mark all as read
```

---

## 4. Danh Sách Màn Hình

### 🔐 Authentication Screens (Giáo Viên)

#### 1. Welcome Screen

- **Route:** `/welcome`
- **Layout:** Full screen
- **Nội dung:**
  - Logo UMX
  - Tagline: "Hệ Thống Quản Lý Can Thiệp ABA"
  - Button "Đăng nhập"
  - Button "Đăng ký"
  - Link "Quên mật khẩu"

#### 2. Login Screen

- **Route:** `/login`
- **Form Fields:**
  - Email (email input, autocomplete)
  - Password (password input, show/hide toggle)
  - Remember me (checkbox)
- **Actions:**
  - Submit button
  - Link "Quên mật khẩu"
  - Link "Đăng ký tài khoản mới"
- **Validation:**
  - Email format
  - Password required

#### 3. Register Screen

- **Route:** `/register`
- **Form Fields:**
  - Full Name
  - Email
  - Phone
  - Password
  - Confirm Password
- **Actions:**
  - Submit button
  - Link "Đã có tài khoản? Đăng nhập"

#### 4. Forgot Password Screen

- **Route:** `/forgot-password`
- **Form Fields:**
  - Email
- **Actions:**
  - Send reset link button
  - Back to login

---

### 📱 Main Screens (Giáo Viên)

#### 5. Dashboard Screen

- **Route:** `/` hoặc `/(protected)/index`
- **Layout:** Scroll view
- **Sections:**
  1. Header: Welcome message + Avatar
  2. Quick Stats Cards (4 cards):
     - Tổng học sinh
     - Báo cáo tuần này
     - Goals cần cập nhật
     - Avg rating
  3. Recent Reports List (5 items)
  4. Students Need Attention
  5. Quick Actions FAB

#### 6. Students List Screen

- **Route:** `/(protected)/students`
- **Layout:**
  - Header với search bar
  - Filters chips (Status, Sort)
  - FlatList of StudentCard
- **StudentCard:**
  - Avatar + Name + Age
  - Student Code
  - Teacher name
  - Stats row (Goals, Reports, Rating)
  - Quick action buttons

#### 7. Student Detail Screen

- **Route:** `/(protected)/students/[id]`
- **Layout:**
  - Header: Student info + Edit button
  - Tab Navigator:
    - Overview Tab
    - Goals Tab (với Add Goal FAB)
    - Reports Tab (với Create Report button)
- **Overview Tab:**
  - Basic info card
  - Medical notes card (expandable)
  - Parent contact card
  - Recent activity timeline
- **Goals Tab:**
  - Active goals list (grouped by domain)
  - Completed goals (collapsible)
  - Progress chart
  - Add Goal FAB
- **Reports Tab:**
  - Reports timeline
  - Filters (Date range)
  - Create Report button

#### 8. Select Domain Screen

- **Route:** `/(protected)/goals/select-domain`
- **Layout:**
  - Header: "Chọn Lĩnh Vực"
  - Grid of DomainCard (2 columns)
- **DomainCard:**
  - Large icon (colored)
  - Domain name
  - Description
  - Templates count badge

#### 9. Goal Templates List Screen

- **Route:** `/(protected)/goals/templates?domainId=xxx`
- **Layout:**
  - Header: Domain name + Back button
  - Search bar
  - Filter chips (Difficulty, Show assigned)
  - List of GoalTemplateCard
- **GoalTemplateCard:**
  - Description (truncated)
  - Difficulty badge
  - Tags row
  - "Already assigned" indicator (if applicable)

#### 10. Goal Preview Screen

- **Route:** `/(protected)/goals/preview?templateId=xxx`
- **Layout:**
  - Scroll view
  - Full description
  - Domain info
  - Tags (grouped by category)
  - Difficulty & age range
  - Similar goals warning
  - Actions:
    - Cancel button
    - Customize button
    - Quick Assign button

#### 11. Edit Goal Details Screen

- **Route:** `/(protected)/goals/edit?templateId=xxx&studentId=xxx`
- **Layout:**
  - Header: Goal description (truncated)
  - Form fields:
    - Target Progress (slider with value display)
    - Start Date (date picker)
    - Target End Date (date picker, optional)
    - Notes (textarea)
  - Preview section (calculated timeline)
  - Actions:
    - Cancel
    - Save

#### 12-15. Create Report Screens (Steps 1-4)

- **Routes:**
  - Step 1: `/(protected)/create-report/step1?studentId=xxx`
  - Step 2: `/(protected)/create-report/step2`
  - Step 3: `/(protected)/create-report/step3`
  - Step 4: `/(protected)/create-report/step4`
- **Layout:** Multi-step form với progress indicator ở top
- **Chi tiết:** Xem section "Luồng Tạo Báo Cáo"

#### 16. Report Detail Screen (Teacher)

- **Route:** `/(protected)/reports/[id]`
- **Layout:**
  - Header: Student info + Date + Status
  - Session info card
  - Goals progress table
  - Observations per goal (expandable)
  - Teacher's notes
  - Recommendations
  - Parent views stats (if submitted)
  - Actions menu:
    - Edit (if draft)
    - Delete (if draft)
    - Export PDF
    - Share

---

### 👨‍👩‍👧 Parent Portal Screens

#### 17. Parent Login Screen

- **Route:** `/(parent)/login`
- **Layout:** Similar to teacher login
- **Note:** Branding khác (parent-focused)

#### 18. Parent Dashboard Screen

- **Route:** `/(parent)/dashboard`
- **Layout:**
  - Header: Welcome + Avatar
  - Quick stats cards
  - Recent reports list (với unread badges)
  - Recent achievements
  - Quick actions

#### 19. Children List Screen (Parent)

- **Route:** `/(parent)/children`
- **Layout:**
  - Header: "Con Em"
  - List of ChildCard
- **ChildCard:**
  - Avatar + Name + Age
  - Student Code
  - Teacher info với contact buttons
  - Stats (Goals, Reports, Avg rating)
  - Unread reports badge

#### 20. Child Detail Screen (Parent)

- **Route:** `/(parent)/children/[id]`
- **Layout:**
  - Header: Child info
  - Tab Navigator:
    - Overview Tab
    - Goals Tab
    - Reports Tab
    - Progress Tab

#### 21. Report Detail Screen (Parent)

- **Route:** `/(parent)/reports/[id]`
- **Layout:**
  - Beautiful, clean layout
  - Header: Student + Date + Rating + Teacher
  - Session info card
  - Goals progress (grouped by domain, expandable)
  - Teacher's notes
  - Recommendations
  - Summary stats
  - Actions:
    - Export PDF
    - Share
    - Print

#### 22. Notifications Screen (Parent)

- **Route:** `/(parent)/notifications`
- **Layout:**
  - Tabs: All / Unread
  - List of NotificationCard
- **NotificationCard:**
  - Icon (based on type)
  - Title + Message
  - Timestamp
  - Unread indicator
  - Swipe actions (Mark read, Delete)

---

## 5. Thiết Kế Components

### 🎨 Base UI Components

#### Button Component

**Props:**

```typescript
interface ButtonProps {
  variant: "primary" | "secondary" | "outline" | "ghost";
  size: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  iconPosition?: "left" | "right";
  onPress: () => void;
  children: ReactNode;
}
```

**Variants:**

- **Primary:** Background blue, white text
- **Secondary:** Background gray, dark text
- **Outline:** Border only, transparent bg
- **Ghost:** No border, transparent bg

#### Input Component

**Props:**

```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  type?: "text" | "email" | "password" | "number" | "phone";
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}
```

**States:**

- Default
- Focused (blue border)
- Error (red border + error message)
- Disabled (gray bg)

#### Card Component

**Props:**

```typescript
interface CardProps {
  variant?: "elevated" | "outlined" | "filled";
  padding?: "none" | "sm" | "md" | "lg";
  onPress?: () => void;
  children: ReactNode;
}
```

#### ProgressBar Component

**Props:**

```typescript
interface ProgressBarProps {
  value: number; // 0-100
  max?: number; // default 100
  color?: string;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
}
```

**Visual:**

- Background: Light gray
- Fill: Colored (domain color or custom)
- Label: "65%" hoặc "65/80"
- Animation: Smooth transition

#### Rating Component

**Props:**

```typescript
interface RatingProps {
  value: number; // 1-5
  max?: number; // default 5
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  onValueChange?: (value: number) => void;
}
```

**Visual:**

- Star icons (filled/outlined)
- Yellow color
- Sizes: sm=16px, md=24px, lg=32px

---

### 🎯 Domain-Specific Components

#### StudentCard Component

**Props:**

```typescript
interface StudentCardProps {
  student: Student;
  onPress: () => void;
  onEdit?: () => void;
  onCreateReport?: () => void;
}
```

**Layout:**

```
┌─────────────────────────────────────┐
│ [Avatar] Name, Age                  │
│         Student Code: HS001         │
│         Teacher: Nguyễn Văn A       │
│                                     │
│ 📋 15 Goals  📊 45 Reports  ⭐ 4.2  │
│                                     │
│ [View]  [Edit]  [Create Report]    │
└─────────────────────────────────────┘
```

#### GoalCard Component

**Props:**

```typescript
interface GoalCardProps {
  goal: StudentGoal;
  domain: Domain;
  showProgress?: boolean;
  showActions?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
}
```

**Layout:**

```
┌─────────────────────────────────────┐
│ [Domain Icon] Domain Name           │
│                                     │
│ Goal description here...            │
│                                     │
│ ██████████░░░░░░░░░░ 65%           │
│ Target: 80% | Days active: 15      │
│                                     │
│ [Tags: Repeated goal] [Medium]     │
└─────────────────────────────────────┘
```

#### DomainCard Component

**Props:**

```typescript
interface DomainCardProps {
  domain: Domain;
  templatesCount: number;
  onPress: () => void;
}
```

**Layout:**

```
┌──────────────────┐
│                  │
│   [Large Icon]   │
│                  │
│  Domain Name     │
│  Description...  │
│                  │
│  📋 25 templates │
└──────────────────┘
```

#### ReportCard Component

**Props:**

```typescript
interface ReportCardProps {
  report: Report;
  student: Student;
  teacher: User;
  isUnread?: boolean;
  onPress: () => void;
}
```

**Layout:**

```
┌─────────────────────────────────────┐
│ [Avatar] Student Name    [NEW]      │
│ 20 Oct 2024 • 60 mins              │
│                                     │
│ ⭐⭐⭐⭐☆ Rating: 4                  │
│ Teacher: Nguyễn Văn A               │
│                                     │
│ 5 Goals • Avg +8% progress         │
└─────────────────────────────────────┘
```

#### GoalProgressTable Component

**Props:**

```typescript
interface GoalProgressTableProps {
  reportGoals: ReportGoal[];
  onGoalPress?: (goalId: string) => void;
}
```

**Layout:**

```
┌──────────────────────────────────────────┐
│ IMITATION                                │
├──────────────────────────────────────────┤
│ Child can imitate 3 play actions...     │
│ Before: ██████████░░░░░░░░░░ 60%       │
│ After:  ████████████░░░░░░░░ 65%       │
│ Change: +5% 📈                          │
│ Support: Verbal Prompt                  │
├──────────────────────────────────────────┤
│ [Show Observations] ▼                    │
└──────────────────────────────────────────┘
```

---

### 📝 Form Components

#### FormInput Component

**Purpose:** Wrapper cho Input với React Hook Form integration

**Props:**

```typescript
interface FormInputProps extends InputProps {
  name: string;
  control: Control;
  rules?: ValidationRules;
}
```

#### FormSelect Component

**Props:**

```typescript
interface FormSelectProps {
  name: string;
  label?: string;
  control: Control;
  options: Array<{ label: string; value: string }>;
  rules?: ValidationRules;
}
```

**Visual:** Dropdown/Picker với label

#### FormDatePicker Component

**Props:**

```typescript
interface FormDatePickerProps {
  name: string;
  label?: string;
  control: Control;
  mode?: "date" | "time" | "datetime";
  minimumDate?: Date;
  maximumDate?: Date;
}
```

**Visual:** Button trigger + Modal calendar

#### FormSlider Component

**Props:**

```typescript
interface FormSliderProps {
  name: string;
  label?: string;
  control: Control;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  showValue?: boolean;
}
```

**Visual:**

```
Label                            Value: 65%
├────────●────────────────────────────┤
0                                    100
```

---

## 6. Quản Lý State

### 🔧 Context API

**AuthContext:**

```typescript
interface AuthContextType {
  user: User | Parent | null;
  userType: "teacher" | "parent" | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    type: "teacher" | "parent"
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
```

**Sử dụng:**

- Wrap toàn bộ app trong `<AuthProvider>`
- Check authentication ở \_layout.tsx
- Redirect dựa vào userType

---

### 🗃️ Zustand Stores

**AuthStore:**

```typescript
interface AuthStore {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  clearAuth: () => void;
}
```

**StudentStore:**

```typescript
interface StudentStore {
  // State
  students: Student[];
  selectedStudent: Student | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStudents: () => Promise<void>;
  selectStudent: (id: string) => void;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
}
```

**ReportStore:**

```typescript
interface ReportStore {
  // State
  draftReport: Partial<Report> | null;
  currentStep: number;
  selectedGoals: StudentGoal[];
  goalProgressData: Record<string, GoalProgressInput>;

  // Actions
  initReportDraft: (studentId: string) => void;
  setBasicInfo: (data: ReportBasicInfo) => void;
  setSelectedGoals: (goals: StudentGoal[]) => void;
  setGoalProgress: (goalId: string, data: GoalProgressInput) => void;
  goToStep: (step: number) => void;
  clearDraft: () => void;
  submitReport: () => Promise<void>;
}
```

---

### 🪝 Custom Hooks

**useAuth Hook:**

```typescript
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

**useStudents Hook:**

```typescript
function useStudents(filters?: StudentFilters) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    // Fetch logic
  };

  const refetch = () => fetchStudents();

  return { students, isLoading, error, refetch };
}
```

**useReportForm Hook:**

```typescript
function useReportForm() {
  const store = useReportStore();

  const goToNextStep = () => {
    if (validateCurrentStep()) {
      store.goToStep(store.currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    store.goToStep(store.currentStep - 1);
  };

  return {
    currentStep: store.currentStep,
    draftReport: store.draftReport,
    goToNextStep,
    goToPreviousStep,
    // ...more helpers
  };
}
```

---

## 7. Navigation & Routing

### 📍 Route Structure (Expo Router)

```
app/
├── _layout.tsx              # Root layout (AuthProvider, ThemeProvider)
├── (auth)/
│   ├── _layout.tsx          # Auth stack navigator
│   ├── welcome.tsx          # /welcome
│   ├── login.tsx            # /login
│   └── register.tsx         # /register
├── (protected)/
│   ├── _layout.tsx          # Bottom tabs navigator
│   ├── index.tsx            # / (Dashboard)
│   ├── students/
│   │   ├── index.tsx        # /students
│   │   └── [id].tsx         # /students/123
│   ├── reports/
│   │   ├── index.tsx        # /reports
│   │   └── [id].tsx         # /reports/456
│   └── create-report/
│       ├── _layout.tsx      # Steps layout
│       ├── step1.tsx        # /create-report/step1
│       ├── step2.tsx        # /create-report/step2
│       ├── step3.tsx        # /create-report/step3
│       └── step4.tsx        # /create-report/step4
└── (parent)/
    ├── _layout.tsx          # Parent tabs navigator
    ├── dashboard.tsx        # /parent/dashboard
    ├── children/
    │   ├── index.tsx        # /parent/children
    │   └── [id].tsx         # /parent/children/123
    └── notifications.tsx    # /parent/notifications
```

### 🔒 Protected Routes

**Root Layout (\_layout.tsx):**

```typescript
export default function RootLayout() {
  const { isAuthenticated, userType, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack>
      {!isAuthenticated ? (
        <Stack.Screen name="(auth)" />
      ) : userType === 'teacher' ? (
        <Stack.Screen name="(protected)" />
      ) : (
        <Stack.Screen name="(parent)" />
      )}
    </Stack>
  );
}
```

### 🔗 Navigation Helpers

**Programmatic Navigation:**

```typescript
import { router } from "expo-router";

// Navigate to student detail
router.push(`/students/${studentId}`);

// Navigate with params
router.push({
  pathname: "/create-report/step1",
  params: { studentId: "123" },
});

// Go back
router.back();

// Replace (không thể back)
router.replace("/dashboard");
```

**Linking:**

```typescript
import { Link } from 'expo-router';

<Link href="/students/123" asChild>
  <Pressable>
    <Text>View Student</Text>
  </Pressable>
</Link>
```

---

## 8. UI/UX Guidelines

### 🎨 Design System

**Colors (NativeWind):**

```typescript
const colors = {
  primary: {
    50: "#EFF6FF",
    500: "#3B82F6", // Main blue
    600: "#2563EB",
  },
  success: "#10B981", // Green
  warning: "#F59E0B", // Orange
  error: "#EF4444", // Red
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    500: "#6B7280",
    900: "#111827",
  },
  // Domain colors
  domain: {
    imitation: "#FF6B6B",
    language: "#4ECDC4",
    cognition: "#96CEB4",
    // ...
  },
};
```

**Typography:**

```typescript
const typography = {
  heading1: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "OpenSans-Bold",
  },
  heading2: {
    fontSize: 24,
    fontWeight: "700",
  },
  heading3: {
    fontSize: 20,
    fontWeight: "600",
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "OpenSans-Regular",
  },
  caption: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.gray[500],
  },
};
```

**Spacing:**

- 4px base unit
- Sử dụng: 4, 8, 12, 16, 24, 32, 48, 64

**Border Radius:**

- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px (circle)

---

### ✨ Animations & Transitions

**Sử dụng:**

- Page transitions (slide)
- Card hover/press (scale 0.98)
- Progress bar (smooth width change)
- Success toast (slide up + fade)
- Modal (fade + scale)

**Thư viện:**

- `react-native-reanimated` cho complex animations
- `Animated` API cho simple animations

**Examples:**

```typescript
// Button press
<Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
  ]}
>
  <Text>Press Me</Text>
</Pressable>

// Fade in
const opacity = useSharedValue(0);
useEffect(() => {
  opacity.value = withTiming(1, { duration: 300 });
}, []);
```

---

### 📱 Responsive Design

**Breakpoints:**

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px (Web only)

**Sử dụng:**

```typescript
import { useWindowDimensions } from 'react-native';

function MyComponent() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View className={isMobile ? 'flex-col' : 'flex-row'}>
      {/* Content */}
    </View>
  );
}
```

---

### ♿ Accessibility

**Guidelines:**

1. **Touchable areas:** Minimum 44x44px
2. **Labels:** Tất cả inputs phải có label
3. **Contrast:** Text contrast ratio ≥ 4.5:1
4. **Screen readers:** Add `accessibilityLabel` và `accessibilityHint`
5. **Focus indicators:** Visible focus states

**Example:**

```typescript
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Create new report"
  accessibilityHint="Opens the create report form"
>
  <Text>Create Report</Text>
</Pressable>
```

---

## 9. Performance & Optimization

### ⚡ React Optimization

**1. React.memo:**

```typescript
export const StudentCard = React.memo(({ student, onPress }) => {
  return (
    <Pressable onPress={onPress}>
      {/* Card content */}
    </Pressable>
  );
});
```

**2. useCallback:**

```typescript
const handleStudentPress = useCallback((studentId: string) => {
  router.push(`/students/${studentId}`);
}, []);
```

**3. useMemo:**

```typescript
const filteredStudents = useMemo(() => {
  return students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [students, searchQuery]);
```

**4. FlatList Optimization:**

```typescript
<FlatList
  data={students}
  renderItem={({ item }) => <StudentCard student={item} />}
  keyExtractor={item => item.id}
  // Optimizations
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={21}
  // Optional: Virtual scrolling for large lists
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

### 💾 Data Caching

**AsyncStorage:**

```typescript
// Cache students list
const cacheStudents = async (students: Student[]) => {
  await AsyncStorage.setItem("students", JSON.stringify(students));
};

// Load from cache
const loadCachedStudents = async () => {
  const cached = await AsyncStorage.getItem("students");
  return cached ? JSON.parse(cached) : null;
};

// Strategy: Stale-while-revalidate
const fetchStudents = async () => {
  // 1. Load from cache immediately
  const cached = await loadCachedStudents();
  if (cached) setStudents(cached);

  // 2. Fetch fresh data in background
  const fresh = await api.getStudents();
  setStudents(fresh);
  await cacheStudents(fresh);
};
```

---

### 🖼️ Image Optimization

**Best practices:**

1. Sử dụng WebP format
2. Lazy load images
3. Cache images với `expo-image`
4. Resize trước khi upload

**Example:**

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: student.avatar_url }}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
  style={styles.avatar}
/>
```

---

### 🌐 API Optimization

**1. Request Batching:**

```typescript
// Thay vì gọi từng student
students.forEach((s) => fetchStudentGoals(s.id));

// Gọi 1 lần cho tất cả
fetchMultipleStudentGoals(students.map((s) => s.id));
```

**2. Pagination:**

```typescript
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  if (isLoading || !hasMore) return;

  const newData = await api.getStudents({ page, limit: 20 });
  if (newData.length < 20) setHasMore(false);

  setStudents(prev => [...prev, ...newData]);
  setPage(prev => prev + 1);
};

<FlatList
  data={students}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

**3. Debounce Search:**

```typescript
import { useDebounce } from "@/hooks/useDebounce";

const [searchQuery, setSearchQuery] = useState("");
const debouncedQuery = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedQuery) {
    searchStudents(debouncedQuery);
  }
}, [debouncedQuery]);
```

---

## 10. Testing Strategy

### 🧪 Unit Testing

**Setup:** Jest + React Native Testing Library

**Example:**

```typescript
// StudentCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { StudentCard } from '@/components/student/StudentCard';

describe('StudentCard', () => {
  const mockStudent = {
    id: '1',
    full_name: 'Test Student',
    student_code: 'HS001',
    // ...
  };

  it('renders student info correctly', () => {
    const { getByText } = render(
      <StudentCard student={mockStudent} onPress={() => {}} />
    );

    expect(getByText('Test Student')).toBeTruthy();
    expect(getByText('HS001')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <StudentCard student={mockStudent} onPress={onPress} />
    );

    fireEvent.press(getByTestId('student-card'));
    expect(onPress).toHaveBeenCalledWith(mockStudent.id);
  });
});
```

---

### 🔗 Integration Testing

**Test user flows:**

```typescript
describe('Create Report Flow', () => {
  it('allows teacher to create a report', async () => {
    // 1. Login
    await loginAsTeacher();

    // 2. Navigate to students list
    const { getByText } = render(<App />);
    fireEvent.press(getByText('Students'));

    // 3. Select student
    fireEvent.press(getByText('Test Student'));

    // 4. Click create report
    fireEvent.press(getByText('Create Report'));

    // 5. Fill form step 1
    // ...

    // 6. Submit
    fireEvent.press(getByText('Submit'));

    // 7. Verify success
    await waitFor(() => {
      expect(getByText('Report created successfully')).toBeTruthy();
    });
  });
});
```

---

### 📸 Snapshot Testing

```typescript
import renderer from 'react-test-renderer';

it('matches snapshot', () => {
  const tree = renderer.create(
    <StudentCard student={mockStudent} onPress={() => {}} />
  ).toJSON();

  expect(tree).toMatchSnapshot();
});
```

---

### 🔐 E2E Testing (Optional)

**Setup:** Detox

**Example test:**

```typescript
describe("Report Creation", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it("should create a report successfully", async () => {
    // Login
    await element(by.id("email-input")).typeText("teacher@test.com");
    await element(by.id("password-input")).typeText("password123");
    await element(by.id("login-button")).tap();

    // Navigate and create report
    await element(by.text("Students")).tap();
    await element(by.id("student-1")).tap();
    await element(by.text("Create Report")).tap();

    // Fill form...

    // Submit
    await element(by.id("submit-button")).tap();

    // Verify
    await expect(element(by.text("Report created"))).toBeVisible();
  });
});
```

---

## 📝 Tổng Kết

Đây là tài liệu frontend hoàn chỉnh cho UMX app bằng tiếng Việt, không có code implementation chi tiết nhưng đủ để:

✅ **Hiểu rõ luồng hoạt động** của cả giáo viên và phụ huynh  
✅ **Thiết kế toàn bộ màn hình** với layout và UI components  
✅ **Quản lý state** với Context API + Zustand  
✅ **Navigation structure** với Expo Router  
✅ **UI/UX guidelines** đầy đủ  
✅ **Performance optimization** strategies  
✅ **Testing approach** cho quality assurance

**Các bước tiếp theo:**

1. Setup project với Expo
2. Implement base UI components
3. Setup navigation structure
4. Integrate với backend APIs
5. Implement từng screen theo luồng
6. Testing và optimization
7. Deploy

**Thời gian ước tính:** 8-10 tuần với team 1-2 frontend developers.
