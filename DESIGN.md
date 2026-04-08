# School Management System - Design Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Design](#api-design)
6. [Authentication Flow](#authentication-flow)
7. [Frontend Architecture](#frontend-architecture)
8. [Data Flow](#data-flow)

---

## System Overview

The School Management System is a full-stack web application that provides role-based dashboards for administrators, teachers, and students. It handles user management, class management, assignments, grading, attendance tracking, and announcements.

### Key Features
- **Authentication**: JWT-based with access/refresh token rotation
- **Authorization**: Role-based access control (RBAC)
- **Admin Features**: User & class management, announcements, reports
- **Teacher Features**: Assignment creation, grading, attendance tracking
- **Student Features**: Assignment submission, grade viewing, schedule

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │   Browser   │    │   Browser   │    │   Browser   │                     │
│  │   (Admin)   │    │  (Teacher)  │    │  (Student)  │                     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                     │
│         │                  │                  │                             │
│         └──────────────────┼──────────────────┘                             │
│                            │                                                │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     REACT FRONTEND (Vite)                            │   │
│  │                     http://localhost:5173                            │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │  Components: Layout, Auth, Admin, Teacher, Student          │    │   │
│  │  ├─────────────────────────────────────────────────────────────┤    │   │
│  │  │  State: AuthContext, React Query (server state)             │    │   │
│  │  ├─────────────────────────────────────────────────────────────┤    │   │
│  │  │  Routing: React Router v6 (role-based protected routes)    │    │   │
│  │  ├─────────────────────────────────────────────────────────────┤    │   │
│  │  │  API Layer: Axios with interceptors (token refresh)        │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTP/HTTPS (REST API)
                                     │ + HTTP-only Cookies (Refresh Token)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVER LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   EXPRESS.JS BACKEND                                 │   │
│  │                   http://localhost:5000                              │   │
│  │                                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                      MIDDLEWARE STACK                          │  │   │
│  │  │  ┌─────────┐ ┌────────┐ ┌──────┐ ┌────────┐ ┌─────────────┐  │  │   │
│  │  │  │ Helmet  │ │  CORS  │ │ Rate │ │ Cookie │ │    JSON     │  │  │   │
│  │  │  │(Security)│ │        │ │Limit │ │ Parser │ │   Parser    │  │  │   │
│  │  │  └─────────┘ └────────┘ └──────┘ └────────┘ └─────────────┘  │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                               │                                      │   │
│  │                               ▼                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                        ROUTES                                  │  │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │  │   │
│  │  │  │  /auth   │ │  /admin  │ │ /teacher │ │    /student      │  │  │   │
│  │  │  │          │ │(protected)│ │(protected)│ │   (protected)    │  │  │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                               │                                      │   │
│  │                               ▼                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                 AUTH MIDDLEWARE + RBAC                         │  │   │
│  │  │  ┌─────────────────────┐    ┌─────────────────────────────┐   │  │   │
│  │  │  │  JWT Verification   │───▶│  Role-Based Access Control  │   │  │   │
│  │  │  │  (Access Token)     │    │  (admin/teacher/student)    │   │  │   │
│  │  │  └─────────────────────┘    └─────────────────────────────┘   │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                               │                                      │   │
│  │                               ▼                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                      CONTROLLERS                               │  │   │
│  │  │  ┌────────┐ ┌────────┐ ┌───────────┐ ┌───────┐ ┌───────────┐  │  │   │
│  │  │  │  Auth  │ │  User  │ │Assignment │ │ Grade │ │Attendance │  │  │   │
│  │  │  └────────┘ └────────┘ └───────────┘ └───────┘ └───────────┘  │  │   │
│  │  │  ┌────────┐ ┌─────────────┐                                    │  │   │
│  │  │  │ Class  │ │Announcement │                                    │  │   │
│  │  │  └────────┘ └─────────────┘                                    │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                               │                                      │   │
│  │                               ▼                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                       SERVICES                                 │  │   │
│  │  │          (Business Logic & Database Operations)                │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ pg (node-postgres)
                                     │ Connection Pool
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      PostgreSQL Database                             │   │
│  │                      school_management                               │   │
│  │                                                                      │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │    users    │ │  teachers   │ │  students   │ │   classes   │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │ assignments │ │ submissions │ │   grades    │ │ attendance  │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                    │   │
│  │  │announcements│ │  subjects   │ │refresh_token│                    │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                    │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Library |
| Vite | Build Tool & Dev Server |
| Tailwind CSS v4 | Styling |
| React Router v6 | Client-side Routing |
| Axios | HTTP Client |
| React Query | Server State Management |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| PostgreSQL | Database |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Winston | Logging |

---

## Database Design

### Entity Relationship Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         ENTITY RELATIONSHIP DIAGRAM                        │
└───────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐         ┌─────────────────┐         ┌─────────────┐
    │   USERS     │         │ REFRESH_TOKENS  │         │ANNOUNCEMENTS│
    ├─────────────┤         ├─────────────────┤         ├─────────────┤
    │ id (PK)     │◄───────┐│ id (PK)         │         │ id (PK)     │
    │ email       │        ││ user_id (FK)    │────────►│ author_id   │───┐
    │ password    │        │└─────────────────┘         │ title       │   │
    │ role        │        │                            │ content     │   │
    │ first_name  │        │                            │ priority    │   │
    │ last_name   │        │                            └─────────────┘   │
    │ is_active   │        │                                   │          │
    └──────┬──────┘        │                                   │          │
           │               │                            ┌──────▼──────┐   │
    ┌──────┴──────────────┬┴───────────────┐           │ ANN_READS   │   │
    │                     │                │           ├─────────────┤   │
    ▼                     ▼                ▼           │ id (PK)     │   │
┌─────────────┐   ┌─────────────┐   ┌─────────────┐    │ announce_id │◄──┘
│ADMINISTRATORS│   │  TEACHERS   │   │  STUDENTS   │    │ user_id     │
├─────────────┤   ├─────────────┤   ├─────────────┤    └─────────────┘
│ id (PK)     │   │ id (PK)     │   │ id (PK)     │
│ user_id (FK)│   │ user_id (FK)│   │ user_id (FK)│
│ department  │   │ employee_id │   │ student_id  │
└─────────────┘   │ department  │   │ parent_info │
                  └──────┬──────┘   └──────┬──────┘
                         │                 │
                         │                 │
            ┌────────────┴─────────────────┴────────────┐
            │                                          │
            ▼                                          ▼
    ┌───────────────┐                         ┌───────────────┐
    │CLASS_TEACHERS │                         │CLASS_STUDENTS │
    ├───────────────┤                         ├───────────────┤
    │ id (PK)       │                         │ id (PK)       │
    │ class_id (FK) │────┐               ┌────│ class_id (FK) │
    │ teacher_id(FK)│    │               │    │ student_id(FK)│
    │ is_primary    │    │               │    │ status        │
    └───────────────┘    │               │    └───────────────┘
                         │               │
                         ▼               ▼
                    ┌─────────────┐
                    │   CLASSES   │
                    ├─────────────┤
                    │ id (PK)     │◄───────────────────────────┐
                    │ name        │                            │
                    │ subject_id  │────┐                       │
                    │ schedule    │    │                       │
                    │ room_number │    │                       │
                    └──────┬──────┘    │                       │
                           │           │                       │
              ┌────────────┤           ▼                       │
              │            │    ┌─────────────┐                │
              │            │    │  SUBJECTS   │                │
              │            │    ├─────────────┤                │
              ▼            │    │ id (PK)     │                │
    ┌─────────────┐        │    │ name        │                │
    │ ASSIGNMENTS │        │    │ code        │                │
    ├─────────────┤        │    └─────────────┘                │
    │ id (PK)     │        │                                   │
    │ class_id(FK)│◄───────┘                                   │
    │ teacher_id  │                                            │
    │ title       │                                            │
    │ due_date    │                                            │
    │ max_points  │                                            │
    └──────┬──────┘                                            │
           │                                                   │
           ▼                                                   │
    ┌─────────────────┐        ┌─────────────┐                │
    │  SUBMISSIONS    │        │   GRADES    │                │
    ├─────────────────┤        ├─────────────┤                │
    │ id (PK)         │◄──────┐│ id (PK)     │                │
    │ assignment_id   │       ││ submission  │────────────────┤
    │ student_id (FK) │       │└─────────────┘                │
    │ submission_text │       │                               │
    │ submitted_at    │       │                               │
    └─────────────────┘       │                               │
                              │                               │
                              │    ┌─────────────┐            │
                              │    │ ATTENDANCE  │            │
                              │    ├─────────────┤            │
                              │    │ id (PK)     │            │
                              │    │ class_id    │────────────┘
                              │    │ student_id  │
                              │    │ date        │
                              │    │ status      │
                              │    └─────────────┘
                              │
                              └─────────────────────────────────
```

### Table Relationships Summary

| Parent Table | Child Table | Relationship | Description |
|--------------|-------------|--------------|-------------|
| users | teachers | 1:1 | Each teacher has one user account |
| users | students | 1:1 | Each student has one user account |
| users | administrators | 1:1 | Each admin has one user account |
| classes | class_teachers | 1:N | A class can have multiple teachers |
| classes | class_students | 1:N | A class can have multiple students |
| classes | assignments | 1:N | A class can have multiple assignments |
| classes | attendance | 1:N | Attendance records per class |
| assignments | submissions | 1:N | An assignment has multiple submissions |
| submissions | grades | 1:1 | Each submission has one grade |
| users | announcements | 1:N | A user can create multiple announcements |

---

## API Design

### API Endpoints Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          API ENDPOINTS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  /api/v1                                                                │
│  │                                                                      │
│  ├── /auth (Public)                                                     │
│  │   ├── POST   /login          → Authenticate user                    │
│  │   ├── POST   /logout         → Invalidate refresh token             │
│  │   ├── POST   /refresh        → Get new access token                 │
│  │   ├── GET    /me             → Get current user [Auth]              │
│  │   └── PUT    /change-password→ Update password [Auth]               │
│  │                                                                      │
│  ├── /admin (Admin Only)                                                │
│  │   ├── /users                                                         │
│  │   │   ├── GET    /           → List all users                       │
│  │   │   ├── POST   /           → Create new user                      │
│  │   │   ├── GET    /:id        → Get user details                     │
│  │   │   ├── PUT    /:id        → Update user                          │
│  │   │   └── DELETE /:id        → Deactivate user                      │
│  │   │                                                                  │
│  │   ├── /teachers                                                      │
│  │   │   ├── GET    /           → List all teachers                    │
│  │   │   └── GET    /:id        → Get teacher details                  │
│  │   │                                                                  │
│  │   ├── /students                                                      │
│  │   │   ├── GET    /           → List all students                    │
│  │   │   └── GET    /:id        → Get student details                  │
│  │   │                                                                  │
│  │   ├── /classes                                                       │
│  │   │   ├── GET    /           → List all classes                     │
│  │   │   ├── POST   /           → Create class                         │
│  │   │   ├── GET    /:id        → Get class details                    │
│  │   │   ├── PUT    /:id        → Update class                         │
│  │   │   ├── DELETE /:id        → Deactivate class                     │
│  │   │   ├── POST   /:id/assign-teacher  → Assign teacher              │
│  │   │   ├── POST   /:id/enroll-students → Enroll students             │
│  │   │   └── DELETE /:id/students/:sid   → Remove student              │
│  │   │                                                                  │
│  │   ├── /subjects                                                      │
│  │   │   ├── GET    /           → List subjects                        │
│  │   │   └── POST   /           → Create subject                       │
│  │   │                                                                  │
│  │   └── /announcements                                                 │
│  │       ├── GET    /           → List announcements                   │
│  │       ├── POST   /           → Create announcement                  │
│  │       ├── PUT    /:id        → Update announcement                  │
│  │       └── DELETE /:id        → Delete announcement                  │
│  │                                                                      │
│  ├── /teacher (Teacher Only)                                            │
│  │   ├── GET    /dashboard      → Dashboard stats                      │
│  │   │                                                                  │
│  │   ├── /classes                                                       │
│  │   │   ├── GET    /           → My assigned classes                  │
│  │   │   ├── GET    /:id        → Class details                        │
│  │   │   └── GET    /:id/roster → Student roster                       │
│  │   │                                                                  │
│  │   ├── /assignments                                                   │
│  │   │   ├── GET    /           → My assignments                       │
│  │   │   ├── POST   /           → Create assignment                    │
│  │   │   ├── GET    /:id        → Assignment details                   │
│  │   │   ├── PUT    /:id        → Update assignment                    │
│  │   │   ├── DELETE /:id        → Delete assignment                    │
│  │   │   ├── POST   /:id/publish→ Publish assignment                   │
│  │   │   └── GET    /:id/submissions → View submissions                │
│  │   │                                                                  │
│  │   ├── /submissions                                                   │
│  │   │   ├── GET    /:id        → Submission details                   │
│  │   │   └── POST   /:id/grade  → Grade submission                     │
│  │   │                                                                  │
│  │   └── /classes/:id/attendance                                        │
│  │       ├── GET    /           → Attendance history                   │
│  │       └── POST   /           → Record attendance                    │
│  │                                                                      │
│  └── /student (Student Only)                                            │
│      ├── GET    /dashboard      → Dashboard stats                      │
│      │                                                                  │
│      ├── /classes               → My enrolled classes                  │
│      ├── /schedule              → My class schedule                    │
│      │                                                                  │
│      ├── /assignments                                                   │
│      │   ├── GET    /           → All my assignments                   │
│      │   ├── GET    /pending    → Pending assignments                  │
│      │   ├── GET    /completed  → Completed assignments                │
│      │   ├── GET    /:id        → Assignment details                   │
│      │   └── POST   /:id/submit → Submit assignment                    │
│      │                                                                  │
│      ├── /grades                                                        │
│      │   ├── GET    /           → All grades                           │
│      │   ├── GET    /summary    → Grade summary by class               │
│      │   └── GET    /:id        → Grade details                        │
│      │                                                                  │
│      ├── /attendance                                                    │
│      │   ├── GET    /           → Attendance history                   │
│      │   └── GET    /summary    → Attendance summary                   │
│      │                                                                  │
│      └── /announcements                                                 │
│          ├── GET    /           → My announcements                     │
│          └── POST   /:id/read   → Mark as read                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### JWT Token Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TOKEN STRATEGY                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────┐   ┌─────────────────────────────────┐ │
│  │      ACCESS TOKEN           │   │       REFRESH TOKEN             │ │
│  ├─────────────────────────────┤   ├─────────────────────────────────┤ │
│  │ Lifetime: 15 minutes        │   │ Lifetime: 7 days                │ │
│  │ Storage: Memory (JS var)    │   │ Storage: HTTP-only Cookie       │ │
│  │ Purpose: API Authorization  │   │ Purpose: Get new Access Token   │ │
│  │ Contains: userId, role      │   │ Contains: userId                │ │
│  └─────────────────────────────┘   └─────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Login Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐          ┌──────────┐
│  User    │          │ Frontend │          │ Backend  │          │ Database │
└────┬─────┘          └────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │                     │
     │  Enter credentials  │                     │                     │
     │────────────────────►│                     │                     │
     │                     │                     │                     │
     │                     │  POST /auth/login   │                     │
     │                     │  {email, password}  │                     │
     │                     │────────────────────►│                     │
     │                     │                     │                     │
     │                     │                     │  Find user by email │
     │                     │                     │────────────────────►│
     │                     │                     │                     │
     │                     │                     │◄────────────────────│
     │                     │                     │     User record     │
     │                     │                     │                     │
     │                     │                     │  Verify password    │
     │                     │                     │  (bcrypt.compare)   │
     │                     │                     │                     │
     │                     │                     │  Generate tokens    │
     │                     │                     │  Store refresh hash │
     │                     │                     │────────────────────►│
     │                     │                     │                     │
     │                     │  {accessToken, user}│                     │
     │                     │  Set-Cookie: refresh│                     │
     │                     │◄────────────────────│                     │
     │                     │                     │                     │
     │                     │  Store accessToken  │                     │
     │                     │  in memory          │                     │
     │                     │                     │                     │
     │                     │  Redirect to        │                     │
     │  Show Dashboard     │  role dashboard     │                     │
     │◄────────────────────│                     │                     │
     │                     │                     │                     │
```

### Token Refresh Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│ Frontend │          │ Backend  │          │ Database │
└────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │
     │  API Request with   │                     │
     │  expired token      │                     │
     │────────────────────►│                     │
     │                     │                     │
     │  401 TOKEN_EXPIRED  │                     │
     │◄────────────────────│                     │
     │                     │                     │
     │  POST /auth/refresh │                     │
     │  (Cookie: refresh)  │                     │
     │────────────────────►│                     │
     │                     │                     │
     │                     │  Verify refresh     │
     │                     │  token hash         │
     │                     │────────────────────►│
     │                     │                     │
     │                     │◄────────────────────│
     │                     │     Valid token     │
     │                     │                     │
     │                     │  Revoke old token   │
     │                     │  Generate new pair  │
     │                     │────────────────────►│
     │                     │                     │
     │  {accessToken}      │                     │
     │  Set-Cookie: new    │                     │
     │◄────────────────────│                     │
     │                     │                     │
     │  Retry original     │                     │
     │  request            │                     │
     │────────────────────►│                     │
     │                     │                     │
```

---

## Frontend Architecture

### Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND COMPONENT TREE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  App                                                                    │
│  │                                                                      │
│  ├── BrowserRouter                                                      │
│  │   │                                                                  │
│  │   └── AuthProvider (Context)                                         │
│  │       │                                                              │
│  │       └── Routes                                                     │
│  │           │                                                          │
│  │           ├── /login ──────────────────► LoginPage                   │
│  │           │                                                          │
│  │           ├── /admin/* ─► ProtectedRoute(admin)                      │
│  │           │               │                                          │
│  │           │               └── DashboardLayout                        │
│  │           │                   ├── Sidebar                            │
│  │           │                   ├── Header                             │
│  │           │                   └── Outlet                             │
│  │           │                       ├── /admin ────► AdminDashboard    │
│  │           │                       ├── /admin/users ► UsersPage       │
│  │           │                       ├── /admin/classes► ClassesPage    │
│  │           │                       └── /admin/announcements           │
│  │           │                                       ► AnnouncementsPage│
│  │           │                                                          │
│  │           ├── /teacher/* ─► ProtectedRoute(teacher)                  │
│  │           │                 │                                        │
│  │           │                 └── DashboardLayout                      │
│  │           │                     └── Outlet                           │
│  │           │                         ├── /teacher ─► TeacherDashboard │
│  │           │                         ├── /teacher/classes             │
│  │           │                         ├── /teacher/assignments         │
│  │           │                         └── /teacher/attendance          │
│  │           │                                                          │
│  │           └── /student/* ─► ProtectedRoute(student)                  │
│  │                             │                                        │
│  │                             └── DashboardLayout                      │
│  │                                 └── Outlet                           │
│  │                                     ├── /student ─► StudentDashboard │
│  │                                     ├── /student/assignments         │
│  │                                     ├── /student/grades              │
│  │                                     └── /student/schedule            │
│  │                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### State Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STATE MANAGEMENT                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     AUTH CONTEXT                                 │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  State:                                                          │   │
│  │  • user: { id, email, role, name }                              │   │
│  │  • loading: boolean                                              │   │
│  │  • isAuthenticated: boolean                                      │   │
│  │                                                                  │   │
│  │  Methods:                                                        │   │
│  │  • login(email, password) → Authenticate & redirect             │   │
│  │  • logout() → Clear tokens & redirect to login                  │   │
│  │  • checkAuth() → Refresh token on app load                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    AXIOS INTERCEPTORS                            │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  Request Interceptor:                                            │   │
│  │  • Attach Authorization: Bearer <accessToken>                   │   │
│  │                                                                  │   │
│  │  Response Interceptor:                                           │   │
│  │  • On 401 TOKEN_EXPIRED:                                        │   │
│  │    1. Queue failed requests                                     │   │
│  │    2. Call /auth/refresh                                        │   │
│  │    3. Update access token                                       │   │
│  │    4. Retry queued requests                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Assignment Submission Flow (Example)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    ASSIGNMENT SUBMISSION DATA FLOW                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐   │
│  │ Student │    │   React UI   │    │  Express    │    │  PostgreSQL  │   │
│  │ Browser │    │  Components  │    │   Server    │    │   Database   │   │
│  └────┬────┘    └──────┬───────┘    └──────┬──────┘    └──────┬───────┘   │
│       │                │                   │                  │            │
│       │ 1. View        │                   │                  │            │
│       │ Assignments    │                   │                  │            │
│       │───────────────►│                   │                  │            │
│       │                │                   │                  │            │
│       │                │ 2. GET /student/  │                  │            │
│       │                │    assignments    │                  │            │
│       │                │──────────────────►│                  │            │
│       │                │                   │                  │            │
│       │                │                   │ 3. Query         │            │
│       │                │                   │    assignments   │            │
│       │                │                   │    + submissions │            │
│       │                │                   │─────────────────►│            │
│       │                │                   │                  │            │
│       │                │                   │◄─────────────────│            │
│       │                │                   │ 4. Results       │            │
│       │                │                   │                  │            │
│       │                │◄──────────────────│                  │            │
│       │                │ 5. Assignment     │                  │            │
│       │                │    list JSON      │                  │            │
│       │                │                   │                  │            │
│       │◄───────────────│                   │                  │            │
│       │ 6. Render      │                   │                  │            │
│       │ assignment     │                   │                  │            │
│       │ cards          │                   │                  │            │
│       │                │                   │                  │            │
│       │ 7. Click       │                   │                  │            │
│       │ "Submit"       │                   │                  │            │
│       │───────────────►│                   │                  │            │
│       │                │                   │                  │            │
│       │                │ 8. Show modal     │                  │            │
│       │◄───────────────│    form           │                  │            │
│       │                │                   │                  │            │
│       │ 9. Enter       │                   │                  │            │
│       │ submission     │                   │                  │            │
│       │ text           │                   │                  │            │
│       │───────────────►│                   │                  │            │
│       │                │                   │                  │            │
│       │                │ 10. POST /student/│                  │            │
│       │                │     assignments/  │                  │            │
│       │                │     :id/submit    │                  │            │
│       │                │──────────────────►│                  │            │
│       │                │                   │                  │            │
│       │                │                   │ 11. Validate     │            │
│       │                │                   │     due date     │            │
│       │                │                   │                  │            │
│       │                │                   │ 12. INSERT       │            │
│       │                │                   │     submission   │            │
│       │                │                   │─────────────────►│            │
│       │                │                   │                  │            │
│       │                │                   │◄─────────────────│            │
│       │                │                   │ 13. Created      │            │
│       │                │                   │                  │            │
│       │                │◄──────────────────│                  │            │
│       │                │ 14. Success       │                  │            │
│       │                │     response      │                  │            │
│       │                │                   │                  │            │
│       │◄───────────────│                   │                  │            │
│       │ 15. Close      │                   │                  │            │
│       │ modal,         │                   │                  │            │
│       │ refresh list   │                   │                  │            │
│       │                │                   │                  │            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Security Considerations

### Implemented Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| Transport | HTTPS ready | CORS configured for production |
| Authentication | JWT | Short-lived access tokens (15min) |
| Session | Refresh Tokens | HTTP-only cookies, DB-stored hashes |
| Authorization | RBAC | Middleware checks user role |
| Passwords | Hashing | bcrypt with salt rounds |
| API | Rate Limiting | 100 requests per 15 minutes |
| Headers | Security Headers | Helmet middleware |
| Input | Validation | express-validator |

### Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Request Flow:                                                          │
│                                                                         │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐  │
│  │  CORS   │──►│ Helmet  │──►│  Rate   │──►│  Auth   │──►│  RBAC   │  │
│  │ Check   │   │ Headers │   │ Limiter │   │  JWT    │   │  Role   │  │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘  │
│       │             │             │             │             │        │
│       ▼             ▼             ▼             ▼             ▼        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                         CONTROLLER                               │  │
│  │                    (Business Logic)                              │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Considerations

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Set secure cookie options
- [ ] Configure proper CORS origins
- [ ] Set up database connection pooling
- [ ] Enable logging to external service
- [ ] Set up health check endpoints
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates

### Recommended Architecture (Production)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────┐       ┌──────────┐       ┌──────────────────────────┐    │
│  │  CDN    │◄──────│  Nginx   │       │      Load Balancer       │    │
│  │(Static) │       │(Reverse  │◄──────│    (for API servers)     │    │
│  └─────────┘       │ Proxy)   │       └────────────┬─────────────┘    │
│                    └──────────┘                    │                   │
│                                          ┌─────────┴─────────┐         │
│                                          │                   │         │
│                                    ┌─────▼─────┐       ┌─────▼─────┐  │
│                                    │  API #1   │       │  API #2   │  │
│                                    │  (Node)   │       │  (Node)   │  │
│                                    └─────┬─────┘       └─────┬─────┘  │
│                                          │                   │         │
│                                          └─────────┬─────────┘         │
│                                                    │                   │
│                                          ┌─────────▼─────────┐         │
│                                          │   PostgreSQL      │         │
│                                          │   (Primary)       │         │
│                                          └─────────┬─────────┘         │
│                                                    │                   │
│                                          ┌─────────▼─────────┐         │
│                                          │   Read Replica    │         │
│                                          │   (Optional)      │         │
│                                          └───────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-04-08 | Initial release |

---

*Generated for School Management System*
