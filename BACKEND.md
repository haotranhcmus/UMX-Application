# �️ UMX Backend - Supabase Architecture

**Dự án:** UMX - Student Intervention Management System (ABA)  
**Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)  
**Ngày:** 21 tháng 10, 2025  
**Mục đích:** Tài liệu kiến trúc backend, database schema, API design

---

## 📋 Mục Lục

1. [Tổng Quan Backend](#1-tổng-quan-backend)
2. [Database Schema](#2-database-schema)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Supabase Service Functions](#4-supabase-service-functions)
5. [Realtime Subscriptions](#5-realtime-subscriptions)
6. [Storage Structure](#6-storage-structure)
7. [Row Level Security (RLS)](#7-row-level-security-rls)
8. [Edge Functions](#8-edge-functions)
9. [Migration Scripts](#9-migration-scripts)
10. [API Endpoints Summary](#10-api-endpoints-summary)

---

## 1. Tổng Quan Backend

### 🏗️ Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│            (Expo Router + NativeWind)                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS/WebSocket
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Platform                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │   Auth       │  │   Storage    │      │
│  │  Database    │  │   (GoTrue)   │  │   (S3-like)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Realtime    │  │ Edge         │  │    RLS       │      │
│  │  (Broadcast) │  │ Functions    │  │  Policies    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 📊 Tech Stack

- **Database:** PostgreSQL 15+ (via Supabase)
- **Authentication:** Supabase Auth (JWT tokens)
- **File Storage:** Supabase Storage
- **Realtime:** Supabase Realtime (PostgreSQL Change Data Capture)
- **API Layer:** Supabase Auto-generated REST/GraphQL APIs
- **Serverless Functions:** Supabase Edge Functions (Deno)

### 🔑 Key Features

1. **Row Level Security (RLS):** Mọi table đều có RLS policies
2. **Realtime Updates:** Notifications, report updates realtime
3. **Optimistic UI:** Client-side mutations với automatic revalidation
4. **Type Safety:** Auto-generated TypeScript types từ database schema
5. **File Upload:** Avatar, report attachments via Supabase Storage

### 🌍 Environment Variables

```bash
# .env.local (Frontend)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend Edge Functions
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=notifications@umx.app
SMTP_PASS=your-smtp-password
```

---

## 2. Database Schema

### 📐 Entity Relationship Diagram

```
users (auth.users extended)
  │
  ├──< students (primary_teacher_id)
  │     │
  │     ├──< student_goals
  │     │     │
  │     │     └──> goal_templates
  │     │           │
  │     │           ├──> domains (7 ABA domains)
  │     │           └──< goal_template_tags
  │     │                 │
  │     │                 └──> tags
  │     │
  │     ├──< reports
  │     │     │
  │     │     ├──< report_goals (junction: reports ↔ student_goals)
  │     │     └──< report_views (tracking parent views)
  │     │
  │     └──< parent_students (junction: students ↔ parents)
  │           │
  │           └──> parents
  │                 │
  │                 └──< notifications
  │
  └──< activity_logs
```

### 🗃️ Core Tables

#### 1. **users** (extends auth.users)

**Purpose:** Giáo viên (Teachers), Admin accounts

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'supervisor')),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data (except role)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

#### 2. **domains** (7 ABA Intervention Domains)

**Purpose:** 7 lĩnh vực can thiệp ABA chuẩn

```sql
CREATE TABLE public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL CHECK (code IN (
    'IMITATION',
    'RECEPTIVE_LANGUAGE',
    'EXPRESSIVE_LANGUAGE',
    'VISUAL_PERFORMANCE',
    'PLAY_LEISURE',
    'SOCIAL_SKILLS',
    'SELF_HELP'
  )),
  name TEXT NOT NULL, -- Vietnamese name
  name_en TEXT NOT NULL, -- English name
  description TEXT,
  icon TEXT NOT NULL, -- Emoji or icon name
  color TEXT NOT NULL, -- Hex color code
  order_index INTEGER NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_domains_active ON domains(is_active, order_index);

-- RLS: Public read (all authenticated users)
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Domains are viewable by all authenticated users"
  ON domains FOR SELECT
  TO authenticated
  USING (is_active = true);
```

**Seed Data:** See `DOMAINS_AND_GOALS_DATA.md`

---

#### 3. **goal_templates**

**Purpose:** Thư viện mẫu mục tiêu (Goal Templates Library)

```sql
CREATE TABLE public.goal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
  description TEXT NOT NULL, -- English description
  description_vi TEXT, -- Vietnamese translation
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  age_range_min INTEGER, -- months (e.g., 18 for 18 months old)
  age_range_max INTEGER, -- months (e.g., 36 for 36 months old)
  suggested_support_levels TEXT[], -- Array: ['verbal', 'modeling', 'physical']
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT age_range_valid CHECK (
    (age_range_min IS NULL AND age_range_max IS NULL) OR
    (age_range_min < age_range_max)
  )
);

-- Indexes
CREATE INDEX idx_goal_templates_domain ON goal_templates(domain_id);
CREATE INDEX idx_goal_templates_difficulty ON goal_templates(difficulty_level);
CREATE INDEX idx_goal_templates_active ON goal_templates(is_active, domain_id, order_index);

-- RLS: All authenticated users can read
ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Goal templates are viewable by authenticated users"
  ON goal_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Only admins can modify
CREATE POLICY "Only admins can modify goal templates"
  ON goal_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

#### 4. **tags**

**Purpose:** Tags để phân loại goal templates

```sql
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'imitation', 'receptive', 'expressive', 'visual',
    'play', 'social', 'self_help', 'motor', 'support', 'age'
  )),
  description TEXT,
  color TEXT, -- Hex color for UI
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by all authenticated users"
  ON tags FOR SELECT
  TO authenticated
  USING (true);
```

---

#### 5. **goal_template_tags** (Junction Table)

**Purpose:** Many-to-many relationship: goal_templates ↔ tags

```sql
CREATE TABLE public.goal_template_tags (
  goal_template_id UUID NOT NULL REFERENCES goal_templates(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (goal_template_id, tag_id)
);

-- Indexes
CREATE INDEX idx_gtt_template ON goal_template_tags(goal_template_id);
CREATE INDEX idx_gtt_tag ON goal_template_tags(tag_id);

-- RLS
ALTER TABLE goal_template_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Goal template tags are viewable by authenticated users"
  ON goal_template_tags FOR SELECT
  TO authenticated
  USING (true);
```

---

#### 6. **students**

**Purpose:** Thông tin học sinh

```sql
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  avatar_url TEXT,
  primary_teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  medical_notes TEXT,
  special_needs TEXT,
  parent_can_view_medical_notes BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT dob_not_future CHECK (date_of_birth <= CURRENT_DATE)
);

-- Indexes
CREATE INDEX idx_students_teacher ON students(primary_teacher_id);
CREATE INDEX idx_students_status ON students(status) WHERE status = 'active';
CREATE INDEX idx_students_code ON students(student_code);

-- Full-text search
CREATE INDEX idx_students_name_search ON students USING gin(to_tsvector('english', full_name));

-- RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Teachers can view their assigned students
CREATE POLICY "Teachers can view their students"
  ON students FOR SELECT
  TO authenticated
  USING (
    primary_teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM student_teachers st
      WHERE st.student_id = students.id AND st.teacher_id = auth.uid()
    )
  );

-- Teachers can update their assigned students
CREATE POLICY "Teachers can update their students"
  ON students FOR UPDATE
  TO authenticated
  USING (
    primary_teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM student_teachers st
      WHERE st.student_id = students.id AND st.teacher_id = auth.uid()
    )
  );
```

---

#### 7. **student_teachers** (Junction Table)

**Purpose:** Many-to-many: students ↔ teachers (support teachers)

```sql
CREATE TABLE public.student_teachers (
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,

  PRIMARY KEY (student_id, teacher_id)
);

-- RLS
ALTER TABLE student_teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their assignments"
  ON student_teachers FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid());
```

---

#### 8. **student_goals**

**Purpose:** Goals được gán cho học sinh cụ thể

```sql
CREATE TABLE public.student_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  goal_template_id UUID NOT NULL REFERENCES goal_templates(id) ON DELETE RESTRICT,

  -- Progress tracking
  target_progress INTEGER NOT NULL DEFAULT 100 CHECK (target_progress BETWEEN 50 AND 100),
  current_progress INTEGER NOT NULL DEFAULT 0 CHECK (current_progress BETWEEN 0 AND 100),

  -- Status
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started',
    'in_progress',
    'completed',
    'on_hold',
    'discontinued'
  )),

  -- Timeline
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_end_date DATE,
  actual_end_date DATE,

  -- Notes
  notes TEXT,

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT target_date_after_start CHECK (
    target_end_date IS NULL OR target_end_date >= start_date
  ),
  CONSTRAINT actual_end_after_start CHECK (
    actual_end_date IS NULL OR actual_end_date >= start_date
  )
);

-- Indexes
CREATE INDEX idx_student_goals_student ON student_goals(student_id, status);
CREATE INDEX idx_student_goals_template ON student_goals(goal_template_id);
CREATE INDEX idx_student_goals_status ON student_goals(status);

-- RLS
ALTER TABLE student_goals ENABLE ROW LEVEL SECURITY;

-- Teachers can view goals for their students
CREATE POLICY "Teachers can view student goals"
  ON student_goals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_goals.student_id
        AND (s.primary_teacher_id = auth.uid() OR
             EXISTS (SELECT 1 FROM student_teachers st
                     WHERE st.student_id = s.id AND st.teacher_id = auth.uid()))
    )
  );

-- Teachers can insert goals for their students
CREATE POLICY "Teachers can create student goals"
  ON student_goals FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_goals.student_id
        AND (s.primary_teacher_id = auth.uid() OR
             EXISTS (SELECT 1 FROM student_teachers st
                     WHERE st.student_id = s.id AND st.teacher_id = auth.uid()))
    )
  );

-- Teachers can update goals they created
CREATE POLICY "Teachers can update student goals"
  ON student_goals FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());
```

---

#### 9. **reports**

**Purpose:** Báo cáo tiến độ buổi học

```sql
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Session info
  session_date DATE NOT NULL,
  session_duration INTEGER NOT NULL CHECK (session_duration > 0), -- minutes
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  participation_level TEXT NOT NULL CHECK (participation_level IN ('high', 'medium', 'low')),

  -- Notes
  notes TEXT,
  recommendations TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),
  visible_to_parents BOOLEAN NOT NULL DEFAULT true,

  -- Review (optional - by supervisor)
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT session_date_not_future CHECK (session_date <= CURRENT_DATE)
);

-- Indexes
CREATE INDEX idx_reports_student ON reports(student_id, session_date DESC);
CREATE INDEX idx_reports_teacher ON reports(teacher_id, session_date DESC);
CREATE INDEX idx_reports_status ON reports(status, session_date DESC);
CREATE INDEX idx_reports_date ON reports(session_date DESC);

-- RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Teachers can view reports for their students
CREATE POLICY "Teachers can view reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = reports.student_id
        AND (s.primary_teacher_id = auth.uid() OR
             EXISTS (SELECT 1 FROM student_teachers st
                     WHERE st.student_id = s.id AND st.teacher_id = auth.uid()))
    )
  );

-- Teachers can create reports for their students
CREATE POLICY "Teachers can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = reports.student_id
        AND (s.primary_teacher_id = auth.uid() OR
             EXISTS (SELECT 1 FROM student_teachers st
                     WHERE st.student_id = s.id AND st.teacher_id = auth.uid()))
    )
  );

-- Teachers can update their own reports
CREATE POLICY "Teachers can update own reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid());
```

---

#### 10. **report_goals** (Junction Table + Data)

**Purpose:** Goals recorded trong mỗi report

```sql
CREATE TABLE public.report_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  student_goal_id UUID NOT NULL REFERENCES student_goals(id) ON DELETE RESTRICT,

  -- Progress data
  progress_recorded INTEGER NOT NULL CHECK (progress_recorded BETWEEN 0 AND 100),
  previous_progress INTEGER NOT NULL CHECK (previous_progress BETWEEN 0 AND 100),

  -- Support level used
  support_level TEXT NOT NULL CHECK (support_level IN (
    'independent',
    'verbal',
    'modeling',
    'physical',
    'full_physical'
  )),

  -- Observations
  observations TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (report_id, student_goal_id)
);

-- Indexes
CREATE INDEX idx_report_goals_report ON report_goals(report_id);
CREATE INDEX idx_report_goals_student_goal ON report_goals(student_goal_id);

-- RLS
ALTER TABLE report_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view report goals through reports"
  ON report_goals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reports r
      WHERE r.id = report_goals.report_id
        AND (
          r.teacher_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = r.student_id
              AND (s.primary_teacher_id = auth.uid() OR
                   EXISTS (SELECT 1 FROM student_teachers st
                           WHERE st.student_id = s.id AND st.teacher_id = auth.uid()))
          )
        )
    )
  );
```

---

#### 11. **parents**

**Purpose:** Tài khoản phụ huynh

```sql
CREATE TABLE public.parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Hashed via Supabase Auth or custom
  full_name TEXT NOT NULL,
  phone TEXT,
  relationship TEXT CHECK (relationship IN ('mother', 'father', 'guardian', 'other')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_parents_email ON parents(email) WHERE is_active = true;

-- RLS
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own profile"
  ON parents FOR SELECT
  USING (
    id = (current_setting('app.parent_id', true))::uuid OR
    email = auth.jwt() ->> 'email'
  );

CREATE POLICY "Parents can update own profile"
  ON parents FOR UPDATE
  USING (
    id = (current_setting('app.parent_id', true))::uuid
  );
```

---

#### 12. **parent_students** (Junction Table)

**Purpose:** Many-to-many: parents ↔ students

```sql
CREATE TABLE public.parent_students (
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL, -- 'mother', 'father', 'guardian'
  is_primary BOOLEAN DEFAULT false, -- Primary contact parent
  can_receive_notifications BOOLEAN DEFAULT true,
  can_view_reports BOOLEAN DEFAULT true,
  assigned_date DATE DEFAULT CURRENT_DATE,

  PRIMARY KEY (parent_id, student_id)
);

-- Indexes
CREATE INDEX idx_parent_students_parent ON parent_students(parent_id);
CREATE INDEX idx_parent_students_student ON parent_students(student_id);

-- RLS
ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their children"
  ON parent_students FOR SELECT
  USING (
    parent_id = (current_setting('app.parent_id', true))::uuid
  );
```

---

#### 13. **report_views**

**Purpose:** Tracking khi phụ huynh xem report

```sql
CREATE TABLE public.report_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  view_duration_seconds INTEGER DEFAULT 0,
  device_type TEXT, -- 'ios', 'android', 'web'

  UNIQUE (report_id, parent_id)
);

-- Indexes
CREATE INDEX idx_report_views_report ON report_views(report_id);
CREATE INDEX idx_report_views_parent ON report_views(parent_id, viewed_at DESC);

-- RLS
ALTER TABLE report_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their own report views"
  ON report_views FOR SELECT
  USING (
    parent_id = (current_setting('app.parent_id', true))::uuid
  );

CREATE POLICY "Parents can insert their report views"
  ON report_views FOR INSERT
  WITH CHECK (
    parent_id = (current_setting('app.parent_id', true))::uuid
  );
```

---

#### 14. **notifications**

**Purpose:** Thông báo cho phụ huynh

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,

  -- Notification content
  type TEXT NOT NULL CHECK (type IN (
    'new_report',
    'goal_completed',
    'announcement',
    'schedule_change',
    'reminder'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Related entity
  related_entity_type TEXT CHECK (related_entity_type IN ('report', 'goal', 'announcement')),
  related_entity_id UUID,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Channels
  channels JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_push BOOLEAN DEFAULT false,

  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_parent ON notifications(parent_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(parent_id) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type, created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their notifications"
  ON notifications FOR SELECT
  USING (
    parent_id = (current_setting('app.parent_id', true))::uuid
  );

CREATE POLICY "Parents can update their notifications"
  ON notifications FOR UPDATE
  USING (
    parent_id = (current_setting('app.parent_id', true))::uuid
  );
```

---

#### 15. **activity_logs**

**Purpose:** Audit trail cho tất cả actions

```sql
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'login', 'logout')),
  entity_type TEXT NOT NULL, -- 'student', 'goal', 'report', etc.
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_activity_logs_date ON activity_logs(created_at DESC);

-- RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Only admins can view activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

### 📊 Database Relationships Summary

```
Domains (7 fixed)
  └──< Goal Templates (~200)
        └──< Student Goals (per student)
              └──< Report Goals (per report)

Students
  ├──< Student Goals
  ├──< Reports
  │     └──< Report Goals
  └──< Parent-Student (junction)
        └──> Parents
              └──< Notifications
```

---

## 3. Authentication & Authorization

### 🔐 Authentication Flow

#### Teacher/Admin Auth (Supabase Auth)

```typescript
// services/auth.service.ts
import { supabase } from "./supabase";

export const authService = {
  // Login
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Update last_login_at
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user.id);

    return data;
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session);
    });
  },
};
```

#### Parent Auth (Custom with JWT)

```typescript
// services/parent-auth.service.ts
export const parentAuthService = {
  async login(email: string, password: string) {
    // Call Edge Function để verify
    const { data, error } = await supabase.functions.invoke("parent-auth", {
      body: { action: "login", email, password },
    });

    if (error) throw error;

    // Store JWT token
    await AsyncStorage.setItem("parent_token", data.token);
    await AsyncStorage.setItem("parent_id", data.parent.id);

    return data;
  },

  async logout() {
    await AsyncStorage.removeItem("parent_token");
    await AsyncStorage.removeItem("parent_id");
  },

  async getToken() {
    return await AsyncStorage.getItem("parent_token");
  },
};
```

### 🛡️ Authorization Levels

| Role           | Permissions                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| **Admin**      | Full access: CRUD all tables, manage users, view all students/reports       |
| **Teacher**    | CRUD own students, create/update reports, view templates, limited analytics |
| **Supervisor** | View all, add review notes to reports, analytics                            |
| **Parent**     | View own children data, reports (visible_to_parents=true), goals progress   |

### 🔒 Row Level Security (RLS) Pattern

**Example: students table**

```sql
-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy 1: Teachers can SELECT their students
CREATE POLICY "teachers_select_students" ON students
  FOR SELECT
  TO authenticated
  USING (
    primary_teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM student_teachers st
      WHERE st.student_id = students.id AND st.teacher_id = auth.uid()
    )
  );

-- Policy 2: Teachers can UPDATE their students
CREATE POLICY "teachers_update_students" ON students
  FOR UPDATE
  TO authenticated
  USING (
    primary_teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM student_teachers st
      WHERE st.student_id = students.id AND st.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    primary_teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM student_teachers st
      WHERE st.student_id = students.id AND st.teacher_id = auth.uid()
    )
  );

-- Policy 3: Only admins can INSERT students
CREATE POLICY "admins_insert_students" ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 4. Supabase Service Functions

### 📦 Domain Service

```typescript
// services/domain.service.ts
import { supabase } from "./supabase";
import type { Database } from "../types/database.types";

type Domain = Database["public"]["Tables"]["domains"]["Row"];

export const domainService = {
  // Fetch all active domains
  async fetchDomains(): Promise<Domain[]> {
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .eq("is_active", true)
      .order("order_index");

    if (error) throw error;
    return data;
  },

  // Fetch domain with goal templates count
  async fetchDomainWithTemplatesCount(domainId: string) {
    const { data, error } = await supabase
      .from("domains")
      .select(
        `
        *,
        goal_templates(count)
      `
      )
      .eq("id", domainId)
      .single();

    if (error) throw error;
    return data;
  },

  // Fetch all domains with templates count
  async fetchDomainsWithStats() {
    const { data, error } = await supabase
      .from("domains")
      .select(
        `
        *,
        goal_templates!inner(id, difficulty_level)
      `
      )
      .eq("is_active", true)
      .order("order_index");

    if (error) throw error;

    // Group templates by domain
    const domainsWithStats = data.reduce((acc, domain) => {
      const existingDomain = acc.find((d) => d.id === domain.id);

      if (!existingDomain) {
        acc.push({
          ...domain,
          templates_count: domain.goal_templates?.length || 0,
          easy_count:
            domain.goal_templates?.filter((t) => t.difficulty_level === "easy")
              .length || 0,
          medium_count:
            domain.goal_templates?.filter(
              (t) => t.difficulty_level === "medium"
            ).length || 0,
          hard_count:
            domain.goal_templates?.filter((t) => t.difficulty_level === "hard")
              .length || 0,
        });
      }

      return acc;
    }, []);

    return domainsWithStats;
  },
};
```

---

### 📚 Goal Template Service

```typescript
// services/goal-template.service.ts
export const goalTemplateService = {
  // Fetch templates by domain
  async fetchTemplatesByDomain(
    domainId: string,
    options?: {
      difficulty?: "easy" | "medium" | "hard";
      searchQuery?: string;
      excludeAssigned?: boolean;
      studentId?: string;
    }
  ) {
    let query = supabase
      .from("goal_templates")
      .select(
        `
        *,
        domain:domains(id, name, color, icon),
        goal_template_tags(
          tag:tags(id, name, category, color)
        )
      `
      )
      .eq("domain_id", domainId)
      .eq("is_active", true);

    // Apply filters
    if (options?.difficulty) {
      query = query.eq("difficulty_level", options.difficulty);
    }

    if (options?.searchQuery) {
      query = query.ilike("description", `%${options.searchQuery}%`);
    }

    query = query.order("order_index");

    const { data, error } = await query;
    if (error) throw error;

    // Check if already assigned (if studentId provided)
    if (options?.excludeAssigned && options?.studentId) {
      const { data: assignedGoals } = await supabase
        .from("student_goals")
        .select("goal_template_id")
        .eq("student_id", options.studentId)
        .in("status", ["not_started", "in_progress"]);

      const assignedIds = new Set(
        assignedGoals?.map((g) => g.goal_template_id) || []
      );

      return data.map((template) => ({
        ...template,
        is_assigned: assignedIds.has(template.id),
      }));
    }

    return data;
  },

  // Fetch single template with full details
  async fetchTemplateDetails(templateId: string) {
    const { data, error } = await supabase
      .from("goal_templates")
      .select(
        `
        *,
        domain:domains(*),
        goal_template_tags(
          tag:tags(*)
        )
      `
      )
      .eq("id", templateId)
      .single();

    if (error) throw error;
    return data;
  },
};
```

---

### 👨‍🎓 Student Service

```typescript
// services/student.service.ts
export const studentService = {
  // Fetch students for current teacher
  async fetchMyStudents(filters?: {
    status?: "active" | "inactive" | "graduated";
    searchQuery?: string;
    sortBy?: "name" | "recent" | "rating";
  }) {
    let query = supabase.from("students").select(`
        *,
        primary_teacher:users!primary_teacher_id(id, full_name, avatar_url),
        student_goals(id, status),
        reports(id, rating, session_date)
      `);

    // Apply filters
    if (filters?.status) {
      query = query.eq("status", filters.status);
    } else {
      query = query.eq("status", "active");
    }

    if (filters?.searchQuery) {
      query = query.or(
        `full_name.ilike.%${filters.searchQuery}%,student_code.ilike.%${filters.searchQuery}%`
      );
    }

    // Default sort by name
    if (filters?.sortBy === "name") {
      query = query.order("full_name");
    } else if (filters?.sortBy === "recent") {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    // Calculate stats
    return data.map((student) => ({
      ...student,
      total_goals: student.student_goals?.length || 0,
      active_goals:
        student.student_goals?.filter((g) => g.status === "in_progress")
          .length || 0,
      total_reports: student.reports?.length || 0,
      avg_rating:
        student.reports?.length > 0
          ? student.reports.reduce((sum, r) => sum + (r.rating || 0), 0) /
            student.reports.length
          : 0,
    }));
  },

  // Fetch student detail
  async fetchStudentDetail(studentId: string) {
    const { data, error } = await supabase
      .from("students")
      .select(
        `
        *,
        primary_teacher:users!primary_teacher_id(id, full_name, phone, email, avatar_url),
        student_teachers(
          teacher:users(id, full_name, avatar_url)
        )
      `
      )
      .eq("id", studentId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create student
  async createStudent(studentData: {
    student_code: string;
    full_name: string;
    date_of_birth: string;
    gender?: "male" | "female" | "other";
    primary_teacher_id: string;
    medical_notes?: string;
    special_needs?: string;
  }) {
    const { data, error } = await supabase
      .from("students")
      .insert({
        ...studentData,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update student
  async updateStudent(studentId: string, updates: Partial<Student>) {
    const { data, error } = await supabase
      .from("students")
      .update(updates)
      .eq("id", studentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
```

---

### 🎯 Student Goal Service

```typescript
// services/student-goal.service.ts
export const studentGoalService = {
  // Fetch goals for a student
  async fetchStudentGoals(studentId: string, status?: string[]) {
    let query = supabase
      .from("student_goals")
      .select(
        `
        *,
        goal_template:goal_templates!inner(
          id,
          description,
          description_vi,
          difficulty_level,
          domain:domains(id, name, name_en, icon, color, order_index)
        ),
        report_goals(
          id,
          progress_recorded,
          created_at,
          report:reports(session_date)
        )
      `
      )
      .eq("student_id", studentId);

    if (status && status.length > 0) {
      query = query.in("status", status);
    }

    query = query.order("start_date", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Calculate stats
    return data.map((goal) => ({
      ...goal,
      times_practiced: goal.report_goals?.length || 0,
      last_practiced: goal.report_goals?.[0]?.report?.session_date || null,
      days_active: goal.start_date
        ? Math.floor(
            (Date.now() - new Date(goal.start_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0,
    }));
  },

  // Create student goal
  async createStudentGoal(goalData: {
    student_id: string;
    goal_template_id: string;
    target_progress?: number;
    start_date?: string;
    target_end_date?: string;
    notes?: string;
  }) {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("student_goals")
      .insert({
        ...goalData,
        target_progress: goalData.target_progress || 100,
        start_date:
          goalData.start_date || new Date().toISOString().split("T")[0],
        created_by: user.user?.id,
      })
      .select(
        `
        *,
        goal_template:goal_templates(
          *,
          domain:domains(*)
        )
      `
      )
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.user?.id,
      action: "create",
      entity_type: "student_goal",
      entity_id: data.id,
      new_values: data,
    });

    return data;
  },

  // Update goal progress (usually done via report)
  async updateGoalProgress(goalId: string, newProgress: number) {
    const { data: goal } = await supabase
      .from("student_goals")
      .select("target_progress, status")
      .eq("id", goalId)
      .single();

    const newStatus =
      newProgress >= (goal?.target_progress || 100)
        ? "completed"
        : newProgress > 0
        ? "in_progress"
        : "not_started";

    const { data, error } = await supabase
      .from("student_goals")
      .update({
        current_progress: newProgress,
        status: newStatus,
        actual_end_date:
          newStatus === "completed"
            ? new Date().toISOString().split("T")[0]
            : null,
      })
      .eq("id", goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
```

---

### 📝 Report Service

```typescript
// services/report.service.ts
export const reportService = {
  // Create report (multi-step transaction)
  async createReport(reportData: {
    student_id: string;
    session_date: string;
    session_duration: number;
    rating: number;
    participation_level: "high" | "medium" | "low";
    notes?: string;
    recommendations?: string;
    visible_to_parents?: boolean;
    status: "draft" | "submitted";
    goals: Array<{
      student_goal_id: string;
      progress_recorded: number;
      support_level: string;
      observations?: string;
      notes?: string;
    }>;
  }) {
    const { data: user } = await supabase.auth.getUser();

    // 1. Insert report
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        student_id: reportData.student_id,
        teacher_id: user.user?.id,
        session_date: reportData.session_date,
        session_duration: reportData.session_duration,
        rating: reportData.rating,
        participation_level: reportData.participation_level,
        notes: reportData.notes,
        recommendations: reportData.recommendations,
        visible_to_parents: reportData.visible_to_parents ?? true,
        status: reportData.status,
      })
      .select()
      .single();

    if (reportError) throw reportError;

    // 2. Insert report_goals and update student_goals
    for (const goalData of reportData.goals) {
      // Get previous progress
      const { data: studentGoal } = await supabase
        .from("student_goals")
        .select("current_progress")
        .eq("id", goalData.student_goal_id)
        .single();

      // Insert report_goal
      await supabase.from("report_goals").insert({
        report_id: report.id,
        student_goal_id: goalData.student_goal_id,
        progress_recorded: goalData.progress_recorded,
        previous_progress: studentGoal?.current_progress || 0,
        support_level: goalData.support_level,
        observations: goalData.observations,
        notes: goalData.notes,
      });

      // Update student_goal progress
      await studentGoalService.updateGoalProgress(
        goalData.student_goal_id,
        goalData.progress_recorded
      );
    }

    // 3. If submitted, send notifications to parents
    if (reportData.status === "submitted") {
      await notificationService.sendReportNotification(report.id);
    }

    // 4. Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.user?.id,
      action: "create",
      entity_type: "report",
      entity_id: report.id,
      new_values: report,
    });

    return report;
  },

  // Fetch reports for student
  async fetchStudentReports(
    studentId: string,
    filters?: {
      from_date?: string;
      to_date?: string;
      status?: string;
    }
  ) {
    let query = supabase
      .from("reports")
      .select(
        `
        *,
        teacher:users!teacher_id(id, full_name, avatar_url),
        report_goals(
          id,
          progress_recorded,
          previous_progress,
          student_goal:student_goals(
            id,
            goal_template:goal_templates(
              description,
              domain:domains(name, color, icon)
            )
          )
        )
      `
      )
      .eq("student_id", studentId);

    if (filters?.from_date) {
      query = query.gte("session_date", filters.from_date);
    }

    if (filters?.to_date) {
      query = query.lte("session_date", filters.to_date);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    query = query.order("session_date", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return data.map((report) => ({
      ...report,
      goals_count: report.report_goals?.length || 0,
      avg_progress_change:
        report.report_goals?.length > 0
          ? report.report_goals.reduce(
              (sum, rg) => sum + (rg.progress_recorded - rg.previous_progress),
              0
            ) / report.report_goals.length
          : 0,
    }));
  },

  // Fetch report detail
  async fetchReportDetail(reportId: string) {
    const { data, error } = await supabase
      .from("reports")
      .select(
        `
        *,
        student:students(id, full_name, student_code, avatar_url),
        teacher:users!teacher_id(id, full_name, avatar_url),
        report_goals(
          *,
          student_goal:student_goals(
            id,
            target_progress,
            current_progress,
            status,
            goal_template:goal_templates(
              id,
              description,
              description_vi,
              domain:domains(id, name, name_en, icon, color, order_index)
            )
          )
        ),
        report_views(
          *,
          parent:parents(id, full_name, relationship)
        )
      `
      )
      .eq("id", reportId)
      .single();

    if (error) throw error;
    return data;
  },
};
```

---

### 🔔 Notification Service

```typescript
// services/notification.service.ts
export const notificationService = {
  // Send report notification to parents
  async sendReportNotification(reportId: string) {
    // Get report details
    const { data: report } = await supabase
      .from("reports")
      .select(
        `
        *,
        student:students(id, full_name)
      `
      )
      .eq("id", reportId)
      .single();

    if (!report) return;

    // Get all parents for this student
    const { data: parentStudents } = await supabase
      .from("parent_students")
      .select("parent_id, parent:parents(id, full_name, email)")
      .eq("student_id", report.student_id)
      .eq("can_receive_notifications", true);

    if (!parentStudents || parentStudents.length === 0) return;

    // Create notifications
    const notifications = parentStudents.map((ps) => ({
      parent_id: ps.parent_id,
      student_id: report.student_id,
      type: "new_report",
      title: "Báo cáo học tập mới",
      message: `Báo cáo buổi học ngày ${report.session_date} đã được tạo cho ${report.student.full_name}`,
      related_entity_type: "report",
      related_entity_id: reportId,
      channels: { email: true, push: true },
      created_by: report.teacher_id,
    }));

    const { error } = await supabase
      .from("notifications")
      .insert(notifications);

    if (error) throw error;

    // Trigger Edge Function để gửi email
    await supabase.functions.invoke("send-notification-email", {
      body: {
        reportId,
        parentEmails: parentStudents.map((ps) => ps.parent.email),
      },
    });
  },

  // Fetch parent notifications
  async fetchParentNotifications(parentId: string, unreadOnly = false) {
    let query = supabase
      .from("notifications")
      .select(
        `
        *,
        student:students(id, full_name, avatar_url)
      `
      )
      .eq("parent_id", parentId);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    query = query.order("created_at", { ascending: false }).limit(50);

    const { data, error } = await query;
    if (error) throw error;

    return data;
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId);

    if (error) throw error;
  },

  // Mark all as read
  async markAllAsRead(parentId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("parent_id", parentId)
      .eq("is_read", false);

    if (error) throw error;
  },
};
```

---

## 5. Realtime Subscriptions

```mermaid
flowchart TD
    Start([Giáo viên đăng nhập]) --> Dashboard[Dashboard Screen]
    Dashboard --> StudentList[Students List Screen]
    StudentList --> SelectStudent{Chọn học sinh}
    SelectStudent --> StudentDetail[Student Detail Screen]

    StudentDetail --> ViewGoals[Xem Goals Tab]
    ViewGoals --> CheckExisting{Có goals hiện tại?}
    CheckExisting -->|Có| ShowGoalsList[Hiển thị danh sách goals]
    CheckExisting -->|Chưa| EmptyState[Empty state]

    ShowGoalsList --> AddNewGoal[Click 'Add Goal']
    EmptyState --> AddNewGoal

    AddNewGoal --> SelectDomain[Select Domain Screen]
    SelectDomain --> ChooseDomain{Chọn Domain}
    ChooseDomain --> GoalTemplatesList[Goal Templates List Screen]

    GoalTemplatesList --> FilterTemplate{Lọc/Tìm kiếm?}
    FilterTemplate -->|Có| ApplyFilter[Apply filters]
    FilterTemplate -->|Không| SelectTemplate{Chọn Template}
    ApplyFilter --> SelectTemplate

    SelectTemplate --> PreviewTemplate[Goal Preview Screen]
    PreviewTemplate --> ReviewInfo{Review thông tin}
    ReviewInfo -->|Chỉnh sửa| EditGoal[Edit Goal Details Screen]
    ReviewInfo -->|OK| ConfirmCreate

    EditGoal --> SetProgress[Nhập target progress %]
    EditGoal --> SetTimeline[Chọn timeline]
    EditGoal --> AddNotes[Thêm notes]

    SetProgress --> ConfirmCreate{Xác nhận tạo}
    SetTimeline --> ConfirmCreate
    AddNotes --> ConfirmCreate

    ConfirmCreate -->|Hủy| StudentDetail
    ConfirmCreate -->|Lưu| ValidateData{Validate dữ liệu}

    ValidateData -->|Lỗi| ShowError[Hiển thị lỗi]
    ShowError --> EditGoal

    ValidateData -->|OK| SaveToDB[(Lưu vào student_goals)]
    SaveToDB --> CreateLog[(Ghi activity_logs)]
    CreateLog --> Success[Thông báo thành công]
    Success --> RefreshGoals[Refresh Goals List]
    RefreshGoals --> StudentDetail

    StudentDetail --> End([Kết thúc])
```

### 🔄 Các Bước Chi Tiết

#### Bước 1: Chọn Học Sinh

- **Screen:** Students List Screen
- **Action:** Giáo viên chọn học sinh cần gán mục tiêu
- **Database Query:**
  ```sql
  SELECT s.*, u.full_name as teacher_name,
         COUNT(sg.id) as total_goals
  FROM students s
  LEFT JOIN users u ON s.primary_teacher_id = u.id
  LEFT JOIN student_goals sg ON s.id = sg.student_id
  WHERE s.status = 'active'
  GROUP BY s.id
  ```

#### Bước 2: Xem Goals Hiện Tại

- **Screen:** Student Detail Screen (Goals Tab)
- **Action:** Hiển thị danh sách goals hiện có của học sinh
- **Database Query:**
  ```sql
  SELECT sg.*, gt.description, d.name as domain_name,
         gt.difficulty_level, sg.current_progress, sg.target_progress
  FROM student_goals sg
  JOIN goal_templates gt ON sg.goal_template_id = gt.id
  JOIN domains d ON gt.domain_id = d.id
  WHERE sg.student_id = :student_id
  ORDER BY sg.start_date DESC
  ```

#### Bước 3: Chọn Domain

- **Screen:** Select Domain Screen
- **Action:** Chọn lĩnh vực mục tiêu (Imitation, Language, etc.)
- **Database Query:**
  ```sql
  SELECT id, name, description, icon, color,
         (SELECT COUNT(*) FROM goal_templates WHERE domain_id = d.id) as total_templates
  FROM domains d
  WHERE is_active = true
  ORDER BY order_index
  ```

#### Bước 4: Chọn Goal Template

- **Screen:** Goal Templates List Screen
- **Action:** Chọn mục tiêu từ thư viện templates
- **Database Query:**
  ```sql
  SELECT gt.*, d.name as domain_name,
         GROUP_CONCAT(t.name) as tags
  FROM goal_templates gt
  JOIN domains d ON gt.domain_id = d.id
  LEFT JOIN goal_template_tags gtt ON gt.id = gtt.goal_template_id
  LEFT JOIN tags t ON gtt.tag_id = t.id
  WHERE gt.domain_id = :domain_id
    AND gt.is_active = true
  GROUP BY gt.id
  ORDER BY gt.order_index
  ```

#### Bước 5: Cấu Hình Goal

- **Screen:** Edit Goal Details Screen
- **Input Fields:**
  - `target_progress`: Mục tiêu % (default 100%)
  - `start_date`: Ngày bắt đầu (default hôm nay)
  - `target_end_date`: Ngày dự kiến hoàn thành (optional)
  - `notes`: Ghi chú (optional)

#### Bước 6: Lưu Database

- **Table:** `student_goals`
- **Insert Data:**
  ```sql
  INSERT INTO student_goals (
    student_id,
    goal_template_id,
    target_progress,
    current_progress,
    status,
    start_date,
    target_end_date,
    notes,
    created_by
  ) VALUES (
    :student_id,
    :goal_template_id,
    :target_progress,
    0, -- current_progress starts at 0
    'not_started',
    :start_date,
    :target_end_date,
    :notes,
    :teacher_id
  )
  ```

#### Bước 7: Activity Log

- **Table:** `activity_logs`
- **Insert Data:**
  ```sql
  INSERT INTO activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    new_values
  ) VALUES (
    :teacher_id,
    'create',
    'student_goal',
    :goal_id,
    :goal_data_json
  )
  ```

---

## 2. Luồng Tạo Báo Cáo (Create Report)

### 📝 Mục đích

Giáo viên tạo báo cáo tiến độ cho buổi học, cập nhật progress của các goals.

### 📊 Flowchart Mermaid

```mermaid
flowchart TD
    Start([Giáo viên đăng nhập]) --> Dashboard[Dashboard Screen]
    Dashboard --> ReportNav{Tạo báo cáo}

    ReportNav -->|Option 1| StudentList1[Từ Students List]
    ReportNav -->|Option 2| ReportsList[Từ Reports List]

    StudentList1 --> SelectStudent1[Chọn học sinh]
    SelectStudent1 --> StudentDetail1[Student Detail Screen]
    StudentDetail1 --> ClickCreateReport[Click 'Create Report']

    ReportsList --> ClickNewReport[Click 'New Report']
    ClickNewReport --> SelectStudent2[Select Student Screen]
    SelectStudent2 --> StudentDetail1

    ClickCreateReport --> CreateReportForm[Create Report Form Screen - Step 1]

    %% Step 1: Basic Info
    CreateReportForm --> InputBasicInfo[Nhập thông tin cơ bản]
    InputBasicInfo --> SessionDate[Session date]
    InputBasicInfo --> Duration[Duration minutes]
    InputBasicInfo --> Rating[Rating 1-5 stars]
    InputBasicInfo --> ParticipationLevel[Participation level]

    SessionDate --> ValidateStep1{Validate Step 1}
    Duration --> ValidateStep1
    Rating --> ValidateStep1
    ParticipationLevel --> ValidateStep1

    ValidateStep1 -->|Lỗi| ShowError1[Hiển thị lỗi]
    ShowError1 --> CreateReportForm
    ValidateStep1 -->|OK| LoadGoals[(Load student active goals)]

    %% Step 2: Select Goals
    LoadGoals --> SelectGoalsScreen[Select Goals Screen - Step 2]
    SelectGoalsScreen --> ShowActiveGoals[Hiển thị active goals]
    ShowActiveGoals --> SelectGoals{Chọn goals để đánh giá}
    SelectGoals -->|Chưa chọn| EmptyGoals[Empty state: Phải chọn ít nhất 1 goal]
    EmptyGoals --> SelectGoals
    SelectGoals -->|Đã chọn| NextToProgress[Next: Record Progress]

    %% Step 3: Record Progress
    NextToProgress --> RecordProgressScreen[Record Progress Screen - Step 3]
    RecordProgressScreen --> GoalProgress[Với mỗi goal đã chọn]

    GoalProgress --> InputProgress[Nhập progress %]
    GoalProgress --> SelectSupport[Chọn support level]
    GoalProgress --> AddObservation[Nhập observations/notes]

    InputProgress --> ValidateProgress{Validate progress data}
    SelectSupport --> ValidateProgress
    AddObservation --> ValidateProgress

    ValidateProgress -->|Lỗi| ShowError2[Hiển thị lỗi]
    ShowError2 --> RecordProgressScreen
    ValidateProgress -->|OK| NextGoal{Còn goal nào?}

    NextGoal -->|Có| GoalProgress
    NextGoal -->|Không| ReviewScreen

    %% Step 4: Review & Notes
    ReviewScreen[Review Screen - Step 4]
    ReviewScreen --> AddGeneralNotes[Thêm general notes]
    ReviewScreen --> AddRecommendations[Thêm recommendations]
    ReviewScreen --> PreviewReport[Preview toàn bộ report]

    AddGeneralNotes --> FinalReview{Review final}
    AddRecommendations --> FinalReview
    PreviewReport --> FinalReview

    FinalReview -->|Edit| BackToStep{Quay lại bước nào?}
    BackToStep -->|Step 1| CreateReportForm
    BackToStep -->|Step 2| SelectGoalsScreen
    BackToStep -->|Step 3| RecordProgressScreen

    FinalReview -->|Save as Draft| SaveDraft[(Save as 'draft')]
    FinalReview -->|Submit| SaveSubmit[(Save as 'submitted')]

    %% Save to Database
    SaveDraft --> InsertReport[(INSERT INTO reports)]
    SaveSubmit --> InsertReport

    InsertReport --> InsertReportGoals[(INSERT INTO report_goals)]
    InsertReportGoals --> UpdateStudentGoals[(UPDATE student_goals progress)]
    UpdateStudentGoals --> CheckCompleted{Goal completed?}

    CheckCompleted -->|Có| UpdateGoalStatus[(UPDATE goal status = 'completed')]
    CheckCompleted -->|Không| CreateActivityLog
    UpdateGoalStatus --> NotifyParentGoal[(Notify parent: goal completed)]
    NotifyParentGoal --> CreateActivityLog

    CreateActivityLog[(INSERT INTO activity_logs)]
    CreateActivityLog --> CheckSubmitted{Status = submitted?}

    CheckSubmitted -->|Có| NotifyParentReport[(Notify parent: new report)]
    CheckSubmitted -->|Không| SuccessMessage

    NotifyParentReport --> InsertNotification[(INSERT INTO notifications)]
    InsertNotification --> SendEmail[Send email optional]
    SendEmail --> SuccessMessage[Thông báo thành công]

    SuccessMessage --> NavigateToReport[Navigate to Report Detail]
    NavigateToReport --> End([Kết thúc])
```

### 🔄 Các Bước Chi Tiết

#### Step 1: Basic Information

- **Screen:** Create Report Form Screen
- **Input Fields:**
  - `session_date`: Ngày buổi học (default: hôm nay)
  - `session_duration`: Thời lượng phút (default: 60)
  - `rating`: Đánh giá 1-5 sao
  - `participation_level`: High / Medium / Low
- **Validation:**
  - session_date không được là tương lai
  - session_duration > 0
  - rating trong khoảng 1-5

#### Step 2: Select Goals

- **Screen:** Select Goals Screen
- **Database Query:**
  ```sql
  SELECT sg.*, gt.description, d.name as domain_name,
         sg.current_progress, sg.target_progress,
         (SELECT progress_recorded FROM report_goals rg
          JOIN reports r ON rg.report_id = r.id
          WHERE rg.student_goal_id = sg.id
          ORDER BY r.session_date DESC LIMIT 1) as last_progress
  FROM student_goals sg
  JOIN goal_templates gt ON sg.goal_template_id = gt.id
  JOIN domains d ON gt.domain_id = d.id
  WHERE sg.student_id = :student_id
    AND sg.status IN ('not_started', 'in_progress')
  ORDER BY d.order_index, gt.order_index
  ```
- **UI Display:**
  - Checkbox list grouped by domain
  - Show current progress bar
  - Show last recorded progress
  - Minimum: phải chọn ít nhất 1 goal

#### Step 3: Record Progress

- **Screen:** Record Progress Screen
- **For each selected goal:**
  - **Display:**
    - Goal description
    - Current progress (before)
    - Last session progress
  - **Input Fields:**
    - `progress_recorded`: Progress % (0-100)
    - `support_level`: Dropdown
      - Independent
      - Verbal prompt
      - Partial physical support
      - Full physical support
      - Modeling
    - `observations`: Textarea - Quan sát chi tiết
    - `notes`: Textarea - Ghi chú bổ sung
  - **Validation:**
    - progress_recorded trong khoảng 0-100
    - Hiển thị warning nếu progress giảm

#### Step 4: Review & Notes

- **Screen:** Review Screen
- **Display:**
  - Summary của tất cả thông tin đã nhập
  - List goals với progress mới
  - Preview progress changes
- **Input Fields:**
  - `notes`: General notes về buổi học
  - `recommendations`: Khuyến nghị cho phụ huynh/buổi sau
  - `visible_to_parents`: Checkbox (default: true)
- **Actions:**
  - Save as Draft: Lưu nhưng chưa gửi
  - Submit: Lưu và gửi thông báo cho phụ huynh

#### Step 5: Save to Database

**Table 1: `reports`**

```sql
INSERT INTO reports (
  student_id,
  teacher_id,
  session_date,
  session_duration,
  rating,
  participation_level,
  notes,
  recommendations,
  status,
  visible_to_parents
) VALUES (
  :student_id,
  :teacher_id,
  :session_date,
  :session_duration,
  :rating,
  :participation_level,
  :notes,
  :recommendations,
  :status, -- 'draft' or 'submitted'
  :visible_to_parents
)
```

**Table 2: `report_goals`** (Multiple inserts)

```sql
INSERT INTO report_goals (
  report_id,
  student_goal_id,
  progress_recorded,
  previous_progress,
  notes,
  observations,
  support_level
) VALUES (
  :report_id,
  :student_goal_id,
  :progress_recorded,
  :previous_progress,
  :notes,
  :observations,
  :support_level
)
```

**Table 3: Update `student_goals`**

```sql
UPDATE student_goals
SET
  current_progress = :new_progress,
  status = CASE
    WHEN :new_progress >= target_progress THEN 'completed'
    WHEN :new_progress > 0 THEN 'in_progress'
    ELSE status
  END,
  actual_end_date = CASE
    WHEN :new_progress >= target_progress THEN CURRENT_DATE
    ELSE actual_end_date
  END,
  updated_at = CURRENT_TIMESTAMP
WHERE id = :student_goal_id
```

**Table 4: `notifications`** (if status = 'submitted')

```sql
INSERT INTO notifications (
  parent_id,
  student_id,
  type,
  title,
  message,
  related_entity_type,
  related_entity_id,
  channels,
  created_by
)
SELECT
  ps.parent_id,
  :student_id,
  'new_report',
  'Báo cáo học tập mới',
  CONCAT('Báo cáo buổi học ngày ', :session_date, ' đã được tạo cho ', s.full_name),
  'report',
  :report_id,
  '{"email": true, "push": true}',
  :teacher_id
FROM parent_students ps
JOIN students s ON ps.student_id = s.id
WHERE ps.student_id = :student_id
  AND ps.can_receive_notifications = true
```

**Table 5: `activity_logs`**

```sql
INSERT INTO activity_logs (
  user_id,
  action,
  entity_type,
  entity_id,
  new_values
) VALUES (
  :teacher_id,
  'create',
  'report',
  :report_id,
  :report_data_json
)
```

---

## 3. Luồng Phụ Huynh Xem Báo Cáo

### 👨‍👩‍👧 Mục đích

Phụ huynh đăng nhập portal, xem báo cáo và tiến độ con.

### 📊 Flowchart Mermaid

```mermaid
flowchart TD
    Start([Phụ huynh mở app]) --> CheckAuth{Đã đăng nhập?}
    CheckAuth -->|Chưa| LoginScreen[Login Screen]
    CheckAuth -->|Rồi| CheckNotif{Có notification?}

    LoginScreen --> InputCredentials[Nhập email/password]
    InputCredentials --> ValidateLogin{Validate}
    ValidateLogin -->|Sai| ShowLoginError[Hiển thị lỗi]
    ShowLoginError --> LoginScreen
    ValidateLogin -->|Đúng| LoadParentData[(Load parent data)]
    LoadParentData --> ParentDashboard

    CheckNotif -->|Có| ShowNotifBadge[Badge trên icon]
    CheckNotif -->|Không| ParentDashboard
    ShowNotifBadge --> ParentDashboard[Parent Dashboard Screen]

    ParentDashboard --> ViewOptions{Chọn action}
    ViewOptions -->|View Children| ChildrenList[Children List Screen]
    ViewOptions -->|View Notifications| NotificationsList[Notifications Screen]
    ViewOptions -->|View Reports| AllReportsList[All Reports Screen]

    %% Children Path
    ChildrenList --> SelectChild[Chọn con]
    SelectChild --> ChildDetail[Child Detail Screen]
    ChildDetail --> ChildTabs{Chọn tab}

    ChildTabs -->|Overview| ShowOverview[Overview Tab]
    ChildTabs -->|Goals| ShowGoals[Goals Tab]
    ChildTabs -->|Reports| ShowReports[Reports Tab]

    ShowGoals --> GoalsList[Hiển thị danh sách goals]
    GoalsList --> SelectGoal[Click goal]
    SelectGoal --> GoalProgress[Goal Progress Detail]
    GoalProgress --> BackToChild[Back]
    BackToChild --> ChildDetail

    ShowReports --> ReportsList2[Reports List]
    ReportsList2 --> SelectReport[Chọn report]

    %% Notifications Path
    NotificationsList --> ShowUnread[Hiển thị chưa đọc]
    ShowUnread --> ClickNotif[Click notification]
    ClickNotif --> MarkAsRead[(Mark as read)]
    MarkAsRead --> CheckNotifType{Loại notification}

    CheckNotifType -->|new_report| NavigateToReport[Navigate to report]
    CheckNotifType -->|goal_completed| NavigateToGoal[Navigate to goal]
    CheckNotifType -->|announcement| ShowAnnouncement[Show announcement]

    NavigateToReport --> ReportDetail
    NavigateToGoal --> GoalProgress

    %% Report Detail Path
    SelectReport --> RecordView[(Record view in report_views)]
    AllReportsList --> SelectReportAll[Chọn report]
    SelectReportAll --> RecordView

    RecordView --> ReportDetail[Report Detail Screen]
    ReportDetail --> DisplayReport[Hiển thị thông tin report]

    DisplayReport --> ShowBasicInfo[Basic info: date, rating, teacher]
    DisplayReport --> ShowGoalsProgress[Goals progress table]
    DisplayReport --> ShowNotes[Notes & recommendations]

    ShowGoalsProgress --> ExpandGoal{Click goal}
    ExpandGoal --> ShowGoalDetail[Show goal observations]

    ReportDetail --> ReportActions{Actions}
    ReportActions -->|Export PDF| GeneratePDF[Generate PDF]
    ReportActions -->|Share| ShareReport[Share options]
    ReportActions -->|Back| BackNavigation

    GeneratePDF --> DownloadPDF[Download/View PDF]
    ShareReport --> ShareOptions[Email/WhatsApp/etc]

    ShowGoalDetail --> BackToReport[Back to report]
    BackToReport --> ReportDetail

    BackNavigation --> End([Kết thúc])
```

### 🔄 Các Bước Chi Tiết

#### Bước 1: Authentication

- **Screen:** Login Screen
- **Input Fields:**
  - `email`: Email phụ huynh
  - `password`: Mật khẩu
- **Database Query:**
  ```sql
  SELECT id, email, full_name, relationship, is_active,
         (SELECT COUNT(*) FROM parent_students WHERE parent_id = p.id) as children_count,
         (SELECT COUNT(*) FROM notifications WHERE parent_id = p.id AND is_read = false) as unread_notifications
  FROM parents p
  WHERE email = :email
    AND is_active = true
  ```
- **On Success:**
  - Generate JWT token
  - Update `last_login_at`
  - Navigate to Dashboard

#### Bước 2: Parent Dashboard

- **Screen:** Parent Dashboard Screen
- **Database Queries:**

  **Summary Stats:**

  ```sql
  SELECT
    COUNT(DISTINCT ps.student_id) as total_children,
    COUNT(DISTINCT r.id) as total_reports,
    COUNT(DISTINCT CASE WHEN rv.id IS NULL THEN r.id END) as unread_reports,
    COUNT(DISTINCT CASE WHEN n.is_read = false THEN n.id END) as unread_notifications
  FROM parent_students ps
  LEFT JOIN reports r ON ps.student_id = r.student_id
    AND r.visible_to_parents = true
    AND r.status = 'submitted'
  LEFT JOIN report_views rv ON r.id = rv.report_id AND rv.parent_id = :parent_id
  LEFT JOIN notifications n ON n.parent_id = :parent_id
  WHERE ps.parent_id = :parent_id
  ```

  **Recent Reports:**

  ```sql
  SELECT r.*, s.full_name as student_name, s.avatar_url,
         u.full_name as teacher_name,
         rv.viewed_at IS NOT NULL as is_viewed
  FROM reports r
  JOIN students s ON r.student_id = s.id
  JOIN users u ON r.teacher_id = u.id
  JOIN parent_students ps ON s.id = ps.student_id
  LEFT JOIN report_views rv ON r.id = rv.report_id AND rv.parent_id = :parent_id
  WHERE ps.parent_id = :parent_id
    AND r.visible_to_parents = true
    AND r.status = 'submitted'
  ORDER BY r.session_date DESC
  LIMIT 5
  ```

#### Bước 3: Children List

- **Screen:** Children List Screen
- **Database Query:**
  ```sql
  SELECT s.*, ps.relationship,
         (SELECT COUNT(*) FROM student_goals WHERE student_id = s.id AND status = 'in_progress') as active_goals,
         (SELECT COUNT(*) FROM student_goals WHERE student_id = s.id AND status = 'completed') as completed_goals,
         (SELECT COUNT(*) FROM reports WHERE student_id = s.id AND visible_to_parents = true) as total_reports,
         (SELECT AVG(rating) FROM reports WHERE student_id = s.id) as avg_rating,
         u.full_name as teacher_name
  FROM students s
  JOIN parent_students ps ON s.id = ps.student_id
  LEFT JOIN users u ON s.primary_teacher_id = u.id
  WHERE ps.parent_id = :parent_id
  ORDER BY ps.is_primary DESC, s.full_name
  ```

#### Bước 4: Report Detail

- **Screen:** Report Detail Screen
- **Database Queries:**

  **Main Report:**

  ```sql
  SELECT r.*,
         s.full_name as student_name, s.avatar_url as student_avatar,
         u.full_name as teacher_name, u.avatar_url as teacher_avatar,
         rv.viewed_at IS NOT NULL as is_viewed
  FROM reports r
  JOIN students s ON r.student_id = s.id
  JOIN users u ON r.teacher_id = u.id
  LEFT JOIN report_views rv ON r.id = rv.report_id AND rv.parent_id = :parent_id
  WHERE r.id = :report_id
    AND EXISTS (
      SELECT 1 FROM parent_students ps
      WHERE ps.parent_id = :parent_id
        AND ps.student_id = r.student_id
    )
  ```

  **Report Goals:**

  ```sql
  SELECT rg.*,
         gt.description as goal_description,
         d.name as domain_name,
         d.icon, d.color,
         sg.target_progress,
         sg.current_progress as updated_progress
  FROM report_goals rg
  JOIN student_goals sg ON rg.student_goal_id = sg.id
  JOIN goal_templates gt ON sg.goal_template_id = gt.id
  JOIN domains d ON gt.domain_id = d.id
  WHERE rg.report_id = :report_id
  ORDER BY d.order_index, gt.order_index
  ```

#### Bước 5: Record View

- **Table:** `report_views`
- **Insert (if not exists):**
  ```sql
  INSERT INTO report_views (
    report_id,
    parent_id,
    viewed_at,
    device_type
  )
  SELECT :report_id, :parent_id, CURRENT_TIMESTAMP, :device_type
  WHERE NOT EXISTS (
    SELECT 1 FROM report_views
    WHERE report_id = :report_id
      AND parent_id = :parent_id
  )
  ```

#### Bước 6: Mark Notification as Read

- **Table:** `notifications`
- **Update:**
  ```sql
  UPDATE notifications
  SET is_read = true,
      read_at = CURRENT_TIMESTAMP
  WHERE id = :notification_id
    AND parent_id = :parent_id
  ```

---

## 4. Chi Tiết Các Screens

### 📱 Teacher Screens

#### 4.1 Dashboard Screen

**Mục đích:** Tổng quan hệ thống, truy cập nhanh

**Database Queries:**

- Tổng số học sinh của giáo viên
- Số báo cáo trong tuần
- Số goals cần cập nhật
- Thống kê tổng quan

**Dữ liệu hiển thị:**

- Welcome message với tên giáo viên
- Quick stats cards
- Recent reports list
- Students need attention
- Quick action buttons

---

#### 4.2 Students List Screen

**Mục đích:** Quản lý danh sách học sinh

**Database Query:**

```sql
SELECT s.*, u.full_name as teacher_name,
       COUNT(DISTINCT sg.id) as total_goals,
       COUNT(DISTINCT CASE WHEN sg.status = 'in_progress' THEN sg.id END) as active_goals,
       COUNT(DISTINCT r.id) as total_reports,
       AVG(r.rating) as avg_rating
FROM students s
LEFT JOIN users u ON s.primary_teacher_id = u.id
LEFT JOIN student_goals sg ON s.id = sg.student_id
LEFT JOIN reports r ON s.id = r.student_id
WHERE s.status = 'active'
  AND (s.primary_teacher_id = :teacher_id OR EXISTS (
    SELECT 1 FROM student_teachers st
    WHERE st.student_id = s.id AND st.teacher_id = :teacher_id
  ))
GROUP BY s.id
ORDER BY s.full_name
```

**Filters:**

- Status: Active / Inactive / All
- Search: Tên, mã học sinh
- Sort: Name / Recent / Rating

**Dữ liệu hiển thị:**

- Avatar, tên, mã học sinh
- Tuổi, ngày nhập học
- Giáo viên chính
- Stats: Goals count, Average rating
- Quick actions: View, Edit, Create Report

---

#### 4.3 Student Detail Screen

**Mục đích:** Xem chi tiết và quản lý học sinh

**Tabs:**

1. **Overview Tab**

   - Basic info
   - Medical notes
   - Parent contact
   - Recent reports summary

2. **Goals Tab**

   - Active goals list
   - Completed goals
   - Progress charts
   - Add new goal button

3. **Reports Tab**
   - Reports history

- Filter by date range
  - Timeline view
  - Create new report button

**Database Queries:**

**Overview Tab:**

```sql
-- Student info
SELECT s.*, u.full_name as teacher_name, u.phone as teacher_phone
FROM students s
LEFT JOIN users u ON s.primary_teacher_id = u.id
WHERE s.id = :student_id

-- Recent activity
SELECT 'report' as type, r.session_date as date, r.rating, r.id
FROM reports r
WHERE r.student_id = :student_id
ORDER BY r.session_date DESC
LIMIT 5
```

**Goals Tab:**

```sql
SELECT sg.*, gt.description, d.name as domain_name, d.color, d.icon,
       sg.current_progress, sg.target_progress,
       DATEDIFF(CURRENT_DATE, sg.start_date) as days_active,
       (SELECT COUNT(*) FROM report_goals WHERE student_goal_id = sg.id) as times_practiced
FROM student_goals sg
JOIN goal_templates gt ON sg.goal_template_id = gt.id
JOIN domains d ON gt.domain_id = d.id
WHERE sg.student_id = :student_id
  AND sg.status IN ('not_started', 'in_progress', 'on_hold')
ORDER BY d.order_index, sg.start_date DESC
```

**Reports Tab:**

```sql
SELECT r.*, u.full_name as teacher_name,
       COUNT(rg.id) as goals_count
FROM reports r
JOIN users u ON r.teacher_id = u.id
LEFT JOIN report_goals rg ON r.id = rg.report_id
WHERE r.student_id = :student_id
GROUP BY r.id
ORDER BY r.session_date DESC
```

---

#### 4.4 Select Domain Screen

**Mục đích:** Chọn lĩnh vực khi tạo goal mới

**Database Query:**

```sql
SELECT d.*,
       COUNT(gt.id) as templates_count,
       COUNT(CASE WHEN gt.difficulty_level = 'easy' THEN 1 END) as easy_count,
       COUNT(CASE WHEN gt.difficulty_level = 'medium' THEN 1 END) as medium_count,
       COUNT(CASE WHEN gt.difficulty_level = 'hard' THEN 1 END) as hard_count
FROM domains d
LEFT JOIN goal_templates gt ON d.id = gt.domain_id AND gt.is_active = true
WHERE d.is_active = true
GROUP BY d.id
ORDER BY d.order_index
```

**Dữ liệu hiển thị:**

- Domain name & icon (colored)
- Description
- Số lượng templates available
- Breakdown by difficulty

**UI Layout:**

- Grid cards (2 columns on mobile)
- Large touch targets
- Visual icons for each domain

---

#### 4.5 Goal Templates List Screen

**Mục đích:** Chọn goal template từ domain đã chọn

**Database Query:**

```sql
SELECT gt.*, d.name as domain_name,
       GROUP_CONCAT(DISTINCT t.name ORDER BY t.name) as tags,
       GROUP_CONCAT(DISTINCT t.color ORDER BY t.name) as tag_colors,
       -- Check if already assigned to this student
       EXISTS(
         SELECT 1 FROM student_goals sg
         WHERE sg.goal_template_id = gt.id
           AND sg.student_id = :student_id
           AND sg.status != 'discontinued'
       ) as is_assigned
FROM goal_templates gt
JOIN domains d ON gt.domain_id = d.id
LEFT JOIN goal_template_tags gtt ON gt.id = gtt.goal_template_id
LEFT JOIN tags t ON gtt.tag_id = t.id
WHERE gt.domain_id = :domain_id
  AND gt.is_active = true
GROUP BY gt.id
ORDER BY gt.order_index
```

**Filters:**

- Difficulty level: All / Easy / Medium / Hard
- Search: Description text
- Show assigned: Hide already assigned goals

**Dữ liệu hiển thị:**

- Goal description (full text)
- Difficulty badge
- Tags (support type, etc.)
- "Already assigned" indicator
- Age range (if set)

**Actions:**

- Click card → Preview screen
- Search bar at top
- Filter chips below search

---

#### 4.6 Goal Preview Screen

**Mục đích:** Xem chi tiết goal template trước khi gán

**Database Query:**

```sql
SELECT gt.*, d.name as domain_name, d.description as domain_description,
       GROUP_CONCAT(DISTINCT t.name ORDER BY t.category, t.name) as tags,
       GROUP_CONCAT(DISTINCT t.category) as tag_categories,
       -- Similar goals already assigned
       (SELECT COUNT(*) FROM student_goals sg
        JOIN goal_templates gt2 ON sg.goal_template_id = gt2.id
        WHERE sg.student_id = :student_id
          AND gt2.domain_id = gt.domain_id
          AND sg.status IN ('in_progress', 'not_started')
       ) as similar_active_count
FROM goal_templates gt
JOIN domains d ON gt.domain_id = d.id
LEFT JOIN goal_template_tags gtt ON gt.id = gtt.goal_template_id
LEFT JOIN tags t ON gtt.tag_id = t.id
WHERE gt.id = :goal_template_id
GROUP BY gt.id
```

**Dữ liệu hiển thị:**

- Full description
- Domain info
- All tags (grouped by category)
- Difficulty & age range
- Suggested support levels
- Similar goals warning (if any)

**Actions:**

- Cancel → Back to list
- Customize → Edit Goal Details Screen
- Assign → Quick assign with defaults

---

#### 4.7 Edit Goal Details Screen

**Mục đích:** Cấu hình goal trước khi gán cho học sinh

**Input Fields:**

```json
{
  "target_progress": {
    "type": "slider",
    "min": 50,
    "max": 100,
    "default": 100,
    "step": 5,
    "label": "Target Progress (%)",
    "help": "Mục tiêu % cần đạt"
  },
  "start_date": {
    "type": "date",
    "default": "today",
    "max": "today",
    "label": "Start Date"
  },
  "target_end_date": {
    "type": "date",
    "optional": true,
    "min": "start_date",
    "label": "Target End Date",
    "help": "Dự kiến hoàn thành (optional)"
  },
  "notes": {
    "type": "textarea",
    "optional": true,
    "maxLength": 500,
    "label": "Notes",
    "placeholder": "Ghi chú đặc biệt cho mục tiêu này..."
  }
}
```

**Validation Rules:**

- target_progress: 50-100%
- start_date: Không được là tương lai
- target_end_date: Phải sau start_date
- notes: Tối đa 500 ký tự

**Preview Section:**

- Hiển thị lại goal description
- Show calculated timeline
- Estimated weekly/monthly target

**Actions:**

- Cancel → Back to preview
- Save → Insert to database + Navigate back to Student Goals Tab

---

#### 4.8 Create Report Form Screen (Step 1)

**Mục đích:** Nhập thông tin cơ bản của buổi học

**Input Fields:**

```json
{
  "session_date": {
    "type": "date",
    "required": true,
    "max": "today",
    "default": "today",
    "label": "Session Date"
  },
  "session_duration": {
    "type": "number",
    "required": true,
    "min": 15,
    "max": 300,
    "default": 60,
    "step": 15,
    "unit": "minutes",
    "label": "Duration"
  },
  "rating": {
    "type": "rating",
    "required": true,
    "min": 1,
    "max": 5,
    "label": "Overall Rating",
    "help": "Đánh giá chung về buổi học"
  },
  "participation_level": {
    "type": "select",
    "required": true,
    "options": [
      { "value": "high", "label": "Cao - Tích cực tham gia" },
      { "value": "medium", "label": "Trung bình - Đôi khi chú ý" },
      { "value": "low", "label": "Thấp - Khó tập trung" }
    ],
    "label": "Participation Level"
  }
}
```

**Student Info Display:**

```sql
SELECT s.id, s.student_code, s.full_name, s.avatar_url,
       s.date_of_birth,
       TIMESTAMPDIFF(YEAR, s.date_of_birth, CURRENT_DATE) as age
FROM students s
WHERE s.id = :student_id
```

**UI Elements:**

- Student card at top (avatar, name, age)
- Form fields with clear labels
- Helper text for each field
- Visual rating component (stars)
- Next button (validates before proceeding)

---

#### 4.9 Select Goals Screen (Step 2)

**Mục đích:** Chọn goals để đánh giá trong báo cáo

**Database Query:**

```sql
SELECT sg.*, gt.description, d.name as domain_name, d.color, d.icon,
       sg.current_progress, sg.target_progress,
       -- Last report info
       (SELECT r.session_date
        FROM reports r
        JOIN report_goals rg ON r.id = rg.report_id
        WHERE rg.student_goal_id = sg.id
        ORDER BY r.session_date DESC
        LIMIT 1) as last_reported_date,
       (SELECT rg.progress_recorded
        FROM reports r
        JOIN report_goals rg ON r.id = rg.report_id
        WHERE rg.student_goal_id = sg.id
        ORDER BY r.session_date DESC
        LIMIT 1) as last_progress
FROM student_goals sg
JOIN goal_templates gt ON sg.goal_template_id = gt.id
JOIN domains d ON gt.domain_id = d.id
WHERE sg.student_id = :student_id
  AND sg.status IN ('not_started', 'in_progress')
ORDER BY d.order_index, sg.start_date DESC
```

**UI Layout:**

- Grouped by domain (collapsible sections)
- Checkbox for each goal
- Goal card shows:
  - Description (truncated)
  - Current progress bar
  - Last session: date + progress
  - Days since last practice
- "Select All" option per domain
- Minimum 1 goal required

**Validation:**

- Must select at least 1 goal
- Warning if selecting too many (>10)

**Actions:**

- Back → Step 1
- Next → Step 3 (if valid)
- Skip goal selection → Empty state message

---

#### 4.10 Record Progress Screen (Step 3)

**Mục đích:** Ghi nhận progress cho từng goal đã chọn

**For each selected goal - Database Query:**

```sql
SELECT sg.*, gt.description, d.name as domain_name, d.color,
       sg.current_progress as before_progress,
       sg.target_progress,
       -- Progress history (last 5 sessions)
       (SELECT JSON_ARRAYAGG(
         JSON_OBJECT(
           'date', r.session_date,
           'progress', rg.progress_recorded,
           'support', rg.support_level
         )
       )
       FROM reports r
       JOIN report_goals rg ON r.id = rg.report_id
       WHERE rg.student_goal_id = sg.id
       ORDER BY r.session_date DESC
       LIMIT 5) as history
FROM student_goals sg
JOIN goal_templates gt ON sg.goal_template_id = gt.id
JOIN domains d ON gt.domain_id = d.id
WHERE sg.id = :student_goal_id
```

**Input Fields per Goal:**

```json
{
  "progress_recorded": {
    "type": "slider",
    "required": true,
    "min": 0,
    "max": 100,
    "step": 5,
    "default": "current_progress",
    "label": "Progress (%)",
    "showValue": true
  },
  "support_level": {
    "type": "select",
    "required": true,
    "options": [
      { "value": "independent", "label": "🎯 Independent", "color": "green" },
      { "value": "verbal", "label": "🗣️ Verbal Prompt", "color": "blue" },
      { "value": "modeling", "label": "👀 Modeling", "color": "purple" },
      {
        "value": "physical",
        "label": "🤝 Partial Physical",
        "color": "orange"
      },
      { "value": "full_physical", "label": "✋ Full Physical", "color": "red" }
    ],
    "label": "Support Level"
  },
  "observations": {
    "type": "textarea",
    "optional": true,
    "maxLength": 500,
    "label": "Observations",
    "placeholder": "Quan sát cụ thể trong buổi học..."
  },
  "notes": {
    "type": "textarea",
    "optional": true,
    "maxLength": 300,
    "label": "Additional Notes",
    "placeholder": "Ghi chú bổ sung..."
  }
}
```

**UI Features:**

- Swipeable cards (one goal per card)
- Progress indicator: X / Total goals
- Visual progress comparison:
  - Before: Current progress bar
  - After: New progress bar
  - Delta: +/- change indicator
- Mini chart: Last 5 sessions trend
- Auto-save draft on field blur
- Skip button (leaves goal unrecorded)

**Validation per Goal:**

- progress_recorded: 0-100
- Warning if progress decreased
- Alert if progress jumped >30%

**Navigation:**

- Previous Goal button
- Next Goal button
- Skip this Goal
- Back to Step 2
- Save & Review (when all done)

---

#### 4.11 Review Screen (Step 4)

**Mục đích:** Xem lại toàn bộ báo cáo trước khi submit

**Display Sections:**

1. **Session Summary:**

   - Date, Duration, Rating, Participation
   - Edit button → Back to Step 1

2. **Goals Progress Summary:**

   - Table/List view of all goals
   - Columns: Domain, Description, Before, After, Change, Support
   - Edit button per goal → Back to Step 3

3. **General Notes & Recommendations:**
   ```json
   {
     "notes": {
       "type": "textarea",
       "optional": true,
       "maxLength": 1000,
       "label": "General Notes",
       "placeholder": "Nhận xét chung về buổi học..."
     },
     "recommendations": {
       "type": "textarea",
       "optional": true,
       "maxLength": 500,
       "label": "Recommendations",
       "placeholder": "Khuyến nghị cho phụ huynh thực hành tại nhà..."
     },
     "visible_to_parents": {
       "type": "checkbox",
       "default": true,
       "label": "Visible to Parents",
       "help": "Phụ huynh có thể xem báo cáo này"
     }
   }
   ```

**Statistics Display:**

- Total goals recorded: X
- Average progress change: +Y%
- Goals completed in this session: Z
- Time spent: Duration

**Actions:**

- Edit Any Section button
- Save as Draft (status = 'draft')
  - No notifications sent
  - Can edit later
- Submit Report (status = 'submitted')
  - Send notifications to parents
  - Lock for editing (can only add review notes)

---

#### 4.12 Report Detail Screen (Teacher View)

**Mục đích:** Xem chi tiết báo cáo đã tạo

**Database Queries:**

**Main Report:**

```sql
SELECT r.*,
       s.full_name as student_name, s.student_code, s.avatar_url,
       u.full_name as teacher_name,
       reviewer.full_name as reviewer_name,
       COUNT(rg.id) as goals_count,
       AVG(rg.progress_recorded - rg.previous_progress) as avg_progress_change
FROM reports r
JOIN students s ON r.student_id = s.id
JOIN users u ON r.teacher_id = u.id
LEFT JOIN users reviewer ON r.reviewed_by = reviewer.id
LEFT JOIN report_goals rg ON r.id = rg.report_id
WHERE r.id = :report_id
GROUP BY r.id
```

**Report Goals:**

```sql
SELECT rg.*,
       gt.description, d.name as domain_name, d.color, d.icon,
       sg.current_progress as updated_progress,
       sg.target_progress,
       sg.status as goal_status
FROM report_goals rg
JOIN student_goals sg ON rg.student_goal_id = sg.id
JOIN goal_templates gt ON sg.goal_template_id = gt.id
JOIN domains d ON gt.domain_id = d.id
WHERE rg.report_id = :report_id
ORDER BY d.order_index
```

**Parent Views (if submitted):**

```sql
SELECT rv.*, p.full_name as parent_name, p.relationship
FROM report_views rv
JOIN parents p ON rv.parent_id = p.id
WHERE rv.report_id = :report_id
ORDER BY rv.viewed_at DESC
```

**Display Sections:**

1. Header: Student info, Date, Status badge
2. Session Info: Duration, Rating, Participation
3. Goals Table: Domain, Goal, Before, After, Change, Support
4. Observations per goal (expandable)
5. General Notes
6. Recommendations
7. Parent View Stats (if submitted)

**Actions:**

- Edit (if status = 'draft')
- Delete (if status = 'draft')
- Export PDF
- Share with parents (if not visible)
- Add Review Notes (admin only)

---

### 📱 Parent Screens

#### 4.13 Parent Login Screen

**Mục đích:** Authentication cho phụ huynh

**Input Fields:**

```json
{
  "email": {
    "type": "email",
    "required": true,
    "label": "Email",
    "autocomplete": "email"
  },
  "password": {
    "type": "password",
    "required": true,
    "label": "Password",
    "autocomplete": "current-password"
  },
  "remember_me": {
    "type": "checkbox",
    "default": false,
    "label": "Remember me"
  }
}
```

**Database Query:**

```sql
SELECT p.*,
       COUNT(DISTINCT ps.student_id) as children_count,
       COUNT(DISTINCT CASE WHEN n.is_read = false THEN n.id END) as unread_notifications
FROM parents p
LEFT JOIN parent_students ps ON p.id = ps.parent_id
LEFT JOIN notifications n ON p.id = n.parent_id
WHERE p.email = :email
  AND p.is_active = true
GROUP BY p.id
```

**On Success:**

- Update `last_login_at`
- Reset `failed_login_attempts`
- Generate JWT token (type: 'parent')
- Navigate to Dashboard

**On Failure:**

- Increment `failed_login_attempts`
- Lock account if attempts >= 5
- Show error message

**Additional Links:**

- Forgot Password
- Contact Support
- Terms & Privacy

---

#### 4.14 Parent Dashboard Screen

**Mục đích:** Trang chủ cho phụ huynh

**Database Queries:**

**Summary Stats:**

```sql
SELECT
  COUNT(DISTINCT ps.student_id) as total_children,
  COUNT(DISTINCT r.id) as total_reports,
  COUNT(DISTINCT CASE WHEN rv.id IS NULL AND r.status = 'submitted' THEN r.id END) as unread_reports,
  COUNT(DISTINCT CASE WHEN n.is_read = false THEN n.id END) as unread_notifications,
  MAX(r.session_date) as last_report_date
FROM parent_students ps
LEFT JOIN reports r ON ps.student_id = r.student_id
  AND r.visible_to_parents = true
LEFT JOIN report_views rv ON r.id = rv.report_id AND rv.parent_id = :parent_id
LEFT JOIN notifications n ON n.parent_id = :parent_id
WHERE ps.parent_id = :parent_id
```

**Recent Reports:**

```sql
SELECT r.id, r.session_date, r.rating,
       s.full_name as student_name, s.avatar_url,
       u.full_name as teacher_name,
       rv.viewed_at IS NOT NULL as is_viewed,
       COUNT(rg.id) as goals_count
FROM reports r
JOIN students s ON r.student_id = s.id
JOIN users u ON r.teacher_id = u.id
JOIN parent_students ps ON s.id = ps.student_id
LEFT JOIN report_views rv ON r.id = rv.report_id AND rv.parent_id = :parent_id
LEFT JOIN report_goals rg ON r.id = rg.report_id
WHERE ps.parent_id = :parent_id
  AND r.visible_to_parents = true
  AND r.status = 'submitted'
GROUP BY r.id
ORDER BY r.session_date DESC
LIMIT 5
```

**Recent Achievements:**

```sql
SELECT sg.actual_end_date as completed_date,
       gt.description as goal_description,
       d.name as domain_name, d.icon, d.color,
       s.full_name as student_name
FROM student_goals sg
JOIN goal_templates gt ON sg.goal_template_id = gt.id
JOIN domains d ON gt.domain_id = d.id
JOIN students s ON sg.student_id = s.id
JOIN parent_students ps ON s.id = ps.student_id
WHERE ps.parent_id = :parent_id
  AND sg.status = 'completed'
  AND sg.actual_end_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
ORDER BY sg.actual_end_date DESC
LIMIT 5
```

**Display Sections:**

1. Welcome Header: "Xin chào, [Parent Name]"
2. Quick Stats Cards:
   - Total Children
   - Unread Reports (badge)
   - Unread Notifications (badge)
   - Last Report Date
3. Recent Reports List (with unread indicators)
4. Recent Achievements (celebrations)
5. Quick Actions: View All Children, All Reports, Notifications

**UI Features:**

- Pull to refresh
- Notification badge on icon
- Unread report highlights
- Achievement celebrations (confetti animation)

---

#### 4.15 Children List Screen (Parent)

**Mục đích:** Xem danh sách con của phụ huynh

**Database Query:**

```sql
SELECT s.*, ps.relationship, ps.is_primary,
       TIMESTAMPDIFF(YEAR, s.date_of_birth, CURRENT_DATE) as age,
       u.full_name as teacher_name, u.phone as teacher_phone,
       -- Stats
       COUNT(DISTINCT sg.id) as total_goals,
       COUNT(DISTINCT CASE WHEN sg.status = 'in_progress' THEN sg.id END) as active_goals,
       COUNT(DISTINCT CASE WHEN sg.status = 'completed' THEN sg.id END) as completed_goals,
       COUNT(DISTINCT r.id) as total_reports,
       COUNT(DISTINCT CASE WHEN rv.id IS NULL AND r.status = 'submitted' THEN r.id END) as unread_reports,
       AVG(r.rating) as avg_rating,
       MAX(r.session_date) as last_report_date
FROM students s
JOIN parent_students ps ON s.id = ps.student_id
LEFT JOIN users u ON s.primary_teacher_id = u.id
LEFT JOIN student_goals sg ON s.id = sg.student_id
LEFT JOIN reports r ON s.id = r.student_id AND r.visible_to_parents = true
LEFT JOIN report_views rv ON r.id = rv.report_id AND rv.parent_id = :parent_id
WHERE ps.parent_id = :parent_id
GROUP BY s.id
ORDER BY ps.is_primary DESC, s.full_name
```

**Display per Child:**

- Avatar, Full Name, Age
- Student Code
- Primary Teacher (name, phone)
- Stats:
  - Active Goals: X/Y
  - Average Rating: ★★★★☆
  - Unread Reports: Badge
  - Last Report: Date
- Progress indicator (overall)

**Actions:**

- Click card → Child Detail Screen
- Call teacher button
- Message teacher (if available)

---

#### 4.16 Child Detail Screen (Parent)

**Mục đích:** Xem chi tiết con

**Tabs:**

1. Overview
2. Goals
3. Reports
4. Progress

**Overview Tab - Database Query:**

```sql
-- Child info
SELECT s.*,
       TIMESTAMPDIFF(YEAR, s.date_of_birth, CURRENT_DATE) as age,
       u.full_name as teacher_name, u.phone as teacher_phone, u.email as teacher_email
FROM students s
LEFT JOIN users u ON s.primary_teacher_id = u.id
WHERE s.id = :student_id

-- Summary stats
SELECT
  COUNT(DISTINCT sg.id) FILTER (WHERE sg.status IN ('not_started', 'in_progress')) as active_goals,
  COUNT(DISTINCT sg.id) FILTER (WHERE sg.status = 'completed') as completed_goals,
  COUNT(DISTINCT r.id) as total_reports,
  AVG(r.rating) as avg_rating,
  MAX(r.session_date) as last_report_date
FROM students s
LEFT JOIN student_goals sg ON s.id = sg.student_id
LEFT JOIN reports r ON s.id = r.student_id AND r.visible_to_parents = true
WHERE s.id = :student_id
```

**Display:**

- Child photo, name, age, student code
- Enrollment info
- Teacher contact card
- Medical info (if parent_can_view_medical_notes = true)
- Summary statistics
- Recent activity timeline

**Goals Tab - Database Query:**

```sql
SELECT sg.*, gt.description, d.name as domain_name, d.color, d.icon,
       sg.current_progress, sg.target_progress,
       DATEDIFF(CURRENT_DATE, sg.start_date) as days_active,
       sg.status,
       -- Last practice
       (SELECT r.session_date
        FROM reports r
        JOIN report_goals rg ON r.id = rg.report_id
        WHERE rg.student_goal_id = sg.id
        ORDER BY r.session_date DESC
        LIMIT 1) as last_practiced
FROM student_goals sg
JOIN goal_templates gt ON sg.goal_template_id = gt.id
JOIN domains d ON gt.domain_id = d.id
WHERE sg.student_id = :student_id
ORDER BY
  CASE sg.status
    WHEN 'in_progress' THEN 1
    WHEN 'not_started' THEN 2
    WHEN 'completed' THEN 3
    ELSE 4
  END,
  d.order_index
```

**Display:**

- Grouped by domain (collapsible)
- Progress bars per goal
- Status badges
- Last practiced date
- Click goal → Goal Detail Modal

**Reports Tab:**

- Uses same query as "All Reports Screen" but filtered by student_id

**Progress Tab:**

- Overall progress chart (last 3 months)
- Domain breakdown charts
- Milestones timeline

---

#### 4.17 Report Detail Screen (Parent View)

**Mục đích:** Phụ huynh xem chi tiết báo cáo

**Database Queries:**

**Main Report:**

```sql
SELECT r.*,
       s.full_name as student_name, s.avatar_url,
       u.full_name as teacher_name, u.avatar_url as teacher_avatar,
       rv.viewed_at IS NOT NULL as is_viewed,
       rv.viewed_at as first_viewed
FROM reports r
JOIN students s ON r.student_id = s.id
JOIN users u ON r.teacher_id = u.id
LEFT JOIN report_views rv ON r.id = rv.report_id AND rv.parent_id = :parent_id
WHERE r.id = :report_id
  AND r.visible_to_parents = true
  AND r.status = 'submitted'
  AND EXISTS (
    SELECT 1 FROM parent_students ps
    WHERE ps.parent_id = :parent_id
      AND ps.student_id = r.student_id
  )
```

**Report Goals with Progress:**

```sql
SELECT rg.*,
       gt.description, d.name as domain_name, d.color, d.icon,
       rg.progress_recorded, rg.previous_progress,
       (rg.progress_recorded - rg.previous_progress) as progress_change,
       sg.target_progress, sg.current_progress as updated_progress,
       sg.status as goal_status
FROM report_goals rg
JOIN student_goals sg ON rg.student_goal_id = sg.id
JOIN goal_templates gt ON sg.goal_template_id = gt.id
JOIN domains d ON gt.domain_id = d.id
WHERE rg.report_id = :report_id
ORDER BY d.order_index
```

**On Load:**

- Insert/Update `report_views` table:

```sql
INSERT INTO report_views (report_id, parent_id, viewed_at, device_type)
VALUES (:report_id, :parent_id, CURRENT_TIMESTAMP, :device_type)
ON DUPLICATE KEY UPDATE
  viewed_at = CURRENT_TIMESTAMP,
  view_duration_seconds = view_duration_seconds + :duration
```

**Display Sections:**

1. **Header:**

   - Student name & avatar
   - Session date (with day of week)
   - Teacher name & avatar
   - Overall rating (stars)
   - "New" badge if unread

2. **Session Info Card:**

   - Duration: X minutes
   - Participation: High/Medium/Low (with icon)

3. **Goals Progress:**

   - Table/Cards grouped by domain
   - Each goal shows:
     - Description
     - Progress bar: Before → After
     - Change indicator: +X% (green) or -X% (red)
     - Support level badge
   - Click goal → Expand observations

4. **Observations per Goal (Expandable):**

   - Detailed observations
   - Additional notes
   - Support level explanation

5. **Teacher's Notes:**

   - General notes about the session
   - Recommendations for home practice

6. **Summary Stats:**
   - Total goals worked on: X
   - Average progress: +Y%
   - Goals completed: Z

**Actions:**

- Export as PDF
- Share (WhatsApp, Email)
- Print
- Mark as Favorite (future feature)

**UI Features:**

- Beautiful, clean layout
- Color-coded by domain
- Smooth animations
- Print-friendly

---

#### 4.18 Notifications Screen (Parent)

**Mục đích:** Quản lý thông báo

**Database Query:**

```sql
SELECT n.*,
       s.full_name as student_name, s.avatar_url,
       CASE
         WHEN n.related_entity_type = 'report' THEN (
           SELECT CONCAT('Báo cáo ngày ', r.session_date)
           FROM reports r WHERE r.id = n.related_entity_id
         )
         WHEN n.related_entity_type = 'goal' THEN (
           SELECT gt.description
           FROM student_goals
```

```sql
           FROM student_goals sg
           JOIN goal_templates gt ON sg.goal_template_id = gt.id
           WHERE sg.id = n.related_entity_id
         )
       END as related_entity_title
FROM notifications n
LEFT JOIN students s ON n.student_id = s.id
WHERE n.parent_id = :parent_id
ORDER BY
  CASE WHEN n.is_read = false THEN 0 ELSE 1 END,
  n.created_at DESC
LIMIT 50
```

**Display:**

- Tabs: All / Unread
- List items show:
  - Icon based on type
  - Title & message
  - Student name (if applicable)
  - Timestamp (relative: "2 hours ago")
  - Unread indicator (dot or bold text)
  - Priority badge (if urgent)

**Notification Types:**

```json
{
  "new_report": {
    "icon": "📄",
    "color": "blue",
    "title": "Báo cáo học tập mới",
    "action": "View Report"
  },
  "goal_completed": {
    "icon": "🎯",
    "color": "green",
    "title": "Mục tiêu hoàn thành",
    "action": "View Goal"
  },
  "announcement": {
    "icon": "📢",
    "color": "orange",
    "title": "Thông báo",
    "action": "View Details"
  },
  "schedule_change": {
    "icon": "📅",
    "color": "purple",
    "title": "Thay đổi lịch học",
    "action": "View Schedule"
  }
}
```

**Actions:**

- Click notification:
  - Mark as read
  - Navigate to related entity
- Swipe actions:
  - Mark as read/unread
  - Delete
- Bulk actions:
  - Mark all as read
  - Clear read notifications

**Mark as Read Query:**

```sql
UPDATE notifications
SET is_read = true,
    read_at = CURRENT_TIMESTAMP
WHERE id = :notification_id
  AND parent_id = :parent_id
```

---

#### 4.19 All Reports Screen (Parent)

**Mục đích:** Xem tất cả báo cáo của tất cả con

**Database Query:**

```sql
SELECT r.*,
       s.full_name as student_name, s.avatar_url, s.student_code,
       u.full_name as teacher_name,
       rv.viewed_at IS NOT NULL as is_viewed,
       COUNT(rg.id) as goals_count,
       AVG(rg.progress_recorded - rg.previous_progress) as avg_progress_change
FROM reports r
JOIN students s ON r.student_id = s.id
JOIN users u ON r.teacher_id = u.id
JOIN parent_students ps ON s.id = ps.student_id
LEFT JOIN report_views rv ON r.id = rv.report_id AND rv.parent_id = :parent_id
LEFT JOIN report_goals rg ON r.id = rg.report_id
WHERE ps.parent_id = :parent_id
  AND r.visible_to_parents = true
  AND r.status = 'submitted'
  AND (:student_id IS NULL OR s.id = :student_id)
  AND (:from_date IS NULL OR r.session_date >= :from_date)
  AND (:to_date IS NULL OR r.session_date <= :to_date)
  AND (:min_rating IS NULL OR r.rating >= :min_rating)
GROUP BY r.id
ORDER BY r.session_date DESC
LIMIT :limit OFFSET :offset
```

**Filters:**

- Child selector (All / Specific child)
- Date range picker
- Rating filter (All / 4-5 stars / 3+ stars / etc.)
- Status: Unread / Read / All

**Display:**

- List/Card view
- Each report card shows:
  - Student avatar & name
  - Session date
  - Rating stars
  - Goals count
  - Average progress indicator
  - Unread badge
  - Teacher name
- Pull to refresh
- Infinite scroll

**Actions per Report:**

- Click → Report Detail
- Long press → Quick actions menu:
  - Export PDF
  - Share
  - Mark as read/unread

---

#### 4.20 Goal Detail Modal (Parent)

**Mục đích:** Xem chi tiết một mục tiêu

**Database Query:**

```sql
SELECT sg.*,
       gt.description, gt.difficulty_level,
       d.name as domain_name, d.description as domain_description,
       d.color, d.icon,
       s.full_name as student_name,
       -- Progress history
       JSON_ARRAYAGG(
         JSON_OBJECT(
           'date', r.session_date,
           'progress', rg.progress_recorded,
           'support', rg.support_level,
           'notes', rg.notes
         ) ORDER BY r.session_date DESC
       ) as progress_history
FROM student_goals sg
JOIN goal_templates gt ON sg.goal_template_id = gt.id
JOIN domains d ON gt.domain_id = d.id
JOIN students s ON sg.student_id = s.id
LEFT JOIN report_goals rg ON sg.id = rg.student_goal_id
LEFT JOIN reports r ON rg.report_id = r.id
WHERE sg.id = :goal_id
  AND EXISTS (
    SELECT 1 FROM parent_students ps
    WHERE ps.parent_id = :parent_id
      AND ps.student_id = sg.student_id
  )
GROUP BY sg.id
```

**Display:**

1. **Header:**

   - Domain badge (colored)
   - Goal description
   - Status badge
   - Difficulty level

2. **Progress Section:**

   - Large circular progress chart
   - Current: X% / Target: Y%
   - Days active
   - Start date → Target end date

3. **Timeline:**

   - Progress history (last 10 sessions)
   - Date, progress %, support level
   - Visual timeline graph

4. **Details:**

   - Notes from teacher
   - Recommended home activities (if any)

5. **Celebration (if completed):**
   - Completion date
   - Congratulations message
   - Confetti animation

**Actions:**

- Close modal
- View related reports
- Share achievement (if completed)

---

## 5. Flowchart Text Format

### 5.1 Create Goal Flowchart (Text)

```
START
  ↓
[Teacher Login]
  ↓
[Dashboard] → [Students List]
  ↓
[Select Student]
  ↓
[Student Detail Screen - Goals Tab]
  ↓
[Click "Add Goal"]
  ↓
[Select Domain Screen]
  - Query: Load all active domains
  - Display: Grid of domain cards
  ↓
[User selects Domain]
  ↓
[Goal Templates List Screen]
  - Query: Load templates for selected domain
  - Filter: Difficulty, Tags, Search
  - Display: List of goal templates
  ↓
[User selects Template]
  ↓
[Goal Preview Screen]
  - Query: Load template details with tags
  - Display: Full description, tags, similar goals warning
  ↓
Decision: Customize or Quick Assign?
  ├─ Quick Assign → Go to SAVE
  └─ Customize → [Edit Goal Details Screen]
       ↓
     [Input Fields:]
       - target_progress (slider 50-100%)
       - start_date (date picker)
       - target_end_date (optional date picker)
       - notes (textarea)
       ↓
     [Validate Input]
       ↓
     Decision: Valid?
       ├─ No → Show error → Back to input
       └─ Yes → Continue
         ↓
SAVE:
  [Insert into student_goals table]
    - student_id
    - goal_template_id
    - target_progress
    - current_progress = 0
    - status = 'not_started'
    - start_date
    - target_end_date
    - notes
    - created_by = teacher_id
  ↓
  [Insert into activity_logs]
    - action = 'create'
    - entity_type = 'student_goal'
  ↓
  [Show success message]
  ↓
  [Refresh Student Goals List]
  ↓
END
```

---

### 5.2 Create Report Flowchart (Text)

```
START
  ↓
[Teacher Login]
  ↓
Decision: Entry Point?
  ├─ From Students List → [Select Student] → [Student Detail]
  └─ From Reports List → [Click "New Report"] → [Select Student Screen]
  ↓
[Student Detail] → [Click "Create Report"]
  ↓
STEP 1: BASIC INFORMATION
[Create Report Form Screen]
  ↓
  [Input Fields:]
    - session_date (default: today, max: today)
    - session_duration (default: 60, min: 15)
    - rating (1-5 stars, required)
    - participation_level (high/medium/low)
  ↓
  [Validate Step 1]
    - session_date not in future
    - duration > 0
    - rating 1-5
  ↓
  Decision: Valid?
    ├─ No → Show errors → Back to form
    └─ Yes → Continue to Step 2
      ↓
STEP 2: SELECT GOALS
[Select Goals Screen]
  ↓
  [Query: Load student active goals]
    - Status: not_started, in_progress
    - Include: current_progress, last_progress
    - Group by: domain
  ↓
  [Display: Checkbox list grouped by domain]
  ↓
  [User selects goals (minimum 1)]
  ↓
  [Validate: At least 1 goal selected?]
    ├─ No → Show warning → Stay on screen
    └─ Yes → Continue to Step 3
      ↓
STEP 3: RECORD PROGRESS
[Record Progress Screen]
  ↓
  FOR EACH selected goal:
    ↓
    [Query: Load goal details + history]
    ↓
    [Display: Goal card with progress input]
      ↓
      [Input Fields per goal:]
        - progress_recorded (slider 0-100%)
        - support_level (select dropdown)
        - observations (textarea)
        - notes (textarea)
      ↓
      [Validate progress input]
        - 0 <= progress <= 100
        - Warning if decreased
        - Alert if jump > 30%
      ↓
      Decision: Valid?
        ├─ No → Show error → Re-input
        └─ Yes → Save to temp storage
    ↓
    [Next Goal or Finish]
  ↓
STEP 4: REVIEW & NOTES
[Review Screen]
  ↓
  [Display Summary:]
    - Session info (Step 1)
    - Selected goals with progress (Step 3)
  ↓
  [Input Additional Fields:]
    - notes (general session notes)
    - recommendations (for parents/next session)
    - visible_to_parents (checkbox, default: true)
  ↓
  [Preview entire report]
  ↓
  Decision: User action?
    ├─ Edit → Go back to respective step
    ├─ Save as Draft → Set status = 'draft'
    └─ Submit → Set status = 'submitted'
  ↓
SAVE TO DATABASE:
  ↓
  [Begin Transaction]
    ↓
    [INSERT INTO reports]
      - student_id, teacher_id
      - session_date, session_duration
      - rating, participation_level
      - notes, recommendations
      - status (draft or submitted)
      - visible_to_parents
    ↓
    [Get report_id]
    ↓
    FOR EACH goal in report:
      ↓
      [INSERT INTO report_goals]
        - report_id
        - student_goal_id
        - progress_recorded
        - previous_progress
        - observations, notes
        - support_level
      ↓
      [UPDATE student_goals]
        - current_progress = new progress
        - status = 'completed' if progress >= target
        - actual_end_date = today if completed
      ↓
      Decision: Goal completed?
        └─ Yes → [CREATE notification for parent]
            - type = 'goal_completed'
    ↓
    [INSERT INTO activity_logs]
      - action = 'create'
      - entity_type = 'report'
    ↓
    Decision: Status = 'submitted'?
      └─ Yes → [CREATE notification for parent]
          - type = 'new_report'
          ↓
          [Query parent_students to get parents]
          ↓
          FOR EACH parent:
            [INSERT INTO notifications]
              - parent_id
              - student_id
              - type = 'new_report'
              - title, message
              - related_entity_type = 'report'
              - related_entity_id = report_id
              - channels = {email: true, push: true}
            ↓
            [Send email (optional)]
            [Send push notification (optional)]
  ↓
  [Commit Transaction]
  ↓
  [Show success message]
  ↓
  [Navigate to Report Detail Screen]
  ↓
END
```

---

### 5.3 Parent View Report Flowchart (Text)

```
START
  ↓
[Parent opens app]
  ↓
Decision: Authenticated?
  ├─ No → [Login Screen]
  │     ↓
  │   [Input: email, password]
  │     ↓
  │   [Validate credentials]
  │     ↓
  │   Decision: Valid?
  │     ├─ No → Show error
  │     └─ Yes → [Generate JWT token]
  │           ↓
  │           [Update last_login_at]
  │           ↓
  └─────────→ Continue
              ↓
[Load Parent Dashboard]
  ↓
  [Query: Load summary stats]
    - Total children
    - Total reports
    - Unread reports count
    - Unread notifications count
  ↓
  [Query: Recent reports (limit 5)]
  [Query: Recent achievements (limit 5)]
  ↓
  [Display Dashboard]
    - Welcome message
    - Stats cards
    - Recent reports list
    - Recent achievements
  ↓
Decision: User action?
  ├─ View Children → [Children List Screen]
  ├─ View Notifications → [Notifications Screen]
  └─ View All Reports → [All Reports Screen]
      ↓
      [Query: Load all reports]
        - Filter by: student, date, rating
        - Include: is_viewed status
        - Order by: session_date DESC
      ↓
      [Display: List of report cards]
      ↓
      [User clicks a report]
        ↓
VIEW REPORT DETAIL:
  ↓
  [Report Detail Screen]
    ↓
    [Query: Load report data]
      - Main report info
      - Student, teacher details
      - Check if already viewed
    ↓
    [Query: Load report goals]
      - All goals in this report
      - Progress before/after
      - Support levels
      - Observations
    ↓
    Decision: First time viewing?
      └─ Yes → [INSERT INTO report_views]
          - report_id
          - parent_id
          - viewed_at = now
          - device_type
    ↓
    [Display Report:]
      ↓
      [Header Section]
        - Student name & avatar
        - Session date
        - Teacher name
        - Overall rating
      ↓
      [Session Info Card]
        - Duration
        - Participation level
      ↓
      [Goals Progress Section]
        - For each goal:
          - Domain (colored badge)
          - Description
          - Progress bar: before → after
          - Change indicator (+X%)
          - Support level badge
          ↓
          [User clicks goal]
            → [Expand observations]
              - Detailed notes
              - Support explanation
      ↓
      [Teacher's Notes Section]
        - General notes
        - Recommendations
      ↓
      [Summary Stats]
        - Total goals worked
        - Average progress
        - Completed goals count
    ↓
    Decision: User action?
      ├─ Export PDF → [Generate PDF]
      │   ↓
      │   [Create PDF document]
      │   [Download/Share PDF]
      │
      ├─ Share → [Share options]
      │   ↓
      │   [WhatsApp / Email / etc.]
      │
      └─ Back → [Navigate back]
  ↓
END
```

---

## 6. Data Flow Summary

### 6.1 Create Goal Data Flow

```
Teacher Input → Validation → Database Writes → UI Update

Input Data:
  - student_id (from context)
  - goal_template_id (selected)
  - target_progress (50-100%)
  - start_date
  - target_end_date (optional)
  - notes (optional)

Database Operations:
  1. INSERT INTO student_goals
  2. INSERT INTO activity_logs

Output:
  - New goal added to student
  - Refresh goals list
  - Show success message
```

---

### 6.2 Create Report Data Flow

```
Session Info → Goal Selection → Progress Recording → Review → Database Writes → Notifications

Input Data:
  Step 1: session_date, duration, rating, participation
  Step 2: selected goal IDs (array)
  Step 3: progress data per goal (array of objects)
  Step 4: notes, recommendations, visibility

Database Operations:
  1. INSERT INTO reports
  2. INSERT INTO report_goals (multiple)
  3. UPDATE student_goals (multiple, set current_progress)
  4. UPDATE student_goals (set status = 'completed' if threshold met)
  5. INSERT INTO notifications (for parents)
  6. INSERT INTO activity_logs

Triggers:
  - If goal completed → Notify parent (goal_completed)
  - If report submitted → Notify parent (new_report)
  - Send emails (optional, async)

Output:
  - New report created
  - Goals progress updated
  - Parents notified
  - Navigate to report detail
```

---

### 6.3 Parent View Report Data Flow

```
Authentication → Load Reports → View Detail → Track View → Mark Notification

Input:
  - parent_id (from JWT)
  - report_id (selected)

Database Operations:
  1. SELECT reports + student + teacher
  2. SELECT report_goals + goal details
  3. INSERT/UPDATE report_views
  4. UPDATE notifications (mark as read)

Output:
  - Display complete report
  - Record view timestamp
  - Mark notification as read
  - Enable export/share actions
```

---

## 7. Screen-to-Database Mapping

### 7.1 Teacher Screens

| Screen                   | Tables Read                                                     | Tables Write                                                       | Key Fields                     |
| ------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------ |
| Dashboard                | students, reports, student_goals, users                         | -                                                                  | stats, summaries               |
| Students List            | students, users, student_goals, reports                         | -                                                                  | full_name, status, stats       |
| Student Detail           | students, users, student_goals, reports                         | -                                                                  | all student fields             |
| Select Domain            | domains, goal_templates                                         | -                                                                  | name, icon, color, count       |
| Goal Templates List      | goal_templates, domains, tags, student_goals                    | -                                                                  | description, tags, is_assigned |
| Edit Goal Details        | goal_templates                                                  | student_goals, activity_logs                                       | target_progress, dates, notes  |
| Create Report - Step 1   | students                                                        | -                                                                  | session_date, duration, rating |
| Select Goals - Step 2    | student_goals, goal_templates, domains                          | -                                                                  | active goals, progress         |
| Record Progress - Step 3 | student_goals, report_goals, reports                            | -                                                                  | progress_recorded, support     |
| Review - Step 4          | -                                                               | reports, report_goals, student_goals, notifications, activity_logs | all report data                |
| Report Detail            | reports, students, users, report_goals, goal_templates, domains | -                                                                  | complete report                |

---

### 7.2 Parent Screens

| Screen        | Tables Read                                                     | Tables Write                | Key Fields           |
| ------------- | --------------------------------------------------------------- | --------------------------- | -------------------- |
| Login         | parents, parent_students                                        | parents (last_login_at)     | email, password      |
| Dashboard     | parents, students, reports, report_views, notifications         | -                           | stats, recent data   |
| Children List | students, parent_students, users, student_goals, reports        | -                           | children, stats      |
| Child Detail  | students, users, student_goals, reports, report_views           | -                           | complete child info  |
| All Reports   | reports, students, users, report_views, report_goals            | -                           | all reports list     |
| Report Detail | reports, students, users, report_goals, goal_templates, domains | report_views, notifications | complete report      |
| Notifications | notifications, students                                         | notifications (is_read)     | title, message, type |

---

## 8. Validation Rules Summary

### 8.1 Create Goal Validation

```javascript
{
  student_id: "required|uuid|exists:students,id",
  goal_template_id: "required|uuid|exists:goal_templates,id",
  target_progress: "required|integer|min:50|max:100",
  start_date: "required|date|max:today",
  target_end_date: "nullable|date|after:start_date",
  notes: "nullable|string|max:500"
}
```

---

### 8.2 Create Report Validation

```javascript
// Step 1
{
  student_id: "required|uuid|exists:students,id",
  session_date: "required|date|max:today",
  session_duration: "required|integer|min:15|max:300",
  rating: "required|integer|min:1|max:5",
  participation_level: "required|in:high,medium,low"
}

// Step 2
{
  goal_ids: "required|array|min:1",
  "goal_ids.*": "uuid|exists:student_goals,id"
}

// Step 3 (per goal)
{
  student_goal_id: "required|uuid",
  progress_recorded: "required|integer|min:0|max:100",
  support_level: "required|in:independent,verbal,modeling,physical,full_physical",
  observations: "nullable|string|max:500",
  notes: "nullable|string|max:300"
}

// Step 4
{
  notes: "nullable|string|max:1000",
  recommendations: "nullable|string|max:500",
  visible_to_parents: "boolean"
}
```

---

## 9. Performance Considerations

### 9.1 Database Indexes

```sql
-- Most important indexes for performance

-- Students
CREATE INDEX idx_students_status_teacher ON students(status, primary_teacher_id);
CREATE INDEX idx_students_name_search ON students(full_name);

-- Student Goals
CREATE INDEX idx_goals_student_status ON student_goals(student_id, status);
CREATE INDEX idx_goals_template ON student_goals(goal_template_id);

-- Reports
CREATE INDEX idx_reports_student_date ON reports(student_id, session_date DESC);
CREATE INDEX idx_reports_teacher_status ON reports(teacher_id, status);
CREATE INDEX idx_reports_date_visible ON reports(session_date DESC, visible_to_parents);

-- Report Goals
CREATE INDEX idx_report_goals_composite ON report_goals(report_id, student_goal_id);

-- Notifications
CREATE INDEX idx_notifications_parent_unread ON notifications(parent_id, is_read, created_at DESC);

-- Parent Students
CREATE INDEX idx_parent_students_composite ON parent_students(parent_id, student_id);

-- Report Views
CREATE INDEX idx_report_views_composite ON report_views(report_id, parent_id);
```

---

### 9.2 Query Optimization Tips

1. **Use SELECT specific columns** instead of SELECT \*
2. **Eager load relationships** to avoid N+1 queries
3. **Paginate large lists** (limit 20-50 per page)
4. **Cache frequent queries** (domains, tags)
5. **Use database views** for complex stats
6. **Batch inserts** when creating multiple records
7. **Use transactions** for multi-table operations

---

## 10. Export/Import Considerations

### 10.1 PDF Export (Report)

**Required Data:**

- Report main info
- Student details
- Teacher details
- All goals with progress
- Observations
- Notes & recommendations
- School logo & branding

**Layout:**

- Header: School logo, report date
- Student section: Photo, name, info
- Session summary: Date, rating, duration
- Goals table: Domain, goal, before/after progress
- Notes section
- Footer: Teacher signature, date

---

### 10.2 Excel Export (Student Progress)

**Data to Export:**

- Student info
- All goals with timeline
- Progress history
- Reports summary
- Statistics

**Sheets:**

1. Overview
2. Goals Detail
3. Progress Timeline
4. Reports List

---

## 📝 Conclusion

This document provides complete flowcharts and screen specifications for the UMX system. Use this as reference when:

1. **Developing frontend screens** - Know exactly what data to fetch
2. **Creating API endpoints** - Understand the complete data flow
3. **Designing UI/UX** - Clear requirements for each screen
4. **Testing** - Validate data flow and business logic
5. **Drawing flowcharts** - Use the text format provided

**Next Steps:**

1. Create visual flowcharts using Mermaid/Lucidchart
2. Design mockups for each screen
3. Implement API endpoints
4. Build frontend screens
5. Test complete flows

---

**Document Version:** 1.0  
**Last Updated:** October 21, 2025  
**Status:** ✅ Complete & Ready for Development
