# Team Task Manager — Production-Ready Project Management App

> A full-stack, role-based project management platform built with **Node.js/Express**, **PostgreSQL/Sequelize**, and **React/Vite**. Deployable to Railway in minutes.

![Tech Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20PostgreSQL%20%7C%20React-6366f1?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-10b981?style=flat-square)

---

## 📋 Project Overview

Team Task Manager enforces strict **Role-Based Access Control (RBAC)**:

| Feature                    | Admin         | Member              |
| -------------------------- | ------------- | ------------------- |
| Create/Delete Projects     | ✅            | ❌                  |
| View assigned projects     | ✅            | ✅                  |
| Create/Delete Tasks        | ✅            | ❌                  |
| Update own task status     | ✅            | ✅ (own tasks only) |
| Add/Remove project members | ✅            | ❌                  |
| View all team members      | ✅            | ❌                  |
| Dashboard (global stats)   | ✅ (all data) | ✅ (own data)       |

---

## 🏗️ Architecture

```
Project-fullstack/
├── backend/
│   └── src/
│       ├── config/        # Sequelize instance, migration script
│       ├── models/        # User, Project, Task, ProjectMember + associations
│       ├── controllers/   # authController, projectController, taskController, dashboardController
│       ├── routes/        # auth, projects, tasks, dashboard, users
│       ├── middleware/    # auth (JWT), rbac (role guard), errorHandler
│       └── validators/    # Zod schemas + validate() factory
├── frontend/
│   └── src/
│       ├── pages/         # Login, Signup, Dashboard, Projects, ProjectDetail, Users
│       ├── components/    # AppLayout (sidebar + topbar)
│       ├── store/         # Zustand auth store (persisted)
│       └── lib/           # Axios instance with interceptors
├── Dockerfile
├── railway.json
└── Procfile
```

### Database Schema

```
users           projects          tasks                project_members
─────────       ─────────         ──────────           ───────────────
id (UUID PK)    id (UUID PK)      id (UUID PK)         id (UUID PK)
name            name              title                project_id (FK)
email (unique)  description       description          user_id (FK)
password_hash   creator_id (FK)   status (enum)        UNIQUE(project_id, user_id)
role (enum)     timestamps        priority (enum)
                                  due_date
                                  project_id (FK)
                                  assigned_to_id (FK)
```

---

## 🚀 Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (running locally or via Docker)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd Project-fullstack

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install --legacy-peer-deps
```

### 2. Configure Environment

```bash
# In backend/
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/project_mgmt
JWT_SECRET=your_super_secure_random_string_here
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
```

### 3. Initialize Database

```bash
# Create the database first
psql -U postgres -c "CREATE DATABASE project_mgmt;"

# Run schema sync
cd backend && npm run db:migrate
```

### 4. Run Development Servers

**Backend** (port 5000):

```bash
cd backend && npm run dev
```

**Frontend** (port 3000):

```bash
cd frontend && npm run dev
```

Visit `http://localhost:3000`

---

## 📡 API Documentation

### Authentication

#### POST `/api/auth/signup`

```json
// Request
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "password": "securePass123",
  "role": "Admin"  // or "Member"
}

// Response 201
{
  "success": true,
  "data": { "token": "eyJ...", "user": { "id": "uuid", "name": "Jane Doe", "role": "Admin" } }
}
```

#### POST `/api/auth/login`

```json
// Request
{ "email": "jane@company.com", "password": "securePass123" }

// Response 200
{ "success": true, "data": { "token": "eyJ...", "user": { ... } } }
```

#### GET `/api/auth/me` 🔒

Returns the current authenticated user.

---

### Projects 🔒 (All require Bearer token)

| Method | Endpoint                            | Role               | Description                     |
| ------ | ----------------------------------- | ------------------ | ------------------------------- |
| GET    | `/api/projects`                     | All                | List accessible projects        |
| POST   | `/api/projects`                     | Admin              | Create project                  |
| GET    | `/api/projects/:id`                 | All (members only) | Project details + tasks         |
| PUT    | `/api/projects/:id`                 | Admin              | Update project                  |
| DELETE | `/api/projects/:id`                 | Admin              | Delete project (cascades tasks) |
| POST   | `/api/projects/:id/members`         | Admin              | Add member `{ user_id }`        |
| DELETE | `/api/projects/:id/members/:userId` | Admin              | Remove member                   |

---

### Tasks 🔒 (Nested under projects)

| Method | Endpoint                       | Role             | Description                                           |
| ------ | ------------------------------ | ---------------- | ----------------------------------------------------- |
| GET    | `/api/projects/:pid/tasks`     | Members          | List tasks (filterable: `?status=Todo&priority=High`) |
| POST   | `/api/projects/:pid/tasks`     | Admin            | Create task                                           |
| GET    | `/api/projects/:pid/tasks/:id` | Members          | Get single task                                       |
| PUT    | `/api/projects/:pid/tasks/:id` | Admin / Member\* | Update task                                           |
| DELETE | `/api/projects/:pid/tasks/:id` | Admin            | Delete task                                           |

> \*Members can only update `status` on tasks assigned to them.

**Create Task Payload:**

```json
{
  "title": "Implement login page",
  "description": "...",
  "status": "Todo",
  "priority": "High",
  "due_date": "2024-12-31",
  "assigned_to_id": "user-uuid"
}
```

---

### Dashboard 🔒

#### GET `/api/dashboard/stats`

```json
// Response 200
{
  "success": true,
  "data": {
    "taskCounts": { "Todo": 5, "In-Progress": 3, "Done": 12, "total": 20 },
    "overdueTasks": [ { "id": "...", "title": "...", "due_date": "2024-11-01", "project": {...} } ],
    "upcomingDeadlines": [ ... ],
    "projectSummary": { "totalProjects": 8, "totalUsers": 15 }  // Admin only
  }
}
```

---

### Users 🔒 (Admin only)

#### GET `/api/users`

Returns all registered users with IDs (useful for assigning project members).

---

## 🚂 Deployment to Railway

### Step 1: Push to GitHub

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/your/repo.git
git push -u origin main
```

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Add a **PostgreSQL** service (Railway auto-provisions it)

### Step 3: Set Environment Variables

In Railway's dashboard → Variables, add:

| Variable         | Value                                    |
| ---------------- | ---------------------------------------- |
| `DATABASE_URL`   | Auto-filled by Railway PostgreSQL plugin |
| `JWT_SECRET`     | Strong random string (min 32 chars)      |
| `JWT_EXPIRES_IN` | `7d`                                     |
| `NODE_ENV`       | `production`                             |
| `CLIENT_ORIGIN`  | Your frontend URL                        |

### Step 4: Deploy

Railway auto-detects the `Procfile` and deploys. The health check at `/health` confirms the service is live.

---

## 🎬 Demo Script (2-Minute Video)

### Scene 1: Admin Flow (0:00 – 1:00)

- **[0:00]** "I'm logged in as an Admin. Notice the sidebar shows **Projects**, **Dashboard**, and **Team Members**."
- **[0:10]** Navigate to **Projects** → Click **New Project** → Fill form → Project created.
- **[0:25]** Open project → Click **Add Member** → Paste a Member user ID → Member added.
- **[0:35]** Click **Add Task** → Fill title, priority High, assign to the Member, set a due date → Task created in Kanban board.
- **[0:50]** Show **Dashboard** — charts display task counts, overdue panel, upcoming deadlines, and project summary.

### Scene 2: Member RBAC Guardrails (1:00 – 2:00)

- **[1:00]** Log out → Sign in as the **Member** account.
- **[1:10]** "Notice the sidebar has **no Team Members** link — that's the RBAC guard in action."
- **[1:20]** Navigate to Projects → The member sees only their assigned project. No **New Project** button visible.
- **[1:30]** Open the project → No **Add Task** or **Add Member** buttons visible. No delete buttons on tasks.
- **[1:40]** On the task assigned to this Member — change the status dropdown from `Todo` → `In-Progress` → Status updated successfully.
- **[1:50]** Try to access another project's task directly via URL — API returns **403 Forbidden**.
- **[2:00]** "That's Team Task Manager — clean RBAC, real-time Kanban, and production-ready APIs."

---

## 🔐 Security Features

- **Helmet.js** — Sets secure HTTP headers (XSS protection, HSTS, etc.)
- **CORS** — Restricted to `CLIENT_ORIGIN` only
- **Rate Limiting** — 200 req/15min global; 20 req/15min on auth endpoints
- **JWT with expiry** — 7-day tokens, expired token detection
- **Bcrypt** — 12 salt rounds for password hashing
- **Password scope** — Hash never returned in API responses (Sequelize `defaultScope`)
- **Input validation** — Zod schemas on every mutation endpoint
- **Payload limit** — 10kb JSON body cap to prevent flooding
- **Referential integrity** — FK cascades and SET NULL handled at DB level

---

## 📜 License

MIT © Dhawal Jain
