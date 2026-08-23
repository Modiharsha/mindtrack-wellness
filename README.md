# MindTrack — Student Mental Health & Wellness Monitoring System

**MindTrack** is a production-quality, privacy-first web application designed for colleges and universities to identify students facing academic, emotional, or sleep challenges, and connect them with personalized resources and counselors before stress escalates.

---

## 🌿 Core Features

1. **Daily Mood Tracker & Trends**:
   - 5-level interactive mood selector with emoji states, emotion tags, and optional reflective notes.
   - 30-day longitudinal mood trend line and calendar heatmap.
   - Daily check-in streak tracking with celebration milestones.

2. **Validated Wellness Surveys**:
   - Structured JSON survey instruments (PHQ-9 style Vitality Screener, Academic Pressure & Burnout Index, Sleep & Physical Habits).
   - Real-time progress saving (drafts are never lost) and compassionate post-submission score explanations.

3. **Intelligent Risk Scoring Engine**:
   - Dedicated modular service (`server/src/services/riskScoringService.ts`) combining survey cutoff thresholds, multi-day low mood streaks (3+ consecutive <= 2 days), and distress tag frequency.
   - Outputs triage tiers: `LOW`, `MODERATE`, and `NEEDS_ATTENTION`.
   - Automatically alerts counselors when a student enters `NEEDS_ATTENTION` and suggests gentle support resources to the student.

4. **Counselor Portal & Caseload Triage**:
   - Assigned student roster dynamically sorted by risk urgency.
   - Deep-dive student wellness profiles (30-day mood trajectory, survey score history, and risk factor breakdown).
   - Private clinical notes ledger (strictly confidential from students and admins).
   - Check-in appointment scheduling & confirmation.
   - Direct 1-on-1 private messaging channel with assigned students.

5. **Institutional Admin Dashboard (Strictly Anonymized)**:
   - **Zero PII Guarantee**: Student names, emails, and individual responses are completely redacted.
   - Campus-wide risk distribution donut charts (% Low, % Moderate, % Needs Attention).
   - Top wellness strain category breakdowns (Academic vs Sleep vs Emotional vs Social).
   - Longitudinal campus mood rhythm over the academic semester.
   - Dynamic JSON survey template manager and campus resource catalog editor.

6. **Safety & Crisis Support**:
   - Omnipresent **Crisis Support** quick-access button on every screen.
   - Instant access to 24/7 988 Suicide & Crisis Lifeline, Crisis Text Line (741741), and Campus Urgent Care.
   - Interactive guided 4-7-8 calming breathing reset visualizer.

---

## 🏗️ Tech Stack

- **Frontend**: React 18 (Vite) + TypeScript + Tailwind CSS + Lucide Icons + Recharts + Canvas Confetti
- **Backend**: Node.js + Express + TypeScript + Prisma ORM + Zod + JWT + bcryptjs + Helmet + Morgan
- **Database**: SQLite (`file:./dev.db`) out-of-the-box for instant zero-dependency execution, with 100% PostgreSQL schema compatibility.
- **Testing**: Vitest + Supertest

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ and npm installed

### 2. Installation
Install all dependencies at the root workspace:
```bash
npm install
```

### 3. Database Initialization & Seeding
Push the database schema and populate with rich demo data:
```bash
npm run db:push
npm run db:seed
```

### 4. Start Development Server
Run backend and frontend concurrently:
```bash
npm run dev
```
- Frontend will be available at: `http://localhost:5173`
- Backend API will be available at: `http://localhost:5000`

---

## 🔑 Pre-Seeded Demo Accounts

You can switch between any demo user with **1-click** using the Role Switcher in the top navigation bar, or log in with these credentials:

| Role | Name | Email | Password | Status / Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Student (High Priority)** | Alex Rivera | `alex.rivera@mindtrack.edu` | `Password@123` | Flagged: Academic Stress & 4-day low streak |
| **Student (Moderate)** | Maya Patel | `maya.patel@mindtrack.edu` | `Password@123` | Moderate: Sleep Disruption |
| **Student (Thriving)** | Jordan Lee | `jordan.lee@mindtrack.edu` | `Password@123` | Thriving: 19-Day Mood Streak |
| **Counselor** | Dr. Sarah Chen, Ph.D. | `dr.sarah@mindtrack.edu` | `Password@123` | Lead Wellness Counselor |
| **Counselor** | Dr. Marcus Vance, LCSW | `dr.marcus@mindtrack.edu` | `Password@123` | Burnout & Resilience Specialist |
| **Admin** | Dean Eleanor Vance | `admin@mindtrack.edu` | `Password@123` | Institutional Administrator |

---

## 🧪 Running Automated Tests

Run backend unit and integration tests:
```bash
npm run test
```

---

## 🔒 Privacy & Medical Disclaimer

> [!IMPORTANT]
> **Privacy Architecture**: Individual survey responses and mood logs are accessible **only** to the student and their assigned counselor. Institutional administrators can only view aggregated, anonymized cohort data.

> [!NOTE]
> **Wellness Screening Disclaimer**: MindTrack is designed for student wellness monitoring, self-reflection, and supportive screening. It is **not** a diagnostic medical instrument or emergency dispatch system.
