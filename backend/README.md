# 🗄️ Database Design & API Specification v2.0 - COMPLETE

**Project:** UMX - Student Intervention Management System  
**Date:** October 21, 2025  
**Version:** 2.0 (Complete System)  
**Database:** PostgreSQL (Recommended) / MySQL  
**Features:** Teachers, Students, Parents, Goals, Reports, Notifications

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Complete Database Schema](#complete-database-schema)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [API Endpoints - Teachers](#api-endpoints---teachers)
5. [API Endpoints - Parents](#api-endpoints---parents)
6. [Data Validation & Security](#data-validation--security)
7. [Implementation Roadmap](#implementation-roadmap)

---

## 🎯 System Overview

### Business Requirements

**UMX System** quản lý đầy đủ:

- 👨‍🏫 **Teachers (Users)**: Giáo viên can thiệp ABA
- 👶 **Students**: Học sinh tự kỷ
- 👨‍👩‍👧 **Parents**: Phụ huynh học sinh (với portal riêng)
- 🎯 **Domains & Goals**: Lĩnh vực và mục tiêu can thiệp
- 📊 **Reports**: Báo cáo tiến độ học sinh
- 🔔 **Notifications**: Thông báo cho phụ huynh

### User Roles

```
System Users:
├── Admin (Full access - manage teachers, students, goals)
├── Teacher (Create/Edit students, goals, reports)
└── Parent (View only - their children's data)
```

### Core Features

**For Teachers/Admin:**

1. ✅ Teacher authentication & authorization
2. ✅ Student management (CRUD)
3. ✅ Goal templates & student goals
4. ✅ Create progress reports
5. ✅ Track student progress over time
6. ✅ Assign students to teachers

**For Parents:**

1. ✅ Parent authentication (separate from teachers)
2. ✅ View children's profiles
3. ✅ View all reports for their children
4. ✅ Track goal progress
5. ✅ Receive notifications (new report, goal completed)
6. ✅ Export reports as PDF

---

## 🗃️ Complete Database Schema

### Overview: 14 Tables

**Core Tables:**

1. `users` - Teachers/Admin accounts
2. `students` - Student profiles
3. `student_teachers` - Student-Teacher relationships (Many-to-Many)

**Goal System:** 4. `domains` - Goal domains (Imitation, Language, etc.) 5. `tags` - Goal tags (support types, difficulty) 6. `goal_templates` - System-wide goal templates 7. `goal_template_tags` - Template-Tag relationships 8. `student_goals` - Student-specific goal instances

**Reports:** 9. `reports` - Progress reports 10. `report_goals` - Goals tracked in each report

**Parent Portal:** 11. `parents` - Parent accounts (separate auth) 12. `parent_students` - Parent-Student relationships (Many-to-Many) 13. `notifications` - Notifications for parents 14. `report_views` - Track parent report views

**Audit:** 15. `activity_logs` - Audit trail for all actions

---

## 📊 Detailed Schema

### 1. **users** (Teachers/Admin)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  -- Profile
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),

  -- Authorization
  role VARCHAR(20) NOT NULL DEFAULT 'teacher', -- 'admin', 'teacher'

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
);

-- Seed admin
INSERT INTO users (email, password_hash, full_name, role) VALUES
  ('admin@umx.com', '$2b$10$...', 'Admin User', 'admin'),
  ('teacher1@umx.com', '$2b$10$...', 'Nguyễn Văn Giáo Viên', 'teacher');
```

---

### 2. **students**

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  student_code VARCHAR(50) UNIQUE NOT NULL, -- HS001, HS002
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL, -- 'male', 'female', 'other'
  avatar_url VARCHAR(500),

  -- Parent/Guardian Information (Legacy - for backward compatibility)
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(255),
  address TEXT,

  -- Medical Information
  diagnosis VARCHAR(255), -- 'Autism Spectrum Disorder', 'ASD', 'ADHD'
  diagnosis_date DATE,
  medical_notes TEXT,

  -- Enrollment
  enrollment_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'graduated', 'on_hold'

  -- Assignment
  primary_teacher_id UUID, -- FK to users

  -- Parent Portal Settings
  parent_portal_enabled BOOLEAN DEFAULT true,
  parent_can_view_medical_notes BOOLEAN DEFAULT true,
  parent_can_view_behavior_notes BOOLEAN DEFAULT true,

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

-- Seed example
INSERT INTO students (student_code, full_name, date_of_birth, gender, parent_name, parent_phone, enrollment_date, primary_teacher_id) VALUES
  ('HS001', 'Hào Hổ', '2018-05-15', 'male', 'Nguyễn Văn Phụ Huynh', '0901234567', '2020-09-01', (SELECT id FROM users WHERE email = 'teacher1@umx.com'));
```

---

### 3. **student_teachers** (Many-to-Many)

```sql
CREATE TABLE student_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'primary', -- 'primary', 'assistant', 'consultant'
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID, -- FK to users

  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE KEY unique_student_teacher (student_id, teacher_id),
  INDEX idx_student (student_id),
  INDEX idx_teacher (teacher_id)
);
```

---

### 4. **domains** (Goal Domains)

```sql
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  icon VARCHAR(100), -- Icon name
  color VARCHAR(7), -- Hex color

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

### 5. **tags** (Goal Tags)

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7),
  category VARCHAR(50), -- 'support_type', 'difficulty', 'skill_type'

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_name (name),
  INDEX idx_category (category)
);

-- Seed data
INSERT INTO tags (name, description, category, color) VALUES
  ('Repeated goal', 'Goal repeated from previous cycle', 'status', '#95A5A6'),
  ('Partial physical support', 'Requires partial physical prompting', 'support_type', '#E74C3C'),
  ('Full physical support', 'Requires full physical prompting', 'support_type', '#C0392B'),
  ('Verbal prompt', 'Requires verbal prompting', 'support_type', '#3498DB'),
  ('Modeling', 'Learn through demonstration', 'support_type', '#9B59B6'),
  ('Independent', 'Can perform independently', 'support_type', '#27AE60'),
  ('Easy', 'Easy difficulty', 'difficulty', '#2ECC71'),
  ('Medium', 'Medium difficulty', 'difficulty', '#F39C12'),
  ('Hard', 'Hard difficulty', 'difficulty', '#E67E22');
```

---

### 6. **goal_templates** (System-wide Templates)

```sql
CREATE TABLE goal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL,
  description TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  difficulty_level VARCHAR(20), -- 'easy', 'medium', 'hard'
  age_range_min INT,
  age_range_max INT,

  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_domain (domain_id),
  INDEX idx_is_active (is_active),
  INDEX idx_order (order_index)
);

-- Seed example goals
INSERT INTO goal_templates (domain_id, description, order_index, difficulty_level) VALUES
  ((SELECT id FROM domains WHERE name = 'Imitation'), 'Child can imitate 3 play actions with a doll, teddy bear (spoon-feeding, holding a cup to drink, wiping mouth) with 70% success with support', 1, 'medium'),
  ((SELECT id FROM domains WHERE name = 'Expressive Language'), 'Different types of cries for different types of discomfort', 1, 'easy'),
  ((SELECT id FROM domains WHERE name = 'Cognition'), 'Comes after a verbal command (without tools/objects)', 1, 'medium');
```

---

### 7. **goal_template_tags** (Many-to-Many)

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
```

---

### 8. **student_goals** (Student-specific Goal Instances)

```sql
CREATE TABLE student_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  goal_template_id UUID NOT NULL,

  -- Progress Tracking
  target_progress INT DEFAULT 100, -- Target % (e.g., 80%)
  current_progress INT DEFAULT 0, -- Current progress (0-100)

  -- Status
  status VARCHAR(20) DEFAULT 'not_started',
  -- 'not_started', 'in_progress', 'completed', 'discontinued', 'on_hold'

  -- Timeline
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,

  -- Notes
  notes TEXT,
  discontinue_reason TEXT,

  -- Metadata
  created_by UUID,
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

### 9. **reports** (Progress Reports)

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  teacher_id UUID NOT NULL,

  -- Session Information
  session_date DATE NOT NULL,
  session_duration INT, -- Minutes

  -- Overall Assessment
  rating INT NOT NULL, -- 1-5 stars
  participation_level VARCHAR(20), -- 'high', 'medium', 'low'

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'reviewed', 'archived'

  -- Content
  notes TEXT,
  recommendations TEXT,

  -- Parent Portal
  visible_to_parents BOOLEAN DEFAULT true,
  parent_notification_sent BOOLEAN DEFAULT false,
  parent_notification_sent_at TIMESTAMP,

  -- Review
  reviewed_by UUID,
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

### 10. **report_goals** (Goals in Report)

```sql
CREATE TABLE report_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL,
  student_goal_id UUID NOT NULL,

  -- Progress
  progress_recorded INT NOT NULL, -- 0-100%
  previous_progress INT,

  -- Observations
  notes TEXT,
  observations TEXT,
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

### 11. **parents** (Parent Accounts)

```sql
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,

  -- Profile
  full_name VARCHAR(255) NOT NULL,
  relationship VARCHAR(50) NOT NULL, -- 'mother', 'father', 'guardian', 'other'
  avatar_url VARCHAR(500),
  secondary_phone VARCHAR(20),
  address TEXT,

  -- Account Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  phone_verified_at TIMESTAMP,

  -- Preferences
  language VARCHAR(10) DEFAULT 'vi', -- 'vi', 'en'
  timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
  notification_preferences JSON, -- { email: true, sms: false, push: true }

  -- Security
  last_login_at TIMESTAMP,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,

  -- Metadata
  created_by UUID, -- Teacher/Admin who created
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_is_active (is_active)
);

-- Seed example
INSERT INTO parents (email, password_hash, full_name, relationship, phone) VALUES
  ('parent1@email.com', '$2b$10$...', 'Nguyễn Văn Phụ Huynh', 'father', '0901234567');
```

---

### 12. **parent_students** (Many-to-Many)

```sql
CREATE TABLE parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  student_id UUID NOT NULL,
  relationship VARCHAR(50) NOT NULL, -- 'mother', 'father', 'guardian'
  is_primary BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT true,
  can_receive_notifications BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,

  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE KEY unique_parent_student (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_is_primary (is_primary)
);

-- Link parent to student
INSERT INTO parent_students (parent_id, student_id, relationship, is_primary) VALUES
  ((SELECT id FROM parents WHERE email = 'parent1@email.com'),
   (SELECT id FROM students WHERE student_code = 'HS001'),
   'father', true);
```

---

### 13. **notifications** (Parent Notifications)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  parent_id UUID NOT NULL,
  student_id UUID,

  -- Content
  type VARCHAR(50) NOT NULL, -- 'new_report', 'goal_completed', 'announcement'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Related Entity
  related_entity_type VARCHAR(50), -- 'report', 'goal', 'student'
  related_entity_id UUID,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,

  -- Delivery
  channels JSON, -- { email: true, sms: false, push: true }
  email_sent_at TIMESTAMP,
  sms_sent_at TIMESTAMP,
  push_sent_at TIMESTAMP,

  -- Priority
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  expires_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,

  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_parent (parent_id),
  INDEX idx_is_read (is_read),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);
```

---

### 14. **report_views** (Track Parent Views)

```sql
CREATE TABLE report_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL,
  parent_id UUID NOT NULL,

  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  view_duration_seconds INT,
  device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
  ip_address VARCHAR(45),

  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,

  INDEX idx_report (report_id),
  INDEX idx_parent (parent_id),
  INDEX idx_viewed_at (viewed_at)
);
```

---

### 15. **activity_logs** (Audit Trail)

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login'
  entity_type VARCHAR(50) NOT NULL, -- 'student', 'report', 'goal'
  entity_id UUID,
  old_values JSON,
  new_values JSON,
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
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│    users    │         │     students     │         │   parents   │
│  (teachers) │         │                  │         │             │
│             │         │                  │         │             │
│ • id (PK)   │────┐    │ • id (PK)        │    ┌────│ • id (PK)   │
│ • email     │    │    │ • student_code   │    │    │ • email     │
│ • role      │    │    │ • full_name      │    │    │ • phone     │
│ • is_active │    │    │ • primary_teacher│────┘    │ • is_active │
└─────────────┘    │    │   _id (FK)       │         └─────────────┘
                   │    └──────────────────┘                 │
                   │             │                            │
                   │             ├──────────┬─────────────────┤
                   │             │          │                 │
                   │             ▼          ▼                 ▼
                   │    ┌─────────────┬─────────────┬──────────────────┐
                   │    │   student   │   parent    │   notifications  │
                   │    │  _teachers  │  _students  │                  │
                   └────│• student(FK)│• parent(FK) │ • parent_id (FK) │
                        │• teacher(FK)│• student(FK)│ • type           │
                        └─────────────┴─────────────┴──────────────────┘
                                 │
                        ┌────────┴────────┐
                        ▼                 ▼
               ┌──────────────┐  ┌──────────────┐
               │   domains    │  │ student_goals│
               │              │  │              │
               │ • id (PK)    │  │ • id (PK)    │
               │ • name       │  │ • student(FK)│
               │ • order      │  │ • goal_tpl(FK│
               └──────────────┘  │ • progress   │
                        │         │ • status     │
                        │         └──────────────┘
                        ▼                 │
               ┌──────────────┐           │
               │goal_templates│           │
               │              │           │
               │ • id (PK)    │───────────┘
               │ • domain(FK) │
               │ • description│
               └──────────────┘
                        │
                        ├─────────────┬──────────────┐
                        ▼             ▼              ▼
               ┌─────────────┐ ┌──────────┐  ┌─────────────┐
               │    tags     │ │ reports  │  │report_goals │
               │             │ │          │  │             │
               │ • id (PK)   │ │• id (PK) │  │• report(FK) │
               │ • name      │ │• student │  │• stud_goal  │
               │ • category  │ │  (FK)    │  │  (FK)       │
               └─────────────┘ │• teacher │  │• progress   │
                               │  (FK)    │  │  _recorded  │
                               └──────────┘  └─────────────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │ report_views │
                               │              │
                               │• report (FK) │
                               │• parent (FK) │
                               │• viewed_at   │
                               └──────────────┘
```

**Key Relationships:**

- `users` (1) ←→ (N) `students` (primary teacher)
- `users` (N) ←→ (N) `students` (via `student_teachers`)
- `parents` (N) ←→ (N) `students` (via `parent_students`)
- `domains` (1) ←→ (N) `goal_templates`
- `goal_templates` (N) ←→ (N) `tags` (via `goal_template_tags`)
- `students` (1) ←→ (N) `student_goals`
- `goal_templates` (1) ←→ (N) `student_goals`
- `students` (1) ←→ (N) `reports`
- `users` (1) ←→ (N) `reports` (as teacher)
- `reports` (1) ←→ (N) `report_goals`
- `student_goals` (1) ←→ (N) `report_goals`
- `parents` (1) ←→ (N) `notifications`
- `reports` (1) ←→ (N) `report_views`

---

## 🔌 API Endpoints - Teachers

### Base URL: `/api/v1`

### Authentication

```
POST   /auth/login           # Teacher/Admin login
POST   /auth/logout          # Logout
POST   /auth/refresh-token   # Refresh JWT token
GET    /auth/me              # Get current user
```

---

### Students API

```
GET    /students              # List all students (with filters)
POST   /students              # Create new student
GET    /students/:id          # Get student details
PUT    /students/:id          # Update student
DELETE /students/:id          # Delete student (soft)

GET    /students/:id/goals    # Get student's goals
POST   /students/:id/goals    # Assign goal to student
PUT    /students/:id/goals/:goalId  # Update goal progress

GET    /students/:id/reports  # Get student's reports
GET    /students/:id/progress-chart  # Progress over time
```

**Example: List Students**

```http
GET /api/v1/students?page=1&limit=20&status=active&search=Hào

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
          "full_name": "Nguyễn Văn Giáo Viên"
        },
        "statistics": {
          "total_goals": 15,
          "active_goals": 8,
          "completed_goals": 7,
          "avg_progress": 65
        }
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

---

### Goals API

```
GET    /domains               # List all domains
GET    /domains/:id/goals     # Goal templates in domain

GET    /goal-templates        # List goal templates
POST   /goal-templates        # Create custom template (admin)
PUT    /goal-templates/:id    # Update template
DELETE /goal-templates/:id    # Delete template

GET    /tags                  # List all tags
POST   /tags                  # Create tag (admin)
```

---

### Reports API

```
GET    /reports               # List reports (by teacher)
POST   /reports               # Create new report
GET    /reports/:id           # Get report detail
PUT    /reports/:id           # Update report
DELETE /reports/:id           # Delete report
POST   /reports/:id/submit    # Submit report (change status)
```

**Example: Create Report**

```http
POST /api/v1/reports
Content-Type: application/json
Authorization: Bearer <token>

Request:
{
  "student_id": "uuid",
  "session_date": "2024-10-20",
  "session_duration": 60,
  "rating": 4,
  "participation_level": "high",
  "notes": "Hào đã có tiến bộ rất tốt...",
  "recommendations": "Tiếp tục thực hành tại nhà...",
  "goals": [
    {
      "student_goal_id": "uuid",
      "progress_recorded": 65,
      "notes": "Đã làm tốt với hỗ trợ bằng lời nói",
      "support_level": "verbal"
    },
    {
      "student_goal_id": "uuid",
      "progress_recorded": 40,
      "notes": "Cần thêm thực hành",
      "support_level": "physical"
    }
  ]
}

Response 201:
{
  "success": true,
  "data": {
    "report": {
      "id": "uuid",
      "student_id": "uuid",
      "teacher_id": "uuid",
      "session_date": "2024-10-20",
      "rating": 4,
      "status": "draft",
      "goals_count": 2,
      "created_at": "2024-10-20T15:00:00Z"
    },
    "message": "Report created successfully"
  }
}
```

---

## 🔌 API Endpoints - Parents

### Base URL: `/api/v1/parent`

### Authentication

```
POST   /parent/auth/register         # Parent registration
POST   /parent/auth/login            # Parent login
POST   /parent/auth/logout           # Logout
GET    /parent/auth/me               # Get profile
PUT    /parent/profile               # Update profile
POST   /parent/auth/forgot-password  # Request reset
```

**Example: Parent Login**

```http
POST /api/v1/parent/auth/login
Content-Type: application/json

Request:
{
  "email": "parent1@email.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600,
    "parent": {
      "id": "uuid",
      "email": "parent1@email.com",
      "full_name": "Nguyễn Văn Phụ Huynh",
      "children_count": 2,
      "unread_notifications": 3
    }
  }
}
```

---

### Children & Reports

```
GET    /parent/children              # List my children
GET    /parent/children/:id          # Child details
GET    /parent/children/:id/reports  # Child's reports
GET    /parent/children/:id/goals    # Child's goals
```

**Example: Get My Children**

```http
GET /api/v1/parent/children
Authorization: Bearer <parent_token>

Response 200:
{
  "success": true,
  "data": {
    "children": [
      {
        "id": "uuid",
        "student_code": "HS001",
        "full_name": "Hào Hổ",
        "date_of_birth": "2018-05-15",
        "age": 6,
        "avatar_url": "https://...",
        "primary_teacher": {
          "full_name": "Nguyễn Văn Giáo Viên",
          "phone": "0903456789"
        },
        "statistics": {
          "total_goals": 15,
          "active_goals": 8,
          "total_reports": 45,
          "unread_reports": 2,
          "avg_rating": 4.2
        }
      }
    ]
  }
}
```

---

### Reports Access

```
GET    /parent/reports/:id           # Get report details
GET    /parent/reports/:id/pdf       # Export as PDF
```

**Example: Get Report**

```http
GET /api/v1/parent/reports/uuid
Authorization: Bearer <parent_token>

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "student": {
      "full_name": "Hào Hổ",
      "student_code": "HS001"
    },
    "teacher": {
      "full_name": "Nguyễn Văn Giáo Viên"
    },
    "session_date": "2024-10-20",
    "rating": 4,
    "notes": "Hào đã có tiến bộ rất tốt...",
    "goals": [
      {
        "description": "Child can imitate 3 play actions...",
        "domain": "Imitation",
        "progress_recorded": 65,
        "previous_progress": 60,
        "progress_change": 5
      }
    ],
    "is_viewed": true,
    "viewed_at": "2024-10-21T08:00:00Z"
  }
}
```

---

### Notifications

```
GET    /parent/notifications         # List notifications
PUT    /parent/notifications/:id/read  # Mark as read
PUT    /parent/notifications/mark-all-read
DELETE /parent/notifications/:id     # Delete notification
```

---

### Dashboard

```
GET    /parent/dashboard             # Summary statistics
```

**Example: Dashboard**

```http
GET /api/v1/parent/dashboard
Authorization: Bearer <parent_token>

Response 200:
{
  "success": true,
  "data": {
    "summary": {
      "total_children": 2,
      "total_reports": 45,
      "unread_reports": 2,
      "unread_notifications": 3
    },
    "recent_reports": [
      {
        "student_name": "Hào Hổ",
        "session_date": "2024-10-20",
        "rating": 4,
        "is_viewed": false
      }
    ],
    "recent_achievements": [
      {
        "student_name": "Hào Hổ",
        "goal": "Can say 10 words independently",
        "completed_date": "2024-10-15"
      }
    ]
  }
}
```

---

## 🔒 Data Validation & Security

### Authentication & Authorization

**JWT Token Structure:**

```json
{
  "id": "user-uuid",
  "email": "user@email.com",
  "role": "teacher", // or "admin" or "parent"
  "type": "teacher", // or "parent"
  "iat": 1698000000,
  "exp": 1698003600
}
```

**Middleware:**

```javascript
// Teacher/Admin authentication
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.type !== "teacher") {
    return res.status(403).json({ error: "Teacher access only" });
  }

  req.user = await User.findById(decoded.id);
  next();
};

// Parent authentication
const parentAuthMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.type !== "parent") {
    return res.status(403).json({ error: "Parent access only" });
  }

  req.parent = await Parent.findById(decoded.id);
  next();
};

// Access control for parents
const verifyParentAccess = async (req, res, next) => {
  const { studentId } = req.params;
  const { parent } = req;

  const hasAccess = await db.query(
    "SELECT 1 FROM parent_students WHERE parent_id = ? AND student_id = ?",
    [parent.id, studentId]
  );

  if (!hasAccess) {
    return res.status(403).json({ error: "Access denied" });
  }

  next();
};
```

---

### Data Validation

**Student Validation:**

```javascript
const studentSchema = {
  student_code: {
    type: "string",
    required: true,
    pattern: /^HS\d{3,6}$/, // HS001, HS002, etc.
    unique: true,
  },
  full_name: {
    type: "string",
    required: true,
    min: 2,
    max: 255,
  },
  date_of_birth: {
    type: "date",
    required: true,
    max: new Date(), // Cannot be future date
  },
  parent_phone: {
    type: "string",
    required: true,
    pattern: /^0\d{9,10}$/, // Vietnamese phone
  },
  parent_email: {
    type: "email",
    optional: true,
  },
};
```

**Report Validation:**

```javascript
const reportSchema = {
  student_id: {
    type: "uuid",
    required: true,
    exists: "students.id",
  },
  session_date: {
    type: "date",
    required: true,
    max: new Date(), // Cannot be future
  },
  rating: {
    type: "integer",
    required: true,
    min: 1,
    max: 5,
  },
  goals: {
    type: "array",
    required: true,
    min: 1, // At least 1 goal
    items: {
      student_goal_id: "uuid",
      progress_recorded: { type: "integer", min: 0, max: 100 },
    },
  },
};
```

---

### Security Best Practices

1. **Password Security**

   - Hash with bcrypt (cost factor 10)
   - Minimum 8 characters
   - Require uppercase, lowercase, number

2. **Rate Limiting**

   - Login: 5 attempts per 15 minutes
   - API calls: 100 requests per minute

3. **Input Sanitization**

   - Escape HTML in text fields
   - Validate UUIDs
   - SQL injection prevention (use parameterized queries)

4. **Access Control**

   - Teachers: Can only view/edit assigned students
   - Parents: Can only view their own children
   - Admin: Full access

5. **Audit Trail**
   - Log all create/update/delete operations
   - Log login attempts
   - Store IP address and user agent

---

## 🚀 Implementation Roadmap

### Phase 1: Core System (Weeks 1-4)

**Week 1: Database & Authentication**

- [ ] Create all 15 tables
- [ ] Seed initial data (domains, tags, users)
- [ ] Implement JWT authentication for teachers
- [ ] Create login/logout endpoints

**Week 2: Student & Goal Management**

- [ ] Student CRUD APIs
- [ ] Goal templates management
- [ ] Assign goals to students
- [ ] Student-teacher relationships

**Week 3: Reports System**

- [ ] Create report API
- [ ] Report CRUD operations
- [ ] Track goal progress in reports
- [ ] Report list/filter/search

**Week 4: Testing & Admin Tools**

- [ ] Unit tests for core APIs
- [ ] Admin dashboard for user management
- [ ] Data validation
- [ ] Error handling

---

### Phase 2: Parent Portal (Weeks 5-8)

**Week 5: Parent Authentication**

- [ ] Create parent tables
- [ ] Parent registration/login
- [ ] Link parents to students
- [ ] Parent profile management

**Week 6: Parent Access to Data**

- [ ] View children list
- [ ] View child details
- [ ] View reports list
- [ ] View report details
- [ ] Access control middleware

**Week 7: Notifications System**

- [ ] Create notifications table
- [ ] Auto-notify on new report
- [ ] Auto-notify on goal completion
- [ ] Email integration (SendGrid)
- [ ] Push notifications (Expo)

**Week 8: Parent Features**

- [ ] Dashboard for parents
- [ ] PDF export for reports
- [ ] Progress charts
- [ ] Report views tracking
- [ ] Mobile app integration

---

### Phase 3: Advanced Features (Weeks 9-12)

**Week 9: Analytics & Reporting**

- [ ] Teacher dashboard with statistics
- [ ] Student progress charts
- [ ] Goal completion trends
- [ ] Report generation

**Week 10: Communication**

- [ ] Messaging between teachers and parents
- [ ] Announcements system
- [ ] Meeting scheduler

**Week 11: Mobile App**

- [ ] React Native app for parents
- [ ] Offline support
- [ ] Push notifications
- [ ] Biometric authentication

**Week 12: Polish & Launch**

- [ ] Performance optimization
- [ ] Security audit
- [ ] User documentation
- [ ] Deployment to production

---

## 📚 Technology Stack

### Backend

- **Framework**: Node.js + Express.js or NestJS
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcrypt
- **Validation**: Joi or Yup
- **ORM**: Prisma or TypeORM
- **Email**: SendGrid or AWS SES
- **SMS**: Twilio (optional)
- **PDF**: PDFKit or Puppeteer
- **Push Notifications**: Expo Push Service

### Frontend (Mobile)

- **Framework**: React Native with Expo
- **Router**: Expo Router v6
- **State**: Context API + Zustand
- **UI**: NativeWind (Tailwind CSS)
- **Charts**: react-native-chart-kit
- **Storage**: AsyncStorage
- **Notifications**: expo-notifications
- **PDF Viewer**: react-native-pdf

### DevOps

- **Hosting**: AWS, Google Cloud, or DigitalOcean
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry
- **Analytics**: Mixpanel or Amplitude

---

## 🎯 Quick Start Commands

### Database Setup

```sql
-- Create database
CREATE DATABASE umx_db;

-- Run migrations (all 15 tables)
-- Import schema from this document

-- Seed initial data
-- Domains, tags, admin user, sample students
```

### Backend Setup

```bash
cd backend
npm install

# Environment variables
cp .env.example .env
# Add: DATABASE_URL, JWT_SECRET, SENDGRID_API_KEY

# Run migrations
npm run migrate

# Seed data
npm run seed

# Start server
npm run dev # http://localhost:3000
```

### Frontend Setup

```bash
cd frontend
npm install

# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## 📖 Summary

**Database Tables:** 15  
**API Endpoints:** 40+  
**User Roles:** 3 (Admin, Teacher, Parent)  
**Core Features:** 6 (Users, Students, Goals, Reports, Notifications, Analytics)

**Key Features:**

- ✅ Complete CRUD for students, goals, reports
- ✅ Teacher dashboard with analytics
- ✅ Parent portal with read-only access
- ✅ Real-time notifications
- ✅ PDF export for reports
- ✅ Progress tracking over time
- ✅ Secure authentication & authorization
- ✅ Audit trail for all actions
- ✅ Mobile app support

---

**Document Version:** 2.0 (Complete System)  
**Last Updated:** October 21, 2025  
**Status:** ✅ Ready for Implementation  
**Estimated Development Time:** 12 weeks  
**Team Size:** 2-3 developers (1 backend, 1-2 frontend)
