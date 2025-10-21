# backend for Hao Tran

# 🗄️ Database Design & API Specification v1.0

**Project:** UMX - Student Intervention Management System  
**Date:** October 21, 2025  
**Version:** 1.0  
**Database:** PostgreSQL / MySQL / MongoDB (Flexible)

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Data Analysis](#data-analysis)
3. [Database Schema](#database-schema)
4. [Entity Relationship Diagram](#entity-relationship-diagram)
5. [API Endpoints](#api-endpoints)
6. [Data Validation Rules](#data-validation-rules)
7. [Migration Strategy](#migration-strategy)
8. [Security Considerations](#security-considerations)

---

## 🎯 System Overview

### Business Requirements

**UMX System** quản lý:

- 👨‍🏫 **Teachers (Users)**: Giáo viên can thiệp ABA
- 👶 **Students**: Học sinh tự kỷ
- 🎯 **Domains & Goals**: Lĩnh vực và mục tiêu can thiệp
- 📊 **Reports**: Báo cáo tiến độ học sinh

### Core Features

1. **User Management**

   - Teacher authentication & authorization
   - Role-based access control (Admin, Teacher)

2. **Student Management**

   - CRUD students
   - Assign students to teachers
   - Track student profile & history

3. **Intervention Goals Management**

   - Predefined domains (Imitation, Language, Cognition, Self-help, etc.)
   - Custom goals for each student
   - Tag system for goal categorization

4. **Report Management**
   - Create progress reports
   - Track goal completion percentage
   - Rating system (1-5 stars)
   - Notes & observations

---

## 📊 Data Analysis

### Current Data Structure Review

#### ✅ **Student** - Quá đơn giản, cần mở rộng

```typescript
// ❌ HIỆN TẠI - Thiếu nhiều thông tin
type Student = {
  id: string;
  name: string;
  image: any;
};

// ✅ NÊN CÓ
type Student = {
  id: string;
  name: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  imageUrl: string | null;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  address: string | null;
  diagnosis: string | null; // Chẩn đoán (ASD, ADHD, etc.)
  enrollmentDate: Date;
  status: "active" | "inactive" | "graduated";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
```

#### ✅ **Domain** - OK, nhưng cần normalize

```typescript
// Domain hiện tại OK
// Nhưng nên tách ra thành:
// 1. domains (template) - Domains có sẵn của hệ thống
// 2. student_domains - Domains được assign cho student cụ thể
```

#### ✅ **Goal** - Cần tách template vs instance

```typescript
// ❌ HIỆN TẠI - Goals mixing template và instance
type Goal = {
  id: string;
  order: number;
  description: string;
  isSelected: boolean; // ← Instance data
  resultProgress: number; // ← Instance data
  tags: Tag[];
};

// ✅ NÊN TÁCH
type GoalTemplate = {
  id: string;
  domainId: string;
  order: number;
  description: string;
  tags: Tag[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type StudentGoal = {
  id: string;
  studentId: string;
  goalTemplateId: string;
  targetProgress: number; // Mục tiêu (VD: 80%)
  currentProgress: number; // Hiện tại
  status: "not_started" | "in_progress" | "completed" | "discontinued";
  startDate: Date;
  endDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
```

#### ✅ **Report** - Cần thêm thông tin

```typescript
// ❌ HIỆN TẠI
interface Report {
  id: string;
  studentId: string;
  domains: Domain[]; // ← Nested data, khó query
  rate: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ NÊN CÓ
interface Report {
  id: string;
  studentId: string;
  teacherId: string; // ← Thêm teacher
  sessionDate: Date; // ← Ngày buổi can thiệp
  rating: number; // 1-5 stars
  participationLevel: string; // 'high' | 'medium' | 'low'
  notes: string | null;
  status: "draft" | "submitted" | "reviewed";
  createdAt: Date;
  updatedAt: Date;
}

// Report sẽ có relationship với ReportGoal
interface ReportGoal {
  id: string;
  reportId: string;
  studentGoalId: string;
  progressRecorded: number; // Progress trong buổi này (0-100%)
  notes: string | null;
  createdAt: Date;
}
```

#### ⚠️ **Issues Found**

1. **Thiếu User/Teacher entity** - Không có bảng user!
2. **Thiếu relationship Student-Teacher** - 1 teacher nhiều students
3. **Domain & Goal mixing template vs instance** - Cần tách riêng
4. **Tag không có bảng riêng** - Hardcoded trong goals
5. **Report không track teacher** - Ai tạo report?
6. **Không có audit trail** - Ai tạo, ai sửa, khi nào?

---

## 🗃️ Database Schema

### Relational Database (PostgreSQL/MySQL)

#### 1. **users** (Teachers/Admin)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'teacher', -- 'admin', 'teacher'
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
);

-- Seed admin user
INSERT INTO users (email, password_hash, full_name, role) VALUES
  ('admin@umx.com', '$2b$10$...', 'Admin User', 'admin');
```

---

#### 2. **students**

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code VARCHAR(50) UNIQUE, -- Mã học sinh (VD: HS001)
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL, -- 'male', 'female', 'other'
  avatar_url VARCHAR(500),

  -- Parent/Guardian Information
  parent_name VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_email VARCHAR(255),
  address TEXT,

  -- Medical Information
  diagnosis VARCHAR(255), -- 'ASD', 'ADHD', 'Autism Spectrum Disorder'
  diagnosis_date DATE,
  medical_notes TEXT,

  -- Enrollment Information
  enrollment_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'graduated', 'on_hold'

  -- Assignment
  primary_teacher_id UUID, -- FK to users

  -- Metadata
  notes TEXT,
  created_by UUID, -- FK to users
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (primary_teacher_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_student_code (student_code),
  INDEX idx_status (status),
  INDEX idx_primary_teacher (primary_teacher_id),
  INDEX idx_full_name (full_name)
);
```

---

#### 3. **student_teachers** (Many-to-Many)

```sql
-- 1 student có thể có nhiều teachers, 1 teacher có nhiều students
CREATE TABLE student_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'primary', -- 'primary', 'assistant', 'consultant'
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID, -- FK to users (who assigned)

  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE KEY unique_student_teacher (student_id, teacher_id),
  INDEX idx_student (student_id),
  INDEX idx_teacher (teacher_id)
);
```

---

#### 4. **domains** (Goal Templates - System-wide)

```sql
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL, -- 'Imitation', 'Expressive Language', etc.
  description TEXT,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  icon VARCHAR(100), -- Icon name for UI
  color VARCHAR(7), -- Hex color for UI (#FF5733)

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_order (order_index),
  INDEX idx_is_active (is_active)
);

-- Seed data
INSERT INTO domains (name, description, order_index, icon, color) VALUES
  ('Imitation', 'Motor and verbal imitation skills', 1, 'copy', '#FF6B6B'),
  ('Expressive Language', 'Communication and expression abilities', 2, 'chat', '#4ECDC4'),
  ('Receptive Language', 'Understanding and following instructions', 3, 'ear', '#45B7D1'),
  ('Cognition', 'Thinking, learning, and problem-solving', 4, 'brain', '#96CEB4'),
  ('Self-Help', 'Daily living and independence skills', 5, 'hands-helping', '#FFEAA7'),
  ('Social Skills', 'Interaction and social understanding', 6, 'users', '#DFE6E9'),
  ('Motor Skills', 'Fine and gross motor development', 7, 'running', '#74B9FF');
```

---

#### 5. **tags** (Goal Tags)

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7), -- Hex color
  category VARCHAR(50), -- 'support_type', 'difficulty', 'skill_type'

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_name (name),
  INDEX idx_category (category)
);

-- Seed data
INSERT INTO tags (name, description, category, color) VALUES
  ('Repeated goal', 'Goal that is repeated from previous cycle', 'status', '#95A5A6'),
  ('Partial physical support', 'Requires partial physical prompting', 'support_type', '#E74C3C'),
  ('Full physical support', 'Requires full physical prompting', 'support_type', '#C0392B'),
  ('Verbal prompt', 'Requires verbal prompting', 'support_type', '#3498DB'),
  ('Modeling', 'Learn through demonstration', 'support_type', '#9B59B6'),
  ('Independent', 'Can perform independently', 'support_type', '#27AE60'),
  ('Easy', 'Easy difficulty level', 'difficulty', '#2ECC71'),
  ('Medium', 'Medium difficulty level', 'difficulty', '#F39C12'),
  ('Hard', 'Hard difficulty level', 'difficulty', '#E67E22');
```

---

#### 6. **goal_templates** (System-wide Goal Templates)

```sql
CREATE TABLE goal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL,
  description TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Difficulty/Category
  difficulty_level VARCHAR(20), -- 'easy', 'medium', 'hard'
  age_range_min INT, -- Tuổi tối thiểu phù hợp
  age_range_max INT, -- Tuổi tối đa phù hợp

  -- Metadata
  created_by UUID, -- FK to users
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_domain (domain_id),
  INDEX idx_is_active (is_active),
  INDEX idx_order (order_index)
);

-- Seed data from MOCK_DOMAINS
INSERT INTO goal_templates (domain_id, description, order_index, difficulty_level) VALUES
  (
    (SELECT id FROM domains WHERE name = 'Imitation' LIMIT 1),
    'Child can imitate 3 play actions with a doll, teddy bear (spoon-feeding, holding a cup to drink, wiping mouth) with 70% success with support',
    1,
    'medium'
  ),
  (
    (SELECT id FROM domains WHERE name = 'Expressive Language' LIMIT 1),
    'Different types of cries for different types of discomfort',
    1,
    'easy'
  ),
  (
    (SELECT id FROM domains WHERE name = 'Cognition' LIMIT 1),
    'Comes after a verbal command (without tools/objects)',
    1,
    'medium'
  );
```

---

#### 7. **goal_template_tags** (Many-to-Many)

```sql
CREATE TABLE goal_template_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_template_id UUID NOT NULL,
  tag_id UUID NOT NULL,

  FOREIGN KEY (goal_template_id) REFERENCES goal_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,

  UNIQUE KEY unique_goal_tag (goal_template_id, tag_id),
  INDEX idx_goal (goal_template_id),
  INDEX idx_tag (tag_id)
);

-- Seed data
INSERT INTO goal_template_tags (goal_template_id, tag_id)
SELECT
  gt.id,
  t.id
FROM goal_templates gt
CROSS JOIN tags t
WHERE gt.description LIKE '%imitate%' AND t.name IN ('Repeated goal', 'Partial physical support');
```

---

#### 8. **student_goals** (Student-specific Goal Instances)

```sql
CREATE TABLE student_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  goal_template_id UUID NOT NULL,

  -- Progress Tracking
  target_progress INT DEFAULT 100, -- Mục tiêu % (VD: 80%)
  current_progress INT DEFAULT 0, -- Tiến độ hiện tại (0-100)

  -- Status
  status VARCHAR(20) DEFAULT 'not_started',
  -- 'not_started', 'in_progress', 'completed', 'discontinued', 'on_hold'

  -- Timeline
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,

  -- Notes
  notes TEXT,
  discontinue_reason TEXT, -- Lý do dừng mục tiêu

  -- Metadata
  created_by UUID, -- FK to users (teacher who assigned)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (goal_template_id) REFERENCES goal_templates(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_start_date (start_date)
);
```

---

#### 9. **reports** (Progress Reports)

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  teacher_id UUID NOT NULL,

  -- Session Information
  session_date DATE NOT NULL, -- Ngày buổi can thiệp
  session_duration INT, -- Thời lượng (phút)

  -- Overall Assessment
  rating INT NOT NULL, -- 1-5 stars (mức độ tham gia)
  participation_level VARCHAR(20), -- 'high', 'medium', 'low'

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'reviewed', 'archived'

  -- Content
  notes TEXT, -- Ghi chú chung
  recommendations TEXT, -- Khuyến nghị

  -- Review (if needed)
  reviewed_by UUID, -- FK to users (admin/supervisor)
  reviewed_at TIMESTAMP,
  review_notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_student (student_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_session_date (session_date),
  INDEX idx_status (status)
);
```

---

#### 10. **report_goals** (Goals trong Report)

```sql
CREATE TABLE report_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL,
  student_goal_id UUID NOT NULL,

  -- Progress Recorded in This Session
  progress_recorded INT NOT NULL, -- 0-100% (kết quả trong buổi này)
  previous_progress INT, -- Progress trước đó (for tracking)

  -- Observations
  notes TEXT,
  observations TEXT,

  -- Prompts/Support Used
  support_level VARCHAR(50), -- 'independent', 'verbal', 'physical', 'full_physical'

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (student_goal_id) REFERENCES student_goals(id) ON DELETE CASCADE,

  UNIQUE KEY unique_report_goal (report_id, student_goal_id),
  INDEX idx_report (report_id),
  INDEX idx_goal (student_goal_id)
);
```

---

#### 11. **activity_logs** (Audit Trail)

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
  entity_type VARCHAR(50) NOT NULL, -- 'student', 'report', 'goal', etc.
  entity_id UUID,
  old_values JSON, -- Old data (for updates)
  new_values JSON, -- New data (for creates/updates)
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_user (user_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

---

## 🔗 Entity Relationship Diagram

```
┌─────────────┐          ┌──────────────────┐          ┌─────────────┐
│    users    │          │     students     │          │   domains   │
│             │          │                  │          │             │
│ • id (PK)   │──────┐   │ • id (PK)        │          │ • id (PK)   │
│ • email     │      │   │ • student_code   │          │ • name      │
│ • full_name │      │   │ • full_name      │          │ • order     │
│ • role      │      │   │ • date_of_birth  │          │ • is_active │
│ • is_active │      │   │ • primary_teacher│──────────┤             │
└─────────────┘      │   │   _id (FK)       │          └─────────────┘
                     │   │ • created_by (FK)│                 │
                     │   └──────────────────┘                 │
                     │            │                            │
                     │            │                            ▼
                     │            │                   ┌──────────────────┐
                     │            │                   │ goal_templates   │
                     │            │                   │                  │
                     │            │                   │ • id (PK)        │
                     │            │                   │ • domain_id (FK) │
                     │            │                   │ • description    │
                     │            │                   │ • difficulty     │
                     │            │                   └──────────────────┘
                     │            │                            │
                     │            │                            │
                     │            ▼                            │
                     │   ┌──────────────────┐                 │
                     │   │ student_teachers │                 │
                     │   │                  │                 │
                     └───│ • student_id (FK)│                 │
                         │ • teacher_id (FK)│                 │
                         │ • role           │                 │
                         └──────────────────┘                 │
                                  │                            │
                                  │                            ▼
                                  │                   ┌──────────────────┐
                                  │                   │  student_goals   │
                                  │                   │                  │
                                  │                   │ • id (PK)        │
                                  ▼                   │ • student_id (FK)│
                         ┌──────────────────┐         │ • goal_template  │
                         │     reports      │         │   _id (FK)       │
                         │                  │         │ • current_progress│
                         │ • id (PK)        │         │ • status         │
                         │ • student_id (FK)│         └──────────────────┘
                         │ • teacher_id (FK)│                 │
                         │ • session_date   │                 │
                         │ • rating         │                 │
                         │ • status         │                 │
                         └──────────────────┘                 │
                                  │                            │
                                  │                            │
                                  ▼                            ▼
                         ┌──────────────────┐         ┌──────────────────┐
                         │  report_goals    │         │       tags       │
                         │                  │         │                  │
                         │ • id (PK)        │         │ • id (PK)        │
                         │ • report_id (FK) │◄────────│ • name           │
                         │ • student_goal   │         │ • category       │
                         │   _id (FK)       │         └──────────────────┘
                         │ • progress       │
                         │   _recorded      │
                         └──────────────────┘

Relationships:
• users (1) ←→ (N) students (via primary_teacher_id)
• users (N) ←→ (N) students (via student_teachers)
• domains (1) ←→ (N) goal_templates
• goal_templates (N) ←→ (N) tags (via goal_template_tags)
• students (1) ←→ (N) student_goals
• goal_templates (1) ←→ (N) student_goals
• students (1) ←→ (N) reports
• users (1) ←→ (N) reports (as teacher)
• reports (1) ←→ (N) report_goals
• student_goals (1) ←→ (N) report_goals
```

---

## 🔌 API Endpoints

### Base URL: `/api/v1`

### Authentication

```
POST   /auth/login           # Login
POST   /auth/logout          # Logout
POST   /auth/refresh-token   # Refresh access token
GET    /auth/me              # Get current user info
```

---

### 1. **Students API**

#### List Students

```http
GET /students
Query Parameters:
  - page: int (default: 1)
  - limit: int (default: 20)
  - search: string (search by name, student_code)
  - status: string (active, inactive, graduated)
  - teacher_id: uuid (filter by teacher)
  - sort_by: string (name, created_at, enrollment_date)
  - sort_order: string (asc, desc)

Response 200:
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "uuid",
        "student_code": "HS001",
        "full_name": "Hào Hổ",
        "date_of_birth": "2018-05-15",
        "gender": "male",
        "avatar_url": "https://...",
        "status": "active",
        "primary_teacher": {
          "id": "uuid",
          "full_name": "Teacher Name"
        },
        "active_goals_count": 5,
        "completed_goals_count": 12,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

#### Get Student by ID

```http
GET /students/:id

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_code": "HS001",
    "full_name": "Hào Hổ",
    "date_of_birth": "2018-05-15",
    "gender": "male",
    "avatar_url": "https://...",
    "parent_name": "Parent Name",
    "parent_phone": "0123456789",
    "parent_email": "parent@email.com",
    "address": "123 Street, City",
    "diagnosis": "Autism Spectrum Disorder",
    "diagnosis_date": "2019-01-01",
    "medical_notes": "...",
    "enrollment_date": "2020-09-01",
    "status": "active",
    "primary_teacher": {
      "id": "uuid",
      "full_name": "Teacher Name",
      "email": "teacher@email.com"
    },
    "all_teachers": [
      {
        "id": "uuid",
        "full_name": "Teacher 1",
        "role": "primary"
      },
      {
        "id": "uuid",
        "full_name": "Teacher 2",
        "role": "assistant"
      }
    ],
    "statistics": {
      "total_goals": 20,
      "active_goals": 5,
      "completed_goals": 12,
      "total_reports": 45,
      "avg_rating": 4.2
    },
    "notes": "...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-10-21T00:00:00Z"
  }
}

Response 404:
{
  "success": false,
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "Student not found"
  }
}
```

#### Create Student

```http
POST /students
Content-Type: application/json

Request Body:
{
  "full_name": "Hào Hổ",
  "date_of_birth": "2018-05-15",
  "gender": "male",
  "parent_name": "Parent Name",
  "parent_phone": "0123456789",
  "parent_email": "parent@email.com",
  "address": "123 Street",
  "diagnosis": "ASD",
  "diagnosis_date": "2019-01-01",
  "enrollment_date": "2020-09-01",
  "primary_teacher_id": "uuid",
  "notes": "..."
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_code": "HS001", // Auto-generated
    "full_name": "Hào Hổ",
    // ... all fields
    "created_at": "2024-10-21T00:00:00Z"
  }
}

Response 400:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "full_name",
        "message": "Full name is required"
      },
      {
        "field": "date_of_birth",
        "message": "Date of birth must be in the past"
      }
    ]
  }
}
```

#### Update Student

```http
PUT /students/:id
Content-Type: application/json

Request Body:
{
  "full_name": "Updated Name",
  "status": "inactive",
  "notes": "Updated notes"
}

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    // ... updated student data
    "updated_at": "2024-10-21T10:30:00Z"
  }
}
```

#### Delete Student

```http
DELETE /students/:id

Response 200:
{
  "success": true,
  "message": "Student deleted successfully"
}

Response 400:
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_STUDENT",
    "message": "Cannot delete student with active goals or reports",
    "details": {
      "active_goals": 3,
      "total_reports": 10
    }
  }
}
```

#### Upload Student Avatar

```http
POST /students/:id/avatar
Content-Type: multipart/form-data

Request Body:
  - avatar: file (image/jpeg, image/png, max 5MB)

Response 200:
{
  "success": true,
  "data": {
    "avatar_url": "https://storage.../avatar.jpg"
  }
}
```

---

### 2. **Student Goals API**

#### Get Goals for Student

```http
GET /students/:studentId/goals
Query Parameters:
  - status: string (not_started, in_progress, completed, discontinued)
  - domain_id: uuid
  - sort_by: string (start_date, current_progress)

Response 200:
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": "uuid",
        "student_id": "uuid",
        "goal_template": {
          "id": "uuid",
          "description": "Child can imitate...",
          "domain": {
            "id": "uuid",
            "name": "Imitation",
            "color": "#FF6B6B"
          },
          "tags": [
            {
              "id": "uuid",
              "name": "Repeated goal",
              "color": "#95A5A6"
            }
          ]
        },
        "target_progress": 80,
        "current_progress": 45,
        "status": "in_progress",
        "start_date": "2024-01-01",
        "target_end_date": "2024-06-01",
        "notes": "Making good progress",
        "created_by": {
          "id": "uuid",
          "full_name": "Teacher Name"
        },
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-10-21T00:00:00Z"
      }
    ],
    "statistics": {
      "total": 15,
      "not_started": 2,
      "in_progress": 8,
      "completed": 5
    }
  }
}
```

#### Assign Goal to Student

```http
POST /students/:studentId/goals
Content-Type: application/json

Request Body:
{
  "goal_template_id": "uuid",
  "target_progress": 80,
  "start_date": "2024-01-01",
  "target_end_date": "2024-06-01",
  "notes": "Focus on verbal prompting"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "goal_template_id": "uuid",
    "status": "not_started",
    "current_progress": 0,
    "target_progress": 80,
    // ...
    "created_at": "2024-10-21T00:00:00Z"
  }
}
```

#### Update Student Goal

```http
PUT /student-goals/:id
Content-Type: application/json

Request Body:
{
  "current_progress": 60,
  "status": "in_progress",
  "notes": "Updated notes"
}

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "current_progress": 60,
    "status": "in_progress",
    // ...
    "updated_at": "2024-10-21T00:00:00Z"
  }
}
```

#### Delete Student Goal

```http
DELETE /student-goals/:id

Response 200:
{
  "success": true,
  "message": "Goal removed successfully"
}

Response 400:
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_GOAL",
    "message": "Cannot delete goal with progress records",
    "details": {
      "reports_count": 5
    }
  }
}
```

---

### 3. **Reports API**

#### List Reports

```http
GET /reports
Query Parameters:
  - student_id: uuid (required or optional)
  - teacher_id: uuid
  - status: string (draft, submitted, reviewed)
  - date_from: date (YYYY-MM-DD)
  - date_to: date (YYYY-MM-DD)
  - page: int
  - limit: int

Response 200:
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "uuid",
        "student": {
          "id": "uuid",
          "full_name": "Hào Hổ",
          "avatar_url": "..."
        },
        "teacher": {
          "id": "uuid",
          "full_name": "Teacher Name"
        },
        "session_date": "2024-10-21",
        "rating": 4,
        "participation_level": "high",
        "status": "submitted",
        "goals_count": 5,
        "avg_progress": 65,
        "created_at": "2024-10-21T08:00:00Z",
        "updated_at": "2024-10-21T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "total_pages": 3
    }
  }
}
```

#### Get Report by ID

```http
GET /reports/:id

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "student": {
      "id": "uuid",
      "full_name": "Hào Hổ",
      "student_code": "HS001",
      "avatar_url": "..."
    },
    "teacher": {
      "id": "uuid",
      "full_name": "Teacher Name",
      "email": "teacher@email.com"
    },
    "session_date": "2024-10-21",
    "session_duration": 60, // minutes
    "rating": 4,
    "participation_level": "high",
    "status": "submitted",
    "notes": "Student showed great improvement today...",
    "recommendations": "Continue with current approach...",
    "goals": [
      {
        "id": "uuid", // report_goal_id
        "student_goal": {
          "id": "uuid",
          "goal_template": {
            "id": "uuid",
            "description": "Child can imitate...",
            "domain": {
              "name": "Imitation",
              "color": "#FF6B6B"
            }
          },
          "current_progress": 45,
          "target_progress": 80
        },
        "progress_recorded": 50, // Progress trong buổi này
        "previous_progress": 45,
        "notes": "Good improvement with verbal prompts",
        "support_level": "verbal"
      }
    ],
    "reviewed_by": {
      "id": "uuid",
      "full_name": "Supervisor Name"
    },
    "reviewed_at": "2024-10-22T10:00:00Z",
    "review_notes": "Excellent report",
    "created_at": "2024-10-21T08:00:00Z",
    "updated_at": "2024-10-21T09:00:00Z"
  }
}
```

#### Create Report

```http
POST /reports
Content-Type: application/json

Request Body:
{
  "student_id": "uuid",
  "session_date": "2024-10-21",
  "session_duration": 60,
  "rating": 4,
  "participation_level": "high",
  "notes": "Student performed well...",
  "recommendations": "Continue current approach",
  "status": "draft", // or "submitted"
  "goals": [
    {
      "student_goal_id": "uuid",
      "progress_recorded": 50,
      "notes": "Good progress with prompts",
      "support_level": "verbal"
    },
    {
      "student_goal_id": "uuid",
      "progress_recorded": 70,
      "notes": "Almost independent",
      "support_level": "independent"
    }
  ]
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "teacher_id": "uuid", // From auth token
    // ... full report data
    "created_at": "2024-10-21T08:00:00Z"
  }
}

Response 400:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "rating",
        "message": "Rating must be between 1 and 5"
      },
      {
        "field": "goals",
        "message": "At least one goal must be included"
      }
    ]
  }
}
```

#### Update Report

```http
PUT /reports/:id
Content-Type: application/json

Request Body:
{
  "rating": 5,
  "notes": "Updated notes",
  "status": "submitted",
  "goals": [
    {
      "id": "uuid", // report_goal_id (for update)
      "progress_recorded": 55,
      "notes": "Updated progress"
    },
    {
      // New goal (no id)
      "student_goal_id": "uuid",
      "progress_recorded": 60,
      "notes": "Added new goal"
    }
  ]
}

Response 200:
{
  "success": true,
  "data": {
    // ... updated report
    "updated_at": "2024-10-21T09:30:00Z"
  }
}

Response 403:
{
  "success": false,
  "error": {
    "code": "CANNOT_EDIT_SUBMITTED_REPORT",
    "message": "Cannot edit report in 'reviewed' status"
  }
}
```

#### Delete Report

```http
DELETE /reports/:id

Response 200:
{
  "success": true,
  "message": "Report deleted successfully"
}

Response 403:
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_REVIEWED_REPORT",
    "message": "Cannot delete report that has been reviewed"
  }
}
```

#### Submit Report (Change status)

```http
POST /reports/:id/submit

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "submitted",
    "updated_at": "2024-10-21T10:00:00Z"
  }
}
```

---

### 4. **Goal Templates API** (Admin/System)

#### List Goal Templates

```http
GET /goal-templates
Query Parameters:
  - domain_id: uuid
  - difficulty_level: string
  - is_active: boolean
  - search: string

Response 200:
{
  "success": true,
  "data": {
    "goal_templates": [
      {
        "id": "uuid",
        "domain": {
          "id": "uuid",
          "name": "Imitation",
          "color": "#FF6B6B"
        },
        "description": "Child can imitate...",
        "order_index": 1,
        "difficulty_level": "medium",
        "age_range_min": 3,
        "age_range_max": 6,
        "tags": [
          {
            "id": "uuid",
            "name": "Repeated goal",
            "color": "#95A5A6"
          }
        ],
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 50
  }
}
```

#### Create Goal Template

```http
POST /goal-templates
Content-Type: application/json

Request Body:
{
  "domain_id": "uuid",
  "description": "Child can identify 10 body parts",
  "order_index": 5,
  "difficulty_level": "easy",
  "age_range_min": 2,
  "age_range_max": 5,
  "tag_ids": ["uuid1", "uuid2"]
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    // ... full goal template data
    "created_at": "2024-10-21T00:00:00Z"
  }
}
```

#### Update Goal Template

```http
PUT /goal-templates/:id

Request Body:
{
  "description": "Updated description",
  "difficulty_level": "medium",
  "is_active": false
}

Response 200:
{
  "success": true,
  "data": {
    // ... updated data
  }
}
```

#### Delete Goal Template

```http
DELETE /goal-templates/:id

Response 200:
{
  "success": true,
  "message": "Goal template deleted successfully"
}

Response 400:
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_TEMPLATE",
    "message": "Goal template is in use by students",
    "details": {
      "students_count": 5
    }
  }
}
```

---

### 5. **Domains API**

#### List Domains

```http
GET /domains

Response 200:
{
  "success": true,
  "data": {
    "domains": [
      {
        "id": "uuid",
        "name": "Imitation",
        "description": "Motor and verbal imitation skills",
        "order_index": 1,
        "icon": "copy",
        "color": "#FF6B6B",
        "is_active": true,
        "goals_count": 15
      }
    ]
  }
}
```

---

## ✅ Data Validation Rules

### Student

- `full_name`: Required, max 255 chars
- `date_of_birth`: Required, must be in past, max 18 years ago
- `gender`: Required, enum ['male', 'female', 'other']
- `parent_phone`: Required, valid phone format
- `parent_email`: Optional, valid email format
- `enrollment_date`: Required, cannot be in future

### Report

- `rating`: Required, integer 1-5
- `session_date`: Required, cannot be in future
- `session_duration`: Optional, min 1, max 300 minutes
- `goals`: Required, min 1 goal
- `progress_recorded`: Required per goal, integer 0-100

### Student Goal

- `target_progress`: Required, integer 0-100
- `current_progress`: Integer 0-100, cannot exceed target_progress
- `start_date`: Required, cannot be in future
- `target_end_date`: Optional, must be after start_date

---

## 🔄 Migration Strategy

### Phase 1: Database Setup (Week 1)

```sql
-- 1. Create database
CREATE DATABASE umx_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Run table creation scripts in order:
-- a. Core tables
CREATE TABLE users...
CREATE TABLE students...
CREATE TABLE domains...
CREATE TABLE tags...

-- b. Template tables
CREATE TABLE goal_templates...
CREATE TABLE goal_template_tags...

-- c. Student-specific tables
CREATE TABLE student_teachers...
CREATE TABLE student_goals...

-- d. Report tables
CREATE TABLE reports...
CREATE TABLE report_goals...

-- e. Audit table
CREATE TABLE activity_logs...

-- 3. Seed initial data
INSERT INTO domains...
INSERT INTO tags...
INSERT INTO goal_templates...
INSERT INTO users (admin)...
```

### Phase 2: Data Migration from Mock Data (Week 2)

```javascript
// scripts/migrate-mock-data.js

// 1. Migrate students
MOCK_STUDENTS.forEach(student => {
  INSERT INTO students (full_name, ...) VALUES (...)
});

// 2. Migrate domains & goals
MOCK_DOMAINS.forEach(domain => {
  // Domain already seeded
  domain.goals.forEach(goal => {
    INSERT INTO goal_templates (domain_id, description, ...)

    // Migrate tags
    goal.tags.forEach(tag => {
      INSERT INTO goal_template_tags (goal_template_id, tag_id)
    });
  });
});

// 3. Migrate reports
MOCK_REPORTS.forEach(report => {
  INSERT INTO reports (student_id, teacher_id, ...)

  // Migrate report goals
  report.domains.forEach(domain => {
    domain.goals.forEach(goal => {
      INSERT INTO report_goals (report_id, student_goal_id, progress_recorded)
    });
  });
});
```

---

## 🔒 Security Considerations

### 1. Authentication & Authorization

```javascript
// middleware/auth.js
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Token required" },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Invalid token" },
    });
  }
};

// middleware/roles.js
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Insufficient permissions" },
      });
    }
    next();
  };
};

// Usage:
app.post(
  "/goal-templates",
  authMiddleware,
  requireRole("admin"),
  createGoalTemplate
);
```

### 2. Data Access Control

```javascript
// Teachers can only access their assigned students
const getStudents = async (req, res) => {
  const { user } = req;

  let query = "SELECT * FROM students";

  if (user.role === "teacher") {
    // Teacher chỉ thấy students được assign
    query += ` WHERE id IN (
      SELECT student_id FROM student_teachers 
      WHERE teacher_id = ?
    )`;
  }
  // Admin sees all

  const students = await db.query(query, [user.id]);
  res.json({ success: true, data: { students } });
};
```

### 3. Input Sanitization

```javascript
const { body, validationResult } = require("express-validator");

const createStudentValidation = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: 255 })
    .withMessage("Name too long"),
  body("parent_email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("parent_phone")
    .matches(/^[0-9]{10,11}$/)
    .withMessage("Invalid phone number"),
];

app.post("/students", authMiddleware, createStudentValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: errors.array(),
      },
    });
  }
  // Process...
});
```

### 4. Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests",
    },
  },
});

app.use("/api/", apiLimiter);
```

---

## 📊 Sample SQL Queries

### Get Student Progress Summary

```sql
SELECT
  s.id,
  s.full_name,
  COUNT(DISTINCT sg.id) as total_goals,
  COUNT(DISTINCT CASE WHEN sg.status = 'completed' THEN sg.id END) as completed_goals,
  AVG(sg.current_progress) as avg_progress,
  COUNT(DISTINCT r.id) as total_reports,
  AVG(r.rating) as avg_rating
FROM students s
LEFT JOIN student_goals sg ON s.id = sg.student_id
LEFT JOIN reports r ON s.id = r.student_id
WHERE s.id = ?
GROUP BY s.id;
```

### Get Report with Goals

```sql
SELECT
  r.*,
  s.full_name as student_name,
  u.full_name as teacher_name,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'goal_id', rg.id,
      'description', gt.description,
      'domain', d.name,
      'progress_recorded', rg.progress_recorded,
      'previous_progress', rg.previous_progress
    )
  ) as goals
FROM reports r
JOIN students s ON r.student_id = s.id
JOIN users u ON r.teacher_id = u.id
LEFT JOIN report_goals rg ON r.id = rg.report_id
LEFT JOIN student_goals sg ON rg.student_goal_id = sg.id
LEFT JOIN goal_templates gt ON sg.goal_template_id = gt.id
LEFT JOIN domains d ON gt.domain_id = d.id
WHERE r.id = ?
GROUP BY r.id;
```

---

## 🎯 Next Steps

### Week 1: Database Setup

- [ ] Set up PostgreSQL/MySQL database
- [ ] Run migration scripts
- [ ] Seed initial data (domains, tags, admin user)
- [ ] Test database connections

### Week 2: API Development

- [ ] Set up Express.js/NestJS backend
- [ ] Implement authentication (JWT)
- [ ] Create CRUD endpoints for Students
- [ ] Create CRUD endpoints for Reports
- [ ] Create CRUD endpoints for Goals

### Week 3: Testing & Integration

- [ ] Write unit tests for API endpoints
- [ ] Integration tests
- [ ] Connect frontend to API
- [ ] End-to-end testing

### Week 4: Deployment

- [ ] Deploy database (AWS RDS / DigitalOcean)
- [ ] Deploy backend API (Heroku / AWS EC2)
- [ ] Set up monitoring & logging
- [ ] Performance optimization

---

## 📚 Technology Stack Recommendations

### Backend Options

**Option 1: Node.js + Express + Prisma**

```bash
npm install express prisma @prisma/client bcrypt jsonwebtoken
npm install -D @types/express @types/bcrypt @types/jsonwebtoken
```

**Option 2: Node.js + NestJS + TypeORM**

```bash
npm install @nestjs/core @nestjs/common @nestjs/typeorm typeorm mysql2
```

**Option 3: Python + FastAPI + SQLAlchemy**

```bash
pip install fastapi sqlalchemy pymysql uvicorn
```

### Database

- **Primary**: PostgreSQL 14+ (Best for complex queries, JSON support)
- **Alternative**: MySQL 8+ (Good performance, widely supported)
- **Development**: SQLite (For local development)

### File Storage

- **Images**: AWS S3 / Cloudinary / DigitalOcean Spaces
- **Documents**: Same as images

---

## 🏁 Conclusion

Database design này cung cấp:

✅ **Normalized schema** - Tách biệt templates và instances  
✅ **Flexible** - Dễ mở rộng thêm features  
✅ **Audit trail** - Track tất cả changes  
✅ **Relationships** - Clear foreign keys và indexes  
✅ **Security** - Role-based access control  
✅ **Performance** - Proper indexes cho queries

### Key Improvements from Current Design:

1. ✅ **Separate templates from instances** - Goal templates vs Student goals
2. ✅ **Proper user management** - Teachers, roles, permissions
3. ✅ **Audit trail** - Activity logs for all changes
4. ✅ **Flexible assignments** - Many-to-many student-teacher relationships
5. ✅ **Better reporting** - Separate report and report_goals tables
6. ✅ **Tag system** - Reusable tags across goals
7. ✅ **Status tracking** - Track student, goal, and report statuses

---

**Document Version:** 1.0  
**Last Updated:** October 21, 2025  
**Status:** Ready for Implementation  
**Next Review:** After Week 2 (API Development)
