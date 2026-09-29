# Campus Help — University Problem Reporting & Incident Resolution System

An institutional, clean, and reliable university problem-reporting platform designed for students to safely report campus issues and track their resolution progress anonymously.

---

## 🏛️ System Overview

### Core Objectives
1. **Student Incident Reporting**: Quick reporting across 10 campus problem categories.
2. **Student Privacy & Anonymity**: Strict identity protection — no names, student IDs, emails, or phone numbers are exposed or publicly displayed.
3. **Report Tracking**: Live 5-stage lifecycle progress tracker (`Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`).
4. **Emergency Reporting**: High-priority safety dispatch flow with university emergency contacts.
5. **Secure Admin Portal**: Role-based access control (RBAC), password hashing via `scrypt`, protected `/api/admin/*` endpoints, and interactive department assignment and status management.
6. **Clean Institutional Design**: Professional university palette (Oxford Navy, Slate, crisp typography), accessible contrast, zero AI branding or futuristic gimmicks.

---

## 🚀 Getting Started

### 1. Requirements
- Node.js (v18+ recommended)
- Modern web browser

### 2. Run Locally
```bash
# Start the server (default port: 3000)
node server.js

# Or using npm
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Administrator Credentials

To test the Admin Management Dashboard:
- **URL**: `http://localhost:3000/#admin-login` (or click **"Admin Portal"** in the top navigation or footer)
- **Username / Email**: `admin@campus.edu` *(or `campus_admin`)*
- **Password**: `AdminPassword2026!`

*(Additional staff account: `facilities@campus.edu` / `Facilities2026!`)*

---

## 📋 Features

### Student Side
- **Home Page**:
  - Direct actions: **Report a Problem**, **Track My Report**, and **Emergency Report**.
  - Quick Report ID lookup.
  - Interactive grid covering all 10 problem categories:
    - *Emergencies*
    - *Security Concerns*
    - *Harassment & Bullying (Confidential)*
    - *Water & Electricity (Utilities)*
    - *Broken Classroom Equipment (Facilities)*
    - *Internet & Wi-Fi*
    - *Cleanliness & Sanitation*
    - *Transport & Parking*
    - *Academic & Administrative*
    - *Other Campus Issues*
  - 4-Step Process Guide & Official University Emergency Directory (Ext. 3333, Ext. 4444, Ext. 2222, Ext. 5555).
- **Report Submission**:
  - Building/location selector and room number.
  - Date and time observed.
  - Urgency level selector (*Low*, *Medium*, *High*, *Emergency*).
  - Problem description.
  - Optional photo/evidence upload with instant thumbnail preview.
  - Instant submission modal issuing a copyable **Report ID** (e.g. `CH-10482`).
- **Report Tracking**:
  - Live 5-stage visual stepper progress bar.
  - Assigned university department details.
  - Chronological timeline history with timestamps and official notes from maintenance staff.
  - Anonymous status guarantee.
- **Emergency Priority Form**:
  - Red alert header with direct instructions to call Campus Safety for life-safety emergencies.
  - Fast-track form with instant high-priority queueing.

### Admin Side (Restricted & Protected)
- **Role-Based Authentication**:
  - Protected API endpoints rejecting unauthenticated or student requests with `401 Unauthorized` / `403 Forbidden`.
  - Passwords hashed using cryptographic scrypt algorithms with random salt.
- **Admin Dashboard**:
  - 6 Key Performance Metric cards: *Total Reports*, *Emergency Critical*, *Pending Review*, *Assigned*, *In Progress*, *Resolved*.
  - Multi-parameter live search and filters (Status, Category, Urgency, Search query).
  - Incident details inspector modal with attached photo preview.
  - Update report status (`Submitted`, `Under Review`, `Assigned`, `In Progress`, `Resolved`).
  - Assign to university departments (*Campus Safety & Security*, *Facilities & Maintenance*, *IT Support*, *Student Affairs*, *Sanitation*, *Transport*, *Registrar*, *Health Center*).
  - Add official progress notes to the student-visible timeline.

---

## 🧪 Automated Testing

To run the verification test suite:
```bash
node test-suite.js
```
The test suite validates:
- Public metadata endpoints.
- Anonymous student report creation and Report ID generation.
- Public tracking data sanitization (zero personal info leakage).
- Emergency priority filing.
- Backend authorization and 401 error enforcement.
- Admin authentication and token validation.
- Live status updates, department assignments, and timeline note appending.
