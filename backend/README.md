# 🗄️ Database Design & API Specification v1.1 - Parent Portal

**Project:** UMX - Student Intervention Management System  
**Date:** October 21, 2025  
**Version:** 1.1 (Added Parent Portal)  
**Database:** PostgreSQL / MySQL / MongoDB (Flexible)  
**New Features:** 👨‍👩‍👧 Parent Access, Report Viewing, Student Progress Tracking

---

## 📋 Table of Contents

1. [What's New in v1.1](#whats-new-in-v11)
2. [System Overview](#system-overview)
3. [Database Schema Updates](#database-schema-updates)
4. [Entity Relationship Diagram](#entity-relationship-diagram)
5. [Parent Portal API Endpoints](#parent-portal-api-endpoints)
6. [Security & Access Control](#security--access-control)
7. [Mobile App Features](#mobile-app-features)
8. [Implementation Guide](#implementation-guide)

---

## 🆕 What's New in v1.1

### Parent Portal Features

✨ **New Capabilities:**

1. **Parent Account Management**

   - Separate authentication for parents
   - Can have multiple children in the system
   - Secure access with email/phone + password

2. **View Student Information**

   - See child's profile (name, age, diagnosis)
   - View assigned goals and progress
   - Track milestone achievements

3. **Report Access**

   - View all reports for their children
   - Filter by date, teacher, rating
   - See detailed progress per goal
   - Export reports as PDF

4. **Notifications**

   - New report published
   - Goal completed
   - Important updates from teachers

5. **Communication** (Optional Phase 2)
   - Message teachers
   - Schedule meetings
   - Receive announcements

### Changes from v1.0

- ✅ Added `parents` table (separate from users)
- ✅ Added `parent_students` table (many-to-many)
- ✅ Added `notifications` table
- ✅ Updated `students` table (separate parent relationship)
- ✅ Added parent-specific API endpoints
- ✅ Enhanced security with parent access control

---

## 🎯 System Overview

### Updated Business Requirements

**UMX System** now manages:

- 👨‍🏫 **Teachers (Users)**: Giáo viên can thiệp ABA
- 👶 **Students**: Học sinh tự kỷ
- 👨‍👩‍👧 **Parents**: Phụ huynh học sinh (NEW!)
- 🎯 **Domains & Goals**: Lĩnh vực và mục tiêu can thiệp
- 📊 **Reports**: Báo cáo tiến độ học sinh
- 🔔 **Notifications**: Thông báo cho phụ huynh (NEW!)

### User Roles

```
System Users:
├── Admin (Full access)
├── Teacher (Create/Edit students, goals, reports)
└── Parent (View only - their children's data)
```

---

## 🗃️ Database Schema Updates

### NEW: 1. **parents** Table

```sql
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,

  -- Personal Information
  full_name VARCHAR(255) NOT NULL,
  relationship VARCHAR(50) NOT NULL, -- 'mother', 'father', 'guardian', 'other'
  avatar_url VARCHAR(500),

  -- Contact
  secondary_phone VARCHAR(20),
  address TEXT,

  -- Account Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false, -- Email/Phone verification
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by UUID, -- FK to users (admin/teacher who created)

  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_is_active (is_active),
  INDEX idx_full_name (full_name)
);

-- Seed example parents
INSERT INTO parents (email, password_hash, full_name, relationship, phone) VALUES
  ('parent1@email.com', '$2b$10$...', 'Nguyễn Văn Phụ Huynh', 'father', '0901234567'),
  ('parent2@email.com', '$2b$10$...', 'Trần Thị Mẹ', 'mother', '0902345678');
```

---

### NEW: 2. **parent_students** (Many-to-Many Relationship)

```sql
-- 1 parent có thể có nhiều children
-- 1 student có thể có nhiều parents (father, mother, guardian)
CREATE TABLE parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  student_id UUID NOT NULL,
  relationship VARCHAR(50) NOT NULL, -- 'mother', 'father', 'guardian', 'other'
  is_primary BOOLEAN DEFAULT false, -- Primary contact person
  can_view_reports BOOLEAN DEFAULT true,
  can_receive_notifications BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID, -- FK to users (who linked parent to student)

  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE KEY unique_parent_student (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_is_primary (is_primary)
);

-- Seed example relationships
INSERT INTO parent_students (parent_id, student_id, relationship, is_primary) VALUES
  (
    (SELECT id FROM parents WHERE email = 'parent1@email.com'),
    (SELECT id FROM students WHERE student_code = 'HS001'),
    'father',
    true
  );
```

---

### NEW: 3. **notifications** Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  parent_id UUID NOT NULL,
  student_id UUID, -- Related student (optional)

  -- Content
  type VARCHAR(50) NOT NULL,
  -- 'new_report', 'goal_completed', 'goal_assigned', 'announcement', 'reminder'
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

  -- Expiry
  expires_at TIMESTAMP, -- Notification expires and auto-deleted

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID, -- FK to users (teacher/admin who triggered)

  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_is_read (is_read),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);
```

---

### NEW: 4. **report_views** (Track Parent Report Views)

```sql
CREATE TABLE report_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL,
  parent_id UUID NOT NULL,

  -- View details
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  view_duration_seconds INT, -- How long they viewed
  device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop', 'app'
  ip_address VARCHAR(45),

  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,

  INDEX idx_report (report_id),
  INDEX idx_parent (parent_id),
  INDEX idx_viewed_at (viewed_at)
);
```

---

### UPDATED: **students** Table

```sql
-- Add columns to existing students table
ALTER TABLE students
  ADD COLUMN parent_portal_enabled BOOLEAN DEFAULT true,
  ADD COLUMN parent_can_view_medical_notes BOOLEAN DEFAULT true,
  ADD COLUMN parent_can_view_behavior_notes BOOLEAN DEFAULT true;

-- Update existing records
UPDATE students SET parent_portal_enabled = true;
```

---

### UPDATED: **reports** Table

```sql
-- Add columns for parent visibility
ALTER TABLE reports
  ADD COLUMN visible_to_parents BOOLEAN DEFAULT true,
  ADD COLUMN parent_notification_sent BOOLEAN DEFAULT false,
  ADD COLUMN parent_notification_sent_at TIMESTAMP;

-- Update existing records
UPDATE reports SET visible_to_parents = true WHERE status = 'submitted';
```

---

## 🔗 Updated Entity Relationship Diagram

```
┌─────────────┐          ┌──────────────────┐          ┌─────────────┐
│    users    │          │     students     │          │   parents   │
│  (teachers) │          │                  │          │             │
│             │          │                  │          │             │
│ • id (PK)   │──────┐   │ • id (PK)        │   ┌──────│ • id (PK)   │
│ • email     │      │   │ • student_code   │   │      │ • email     │
│ • role      │      │   │ • full_name      │   │      │ • full_name │
└─────────────┘      │   │ • primary_teacher│───┤      │ • phone     │
                     │   │   _id (FK)       │   │      │ • is_active │
                     │   └──────────────────┘   │      └─────────────┘
                     │            │              │               │
                     │            │              │               │
                     │            ▼              │               │
                     │   ┌──────────────────┐   │               │
                     │   │ student_teachers │   │               │
                     │   │                  │   │               │
                     └───│ • student_id (FK)│   │               │
                         │ • teacher_id (FK)│   │               │
                         └──────────────────┘   │               │
                                  │              │               │
                                  │              │               ▼
                                  │              │      ┌──────────────────┐
                                  │              │      │ parent_students  │
                                  │              │      │                  │
                                  │              └──────│ • parent_id (FK) │
                                  │                     │ • student_id (FK)│
                                  ▼                     │ • relationship   │
                         ┌──────────────────┐           │ • is_primary     │
                         │     reports      │           └──────────────────┘
                         │                  │                     │
                         │ • id (PK)        │                     │
                         │ • student_id (FK)│◄────────────────────┘
                         │ • teacher_id (FK)│                     │
                         │ • visible_to     │                     │
                         │   _parents       │                     │
                         └──────────────────┘                     │
                                  │                                │
                                  │                                ▼
                                  │                       ┌──────────────────┐
                                  │                       │  notifications   │
                                  │                       │                  │
                                  │                       │ • id (PK)        │
                                  └───────────────────────│ • parent_id (FK) │
                                                          │ • student_id (FK)│
                                                          │ • type           │
                                                          │ • is_read        │
                                                          └──────────────────┘
                                                                   │
                                                                   ▼
                                                          ┌──────────────────┐
                                                          │  report_views    │
                                                          │                  │
                                                          │ • report_id (FK) │
                                                          │ • parent_id (FK) │
                                                          │ • viewed_at      │
                                                          └──────────────────┘

New Relationships:
• parents (N) ←→ (N) students (via parent_students)
• parents (1) ←→ (N) notifications
• parents (1) ←→ (N) report_views
• reports (1) ←→ (N) report_views
```

---

## 🔌 Parent Portal API Endpoints

### Base URL: `/api/v1/parent`

### Authentication

```
POST   /parent/auth/register         # Parent self-registration (with invite code)
POST   /parent/auth/login            # Parent login
POST   /parent/auth/logout           # Logout
POST   /parent/auth/refresh-token    # Refresh token
GET    /parent/auth/me               # Get current parent info
POST   /parent/auth/forgot-password  # Request password reset
POST   /parent/auth/reset-password   # Reset password with token
POST   /parent/auth/verify-email     # Verify email with token
```

---

### 1. **Parent Registration & Profile**

#### Register Parent Account

```http
POST /parent/auth/register
Content-Type: application/json

Request Body:
{
  "email": "parent@email.com",
  "phone": "0901234567",
  "password": "SecurePass123!",
  "full_name": "Nguyễn Văn Phụ Huynh",
  "relationship": "father", // 'mother', 'father', 'guardian', 'other'
  "invite_code": "INVITE123", // Provided by admin/teacher
  "student_code": "HS001" // Optional: Link to student during registration
}

Response 201:
{
  "success": true,
  "data": {
    "parent": {
      "id": "uuid",
      "email": "parent@email.com",
      "full_name": "Nguyễn Văn Phụ Huynh",
      "is_verified": false
    },
    "message": "Registration successful. Please check your email to verify your account.",
    "verification_email_sent": true
  }
}

Response 400:
{
  "success": false,
  "error": {
    "code": "INVALID_INVITE_CODE",
    "message": "The invite code is invalid or expired"
  }
}
```

#### Parent Login

```http
POST /parent/auth/login
Content-Type: application/json

Request Body:
{
  "email": "parent@email.com",
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
      "email": "parent@email.com",
      "full_name": "Nguyễn Văn Phụ Huynh",
      "avatar_url": "https://...",
      "children_count": 2,
      "unread_notifications": 3
    }
  }
}

Response 401:
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
  }
}

Response 423:
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account is temporarily locked due to multiple failed login attempts",
    "locked_until": "2024-10-21T15:30:00Z"
  }
}
```

#### Get Parent Profile

```http
GET /parent/auth/me
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "parent@email.com",
    "phone": "0901234567",
    "full_name": "Nguyễn Văn Phụ Huynh",
    "relationship": "father",
    "avatar_url": "https://...",
    "address": "123 Street, City",
    "is_verified": true,
    "email_verified_at": "2024-01-15T10:00:00Z",
    "language": "vi",
    "timezone": "Asia/Ho_Chi_Minh",
    "notification_preferences": {
      "email": true,
      "sms": false,
      "push": true
    },
    "children": [
      {
        "id": "uuid",
        "student_code": "HS001",
        "full_name": "Hào Hổ",
        "date_of_birth": "2018-05-15",
        "avatar_url": "https://...",
        "relationship": "son",
        "is_primary_contact": true,
        "unread_reports": 2
      }
    ],
    "statistics": {
      "total_children": 2,
      "total_reports": 45,
      "unread_notifications": 3
    },
    "created_at": "2024-01-01T00:00:00Z",
    "last_login_at": "2024-10-21T08:00:00Z"
  }
}
```

#### Update Parent Profile

```http
PUT /parent/profile
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "full_name": "Updated Name",
  "phone": "0909999999",
  "address": "New Address",
  "notification_preferences": {
    "email": true,
    "sms": true,
    "push": true
  },
  "language": "en"
}

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "full_name": "Updated Name",
    // ... updated fields
    "updated_at": "2024-10-21T10:00:00Z"
  }
}
```

---

### 2. **Children (Students) Access**

#### Get My Children

```http
GET /parent/children
Authorization: Bearer <token>

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
        "gender": "male",
        "avatar_url": "https://...",
        "diagnosis": "Autism Spectrum Disorder",
        "enrollment_date": "2020-09-01",
        "status": "active",
        "primary_teacher": {
          "id": "uuid",
          "full_name": "Teacher Name",
          "email": "teacher@email.com",
          "phone": "0903456789"
        },
        "statistics": {
          "total_goals": 20,
          "active_goals": 8,
          "completed_goals": 12,
          "total_reports": 45,
          "latest_report_date": "2024-10-20",
          "avg_rating": 4.2,
          "unread_reports": 2
        },
        "relationship": "son",
        "is_primary_contact": true
      }
    ]
  }
}
```

#### Get Child Details

```http
GET /parent/children/:studentId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_code": "HS001",
    "full_name": "Hào Hổ",
    "date_of_birth": "2018-05-15",
    "age": 6,
    "gender": "male",
    "avatar_url": "https://...",
    "diagnosis": "Autism Spectrum Disorder",
    "diagnosis_date": "2019-01-01",
    "enrollment_date": "2020-09-01",
    "status": "active",
    "primary_teacher": {
      "id": "uuid",
      "full_name": "Teacher Name",
      "email": "teacher@email.com",
      "phone": "0903456789",
      "avatar_url": "https://..."
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
    "active_goals": [
      {
        "id": "uuid",
        "description": "Child can imitate 3 play actions...",
        "domain": {
          "name": "Imitation",
          "color": "#FF6B6B"
        },
        "current_progress": 65,
        "target_progress": 80,
        "status": "in_progress",
        "start_date": "2024-01-01"
      }
    ],
    "recent_achievements": [
      {
        "goal": "Can say 10 words independently",
        "completed_date": "2024-10-15",
        "progress": 100
      }
    ],
    "statistics": {
      "total_goals": 20,
      "active_goals": 8,
      "completed_goals": 12,
      "completion_rate": 60,
      "total_reports": 45,
      "avg_rating": 4.2,
      "last_session_date": "2024-10-20"
    }
  }
}

Response 403:
{
  "success": false,
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You don't have permission to view this student's information"
  }
}
```

---

### 3. **Reports Access**

#### Get Reports for My Child

```http
GET /parent/children/:studentId/reports
Authorization: Bearer <token>
Query Parameters:
  - page: int (default: 1)
  - limit: int (default: 20)
  - date_from: date (YYYY-MM-DD)
  - date_to: date (YYYY-MM-DD)
  - sort_by: string (session_date, rating)
  - sort_order: string (asc, desc)

Response 200:
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "uuid",
        "session_date": "2024-10-20",
        "session_duration": 60,
        "rating": 4,
        "participation_level": "high",
        "teacher": {
          "full_name": "Teacher Name",
          "avatar_url": "https://..."
        },
        "goals_count": 5,
        "avg_progress": 68,
        "has_notes": true,
        "is_viewed": true,
        "viewed_at": "2024-10-21T08:30:00Z",
        "created_at": "2024-10-20T15:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3
    },
    "statistics": {
      "total_reports": 45,
      "unread_reports": 2,
      "avg_rating": 4.2,
      "highest_rating": 5,
      "lowest_rating": 3
    }
  }
}
```

#### Get Report Details

```http
GET /parent/reports/:reportId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "student": {
      "id": "uuid",
      "full_name": "Hào Hổ",
      "student_code": "HS001",
      "avatar_url": "https://..."
    },
    "teacher": {
      "id": "uuid",
      "full_name": "Teacher Name",
      "email": "teacher@email.com",
      "phone": "0903456789",
      "avatar_url": "https://..."
    },
    "session_date": "2024-10-20",
    "session_duration": 60,
    "rating": 4,
    "participation_level": "high",
    "notes": "Hào đã có tiến bộ rất tốt trong buổi học hôm nay. Em đã có thể tự làm được 3/5 động tác bắt chước mà không cần hỗ trợ.",
    "recommendations": "Tiếp tục thực hành các động tác bắt chước tại nhà. Phụ huynh có thể chơi cùng con với búp bê hoặc gấu bông.",
    "goals": [
      {
        "id": "uuid",
        "description": "Child can imitate 3 play actions with a doll",
        "domain": {
          "name": "Imitation",
          "color": "#FF6B6B"
        },
        "previous_progress": 60,
        "progress_recorded": 65,
        "progress_change": 5,
        "target_progress": 80,
        "notes": "Em đã làm tốt hơn với hỗ trợ bằng lời nói",
        "support_level": "verbal"
      },
      {
        "id": "uuid",
        "description": "Different types of cries for different types of discomfort",
        "domain": {
          "name": "Expressive Language",
          "color": "#4ECDC4"
        },
        "previous_progress": 35,
        "progress_recorded": 40,
        "progress_change": 5,
        "target_progress": 70,
        "notes": "Đã có thể phân biệt 2 loại tiếng khóc",
        "support_level": "modeling"
      }
    ],
    "is_viewed": true,
    "viewed_at": "2024-10-21T08:30:00Z",
    "created_at": "2024-10-20T15:00:00Z"
  }
}

Response 403:
{
  "success": false,
  "error": {
    "code": "REPORT_ACCESS_DENIED",
    "message": "You don't have permission to view this report"
  }
}
```

#### Export Report as PDF

```http
GET /parent/reports/:reportId/export/pdf
Authorization: Bearer <token>

Response 200:
Content-Type: application/pdf
Content-Disposition: attachment; filename="report_HS001_2024-10-20.pdf"

[PDF Binary Data]

Response 403:
{
  "success": false,
  "error": {
    "code": "REPORT_ACCESS_DENIED",
    "message": "You don't have permission to export this report"
  }
}
```

---

### 4. **Goals & Progress Tracking**

#### Get Child's Goals

```http
GET /parent/children/:studentId/goals
Authorization: Bearer <token>
Query Parameters:
  - status: string (in_progress, completed, not_started)
  - domain_id: uuid

Response 200:
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": "uuid",
        "description": "Child can imitate 3 play actions...",
        "domain": {
          "id": "uuid",
          "name": "Imitation",
          "color": "#FF6B6B",
          "icon": "copy"
        },
        "current_progress": 65,
        "target_progress": 80,
        "progress_percentage": 81.25, // (65/80) * 100
        "status": "in_progress",
        "start_date": "2024-01-01",
        "target_end_date": "2024-06-01",
        "days_remaining": 42,
        "recent_progress": [
          {
            "date": "2024-10-20",
            "progress": 65,
            "change": 5
          },
          {
            "date": "2024-10-13",
            "progress": 60,
            "change": 3
          }
        ],
        "tags": [
          {
            "name": "Repeated goal",
            "color": "#95A5A6"
          }
        ]
      }
    ],
    "summary": {
      "total": 20,
      "in_progress": 8,
      "completed": 12,
      "not_started": 0,
      "overall_progress": 73.5
    }
  }
}
```

#### Get Goal Progress History

```http
GET /parent/goals/:goalId/progress-history
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "goal": {
      "id": "uuid",
      "description": "Child can imitate 3 play actions...",
      "target_progress": 80,
      "current_progress": 65
    },
    "history": [
      {
        "date": "2024-10-20",
        "progress": 65,
        "change": 5,
        "report_id": "uuid",
        "teacher": "Teacher Name",
        "notes": "Good progress with verbal prompts"
      },
      {
        "date": "2024-10-13",
        "progress": 60,
        "change": 3,
        "report_id": "uuid",
        "teacher": "Teacher Name",
        "notes": "Steady improvement"
      }
    ],
    "statistics": {
      "avg_weekly_progress": 2.5,
      "total_sessions": 12,
      "estimated_completion_date": "2024-11-15"
    }
  }
}
```

---

### 5. **Notifications**

#### Get Notifications

```http
GET /parent/notifications
Authorization: Bearer <token>
Query Parameters:
  - type: string (new_report, goal_completed, announcement)
  - is_read: boolean
  - page: int
  - limit: int

Response 200:
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "new_report",
        "title": "Báo cáo buổi học mới",
        "message": "Giáo viên vừa tạo báo cáo cho buổi học ngày 20/10/2024",
        "student": {
          "id": "uuid",
          "full_name": "Hào Hổ",
          "avatar_url": "https://..."
        },
        "related_entity_type": "report",
        "related_entity_id": "uuid",
        "priority": "normal",
        "is_read": false,
        "created_at": "2024-10-20T15:05:00Z"
      },
      {
        "id": "uuid",
        "type": "goal_completed",
        "title": "Hoàn thành mục tiêu",
        "message": "Con đã hoàn thành mục tiêu 'Can say 10 words independently'",
        "student": {
          "id": "uuid",
          "full_name": "Hào Hổ",
          "avatar_url": "https://..."
        },
        "related_entity_type": "goal",
        "related_entity_id": "uuid",
        "priority": "high",
        "is_read": true,
        "read_at": "2024-10-21T08:00:00Z",
        "created_at": "2024-10-15T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "total_pages": 3
    },
    "unread_count": 3
  }
}
```

#### Mark Notification as Read

```http
PUT /parent/notifications/:notificationId/read
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "is_read": true,
    "read_at": "2024-10-21T10:00:00Z"
  }
}
```

#### Mark All Notifications as Read

```http
PUT /parent/notifications/mark-all-read
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "marked_count": 5,
    "message": "All notifications marked as read"
  }
}
```

#### Delete Notification

```http
DELETE /parent/notifications/:notificationId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### 6. **Statistics & Dashboard**

#### Get Dashboard Summary

```http
GET /parent/dashboard
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "summary": {
      "total_children": 2,
      "total_reports": 45,
      "unread_reports": 2,
      "unread_notifications": 3,
      "active_goals": 16,
      "completed_goals_this_month": 3
    },
    "recent_reports": [
      {
        "id": "uuid",
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
    ],
    "upcoming_milestones": [
      {
        "student_name": "Hào Hổ",
        "goal": "Child can imitate 3 play actions...",
        "current_progress": 65,
        "target_progress": 80,
        "estimated_completion": "2024-11-15"
      }
    ],
    "progress_trends": {
      "this_month": {
        "reports_count": 8,
        "avg_rating": 4.2,
        "avg_progress_improvement": 5.3
      },
      "last_month": {
        "reports_count": 10,
        "avg_rating": 4.0,
        "avg_progress_improvement": 4.8
      }
    }
  }
}
```

---

## 🔒 Security & Access Control

### 1. Parent Authentication Flow

```javascript
// middleware/parentAuth.js
const parentAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify it's a parent token
    if (decoded.type !== "parent") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Parent access only" },
      });
    }

    // Get parent from database
    const parent = await db.query(
      "SELECT * FROM parents WHERE id = ? AND is_active = true",
      [decoded.id]
    );

    if (!parent) {
      return res.status(401).json({
        success: false,
        error: {
          code: "PARENT_NOT_FOUND",
          message: "Parent account not found",
        },
      });
    }

    req.parent = parent;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Invalid or expired token" },
    });
  }
};
```

### 2. Student Access Control

```javascript
// middleware/verifyStudentAccess.js
const verifyStudentAccess = async (req, res, next) => {
  const { studentId } = req.params;
  const { parent } = req;

  // Check if parent has access to this student
  const hasAccess = await db.query(
    `SELECT 1 FROM parent_students 
     WHERE parent_id = ? AND student_id = ?`,
    [parent.id, studentId]
  );

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      error: {
        code: "ACCESS_DENIED",
        message:
          "You don't have permission to access this student's information",
      },
    });
  }

  next();
};

// Usage:
app.get(
  "/parent/children/:studentId",
  parentAuthMiddleware,
  verifyStudentAccess,
  getChildDetails
);
```

### 3. Report Access Control

```javascript
// middleware/verifyReportAccess.js
const verifyReportAccess = async (req, res, next) => {
  const { reportId } = req.params;
  const { parent } = req;

  // Check if parent has access to the student of this report
  const hasAccess = await db.query(
    `SELECT 1 FROM reports r
     JOIN parent_students ps ON r.student_id = ps.student_id
     WHERE r.id = ? 
       AND ps.parent_id = ?
       AND r.visible_to_parents = true
       AND ps.can_view_reports = true`,
    [reportId, parent.id]
  );

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      error: {
        code: "REPORT_ACCESS_DENIED",
        message: "You don't have permission to view this report",
      },
    });
  }

  next();
};
```

### 4. Invite Code System

```sql
-- New table for invite codes
CREATE TABLE parent_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  student_id UUID,
  created_by UUID NOT NULL, -- Teacher/Admin who created
  max_uses INT DEFAULT 1,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,

  INDEX idx_code (code),
  INDEX idx_expires_at (expires_at)
);

-- Generate invite code
INSERT INTO parent_invite_codes (code, student_id, created_by, expires_at)
VALUES ('INVITE123', 'student-uuid', 'teacher-uuid', NOW() + INTERVAL 7 DAY);
```

```javascript
// Verify invite code during registration
const verifyInviteCode = async (code, studentCode) => {
  const invite = await db.query(
    `SELECT pic.*, s.student_code 
     FROM parent_invite_codes pic
     LEFT JOIN students s ON pic.student_id = s.id
     WHERE pic.code = ?
       AND pic.is_active = true
       AND pic.expires_at > NOW()
       AND pic.used_count < pic.max_uses`,
    [code]
  );

  if (!invite) {
    throw new Error("Invalid or expired invite code");
  }

  if (studentCode && invite.student_code !== studentCode) {
    throw new Error("Invite code does not match student");
  }

  return invite;
};
```

---

## 📱 Mobile App Features

### Parent Mobile App Screens

#### 1. **Authentication**

- 📱 Login screen
- 📱 Register with invite code
- 📱 Forgot password
- 📱 Email/Phone verification

#### 2. **Dashboard**

- 📊 Summary statistics
- 🔔 Unread notifications badge
- 📈 Recent reports
- 🎯 Recent achievements
- 📅 Upcoming sessions (if scheduled)

#### 3. **Children List**

- 👶 List of all children
- 📸 Avatar, name, age
- 📊 Quick stats (active goals, recent rating)
- 🔔 Unread reports indicator

#### 4. **Child Detail**

- 📋 Full profile
- 👨‍🏫 Assigned teachers with contact info
- 🎯 Active goals with progress bars
- 📊 Statistics & charts
- 🏆 Achievements/Milestones

#### 5. **Reports List**

- 📄 List of all reports for a child
- 🗓️ Filter by date range
- ⭐ Rating display
- 👁️ Read/Unread indicator
- 🔍 Search functionality

#### 6. **Report Detail**

- 📝 Full report content
- ⭐ Rating & participation level
- 🎯 Goals with progress
- 📈 Progress charts (before vs after)
- 💬 Teacher notes & recommendations
- 📥 Download PDF option
- ✉️ Share via email

#### 7. **Goals & Progress**

- 📋 List of all goals by domain
- 📊 Progress bars with percentages
- 📈 Progress history chart
- 🔔 Milestone notifications
- 🏆 Completed goals celebration

#### 8. **Notifications**

- 🔔 Notification center
- 📨 Push notifications
- ✉️ Email notifications
- 📱 SMS notifications (optional)
- 🔕 Notification preferences

#### 9. **Profile & Settings**

- 👤 Edit profile
- 📸 Update avatar
- 🔐 Change password
- 🌐 Language selection
- 🔔 Notification settings
- 🌓 Theme (light/dark mode)

---

## 🛠️ Implementation Guide

### Phase 1: Database Setup (Week 1)

```sql
-- Step 1: Create new tables
CREATE TABLE parents...
CREATE TABLE parent_students...
CREATE TABLE notifications...
CREATE TABLE report_views...
CREATE TABLE parent_invite_codes...

-- Step 2: Alter existing tables
ALTER TABLE students ADD COLUMN parent_portal_enabled...
ALTER TABLE reports ADD COLUMN visible_to_parents...

-- Step 3: Create indexes for performance
CREATE INDEX idx_parent_email ON parents(email);
CREATE INDEX idx_notification_parent ON notifications(parent_id, is_read);

-- Step 4: Seed test data
INSERT INTO parents...
INSERT INTO parent_students...
```

### Phase 2: Backend API (Week 2-3)

```bash
# Project structure
backend/
├── routes/
│   └── parent/
│       ├── auth.js          # Authentication endpoints
│       ├── children.js      # Children access
│       ├── reports.js       # Report viewing
│       ├── goals.js         # Goals tracking
│       ├── notifications.js # Notifications
│       └── dashboard.js     # Dashboard data
├── middleware/
│   ├── parentAuth.js        # Parent authentication
│   ├── verifyStudentAccess.js
│   └── verifyReportAccess.js
├── services/
│   ├── parentService.js
│   ├── notificationService.js
│   └── pdfExportService.js
└── utils/
    ├── inviteCodeGenerator.js
    └── emailService.js
```

### Phase 3: Admin Tools (Week 3)

**Admin Dashboard Features:**

1. **Parent Management**

   ```http
   GET    /admin/parents              # List all parents
   POST   /admin/parents              # Create parent account
   PUT    /admin/parents/:id          # Update parent
   DELETE /admin/parents/:id          # Delete parent (soft)
   POST   /admin/parents/:id/reset-password  # Reset password
   ```

2. **Invite Code Management**

   ```http
   GET    /admin/invite-codes         # List all codes
   POST   /admin/invite-codes         # Generate code
   DELETE /admin/invite-codes/:id     # Revoke code
   ```

3. **Link Parent to Student**
   ```http
   POST   /admin/students/:studentId/parents
   DELETE /admin/students/:studentId/parents/:parentId
   ```

### Phase 4: Notification System (Week 4)

```javascript
// services/notificationService.js
class NotificationService {
  // Send notification when new report is created
  async notifyNewReport(reportId) {
    const report = await getReport(reportId);
    const parents = await getParentsForStudent(report.student_id);

    for (const parent of parents) {
      if (parent.can_receive_notifications) {
        await this.createNotification({
          parent_id: parent.id,
          student_id: report.student_id,
          type: 'new_report',
          title: 'Báo cáo buổi học mới',
          message: `Giáo viên vừa tạo báo cáo cho buổi học ngày ${report.session_date}`,
          related_entity_type: 'report',
          related_entity_id: reportId,
          channels: parent.notification_preferences
        });

        // Send via channels
        if (parent.notification_preferences.email) {
          await this.sendEmail(parent.email, ...);
        }
        if (parent.notification_preferences.push) {
          await this.sendPushNotification(parent.device_token, ...);
        }
      }
    }
  }

  // Send notification when goal is completed
  async notifyGoalCompleted(goalId) {
    // Similar logic
  }
}
```

### Phase 5: Mobile App Integration (Week 5-8)

**React Native App Structure:**

```typescript
// App structure
app/
├── (auth)/
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
├── (parent)/
│   ├── _layout.tsx
│   ├── dashboard.tsx
│   ├── children/
│   │   ├── index.tsx           # List children
│   │   └── [id].tsx            # Child detail
│   ├── reports/
│   │   ├── index.tsx           # List reports
│   │   └── [id].tsx            # Report detail
│   ├── notifications.tsx
│   └── profile.tsx
└── providers/
    ├── AuthProvider.tsx        # Parent auth
    └── NotificationProvider.tsx
```

**Key Features:**

1. **Push Notifications** (Expo Notifications)

   ```typescript
   import * as Notifications from "expo-notifications";

   // Register for push notifications
   const registerForPushNotifications = async () => {
     const { status } = await Notifications.requestPermissionsAsync();
     if (status !== "granted") return;

     const token = await Notifications.getExpoPushTokenAsync();
     // Send token to backend
     await api.post("/parent/device-token", { token });
   };
   ```

2. **Offline Support** (AsyncStorage)

   ```typescript
   // Cache reports for offline viewing
   await AsyncStorage.setItem(`reports_${studentId}`, JSON.stringify(reports));
   ```

3. **Charts & Visualizations** (react-native-chart-kit)
   ```typescript
   <LineChart
     data={progressData}
     width={Dimensions.get("window").width - 32}
     height={220}
     chartConfig={chartConfig}
   />
   ```

---

## 📊 Sample Queries

### Get all students for a parent with statistics

```sql
SELECT
  s.id,
  s.student_code,
  s.full_name,
  s.date_of_birth,
  s.avatar_url,
  ps.relationship,
  ps.is_primary,
  COUNT(DISTINCT sg.id) as total_goals,
  COUNT(DISTINCT CASE WHEN sg.status = 'in_progress' THEN sg.id END) as active_goals,
  COUNT(DISTINCT CASE WHEN sg.status = 'completed' THEN sg.id END) as completed_goals,
  COUNT(DISTINCT r.id) as total_reports,
  COUNT(DISTINCT CASE WHEN rv.parent_id IS NULL THEN r.id END) as unread_reports,
  AVG(r.rating) as avg_rating
FROM parent_students ps
JOIN students s ON ps.student_id = s.id
LEFT JOIN student_goals sg ON s.id = sg.student_id
LEFT JOIN reports r ON s.id = r.student_id AND r.visible_to_parents = true
LEFT JOIN report_views rv ON r.id = rv.report_id AND rv.parent_id = ps.parent_id
WHERE ps.parent_id = ?
GROUP BY s.id;
```

### Get reports for parent with view status

```sql
SELECT
  r.*,
  s.full_name as student_name,
  s.student_code,
  u.full_name as teacher_name,
  COUNT(DISTINCT rg.id) as goals_count,
  AVG(rg.progress_recorded) as avg_progress,
  MAX(rv.viewed_at) as viewed_at,
  CASE WHEN rv.id IS NOT NULL THEN true ELSE false END as is_viewed
FROM reports r
JOIN students s ON r.student_id = s.id
JOIN users u ON r.teacher_id = u.id
JOIN parent_students ps ON s.id = ps.student_id
LEFT JOIN report_goals rg ON r.id = rg.report_id
LEFT JOIN report_views rv ON r.id = rv.report_id AND rv.parent_id = ps.parent_id
WHERE ps.parent_id = ?
  AND ps.can_view_reports = true
  AND r.visible_to_parents = true
GROUP BY r.id
ORDER BY r.session_date DESC;
```

---

## 🔐 Privacy & Data Protection

### GDPR Compliance

1. **Data Access**: Parents can request all their data
2. **Data Export**: Export all reports as PDF
3. **Data Deletion**: Parent can request account deletion
4. **Consent Management**: Clear consent for notifications

### Implementation

```sql
-- Audit log for data access
CREATE TABLE parent_data_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  access_type VARCHAR(50) NOT NULL, -- 'view', 'export', 'delete_request'
  entity_type VARCHAR(50),
  entity_id UUID,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  INDEX idx_parent (parent_id),
  INDEX idx_created_at (created_at)
);
```

---

## 🎯 Next Steps

### Week 1: Database & Backend Setup

- [ ] Create parent, parent_students, notifications tables
- [ ] Alter students and reports tables
- [ ] Seed test data
- [ ] Test database queries

### Week 2-3: API Development

- [ ] Parent authentication endpoints
- [ ] Children access APIs
- [ ] Reports viewing APIs
- [ ] Notifications APIs
- [ ] Write unit tests

### Week 4: Admin Tools

- [ ] Parent management UI
- [ ] Invite code generation
- [ ] Link parent to student
- [ ] Notification system backend

### Week 5-8: Mobile App

- [ ] Parent authentication screens
- [ ] Dashboard implementation
- [ ] Reports viewing with PDF export
- [ ] Push notifications integration
- [ ] Offline support
- [ ] Charts & visualizations
- [ ] Testing & deployment

---

## 📚 Technology Stack

### Backend

- **API**: Node.js + Express.js / NestJS
- **Database**: PostgreSQL 14+
- **Authentication**: JWT
- **Email**: SendGrid / AWS SES
- **SMS**: Twilio (optional)
- **PDF Generation**: PDFKit / Puppeteer
- **Push Notifications**: Expo Push Notifications

### Mobile App

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Context API / Zustand
- **Notifications**: expo-notifications
- **Charts**: react-native-chart-kit
- **PDF Viewer**: react-native-pdf
- **Storage**: AsyncStorage

---

## 🏁 Conclusion

### Key Improvements in v1.1

✅ **Parent Portal** - Complete authentication and authorization system  
✅ **Report Access** - Parents can view all their children's reports  
✅ **Progress Tracking** - Visual charts and statistics  
✅ **Notifications** - Real-time updates via email/push/SMS  
✅ **Security** - Invite codes, access control, audit logs  
✅ **Mobile App** - Native experience for parents  
✅ **Privacy** - GDPR compliance, data export, deletion

### Benefits

- 📈 **Increased Engagement**: Parents actively track progress
- 🤝 **Better Communication**: Teachers & parents connected
- 📊 **Data-Driven Insights**: Parents see actual progress
- 🔒 **Secure & Private**: Role-based access control
- 📱 **Convenience**: Access anytime, anywhere via mobile

---

**Document Version:** 1.1 (Parent Portal)  
**Last Updated:** October 21, 2025  
**Status:** Ready for Implementation  
**Migration from v1.0:** [See Migration Guide](#phase-1-database-setup-week-1)
