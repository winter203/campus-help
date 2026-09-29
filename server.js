const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Database File Paths
const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory Active Sessions (Token -> User Session)
const activeSessions = new Map();

// University Departments for Routing
const UNIVERSITY_DEPARTMENTS = [
  { id: 'safety', name: 'Campus Safety & Security', code: 'CSS' },
  { id: 'facilities', name: 'Facilities & Building Maintenance', code: 'FBM' },
  { id: 'it_services', name: 'IT Support & Network Services', code: 'ITS' },
  { id: 'student_affairs', name: 'Office of Student Affairs & Welfare', code: 'OSA' },
  { id: 'sanitation', name: 'Sanitation & Custodial Services', code: 'SCS' },
  { id: 'transport', name: 'Campus Transport & Parking Services', code: 'TPS' },
  { id: 'academic', name: 'Academic & Administrative Registrar', code: 'AAR' },
  { id: 'health', name: 'University Health & Medical Center', code: 'UHC' }
];

// University Buildings List
const CAMPUS_BUILDINGS = [
  'Main Academic Quad',
  'Science & Technology Hall',
  'Engineering Block A',
  'Engineering Block B',
  'Engineering Block C',
  'University Central Library',
  'Student Union & Activities Hub',
  'Arts & Humanities Building',
  'Business School Complex',
  'Health & Medical Sciences Wing',
  'North Campus Residential Quad (Dorm A-D)',
  'South Campus Residence Hall',
  'Athletic Center & Gymnasium',
  'Campus Dining Hall & Cafeteria',
  'Administration & Registrar Building',
  'West Campus Parking Structure',
  'East Perimeter & Shuttle Stop'
];

// Helper: Secure Password Hashing
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, combinedHash) {
  const [salt, originalHash] = combinedHash.split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}

// Initialize seed data if not present
function initializeData() {
  // 1. Initialize Users
  if (!fs.existsSync(USERS_FILE)) {
    const seedUsers = [
      {
        id: 'usr_admin_01',
        username: 'campus_admin',
        email: 'admin@campus.edu',
        fullName: 'University Operations Administrator',
        role: 'ADMIN',
        department: 'Campus Safety & Operations',
        passwordHash: hashPassword('AdminPassword2026!'),
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_admin_02',
        username: 'facilities_lead',
        email: 'facilities@campus.edu',
        fullName: 'Facilities Duty Officer',
        role: 'ADMIN',
        department: 'Facilities & Building Maintenance',
        passwordHash: hashPassword('Facilities2026!'),
        createdAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(seedUsers, null, 2), 'utf-8');
  }

  // 2. Initialize Seed Reports
  if (!fs.existsSync(REPORTS_FILE)) {
    const seedReports = [
      {
        id: 'CH-10482',
        category: 'Utilities',
        urgency: 'High',
        building: 'Science & Technology Hall',
        roomNumber: 'Room 304 (Chemistry Lab)',
        description: 'Water leaking continuously from the ceiling pipe near lab station 4. Floor is slippery and puddles are spreading near electrical outlets.',
        evidenceUrl: '',
        status: 'In Progress',
        assignedDepartment: 'Facilities & Building Maintenance',
        isEmergency: false,
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        timeline: [
          {
            status: 'Submitted',
            note: 'Report submitted by student. Unique tracking ID CH-10482 issued.',
            timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
          },
          {
            status: 'Under Review',
            note: 'Report reviewed by Facilities dispatch desk. Classified as high priority utility incident.',
            timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
          },
          {
            status: 'Assigned',
            note: 'Assigned to Facilities & Building Maintenance (Plumbing Response Unit).',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            status: 'In Progress',
            note: 'Maintenance technician dispatched on-site. Main valve isolated; pipe coupling replacement currently underway.',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'CH-10485',
        category: 'IT/Wi-Fi',
        urgency: 'Medium',
        building: 'University Central Library',
        roomNumber: '2nd Floor Quiet Study Area',
        description: 'Eduroam Wi-Fi access points on the 2nd floor are repeatedly dropping connections every 5 minutes. Multiple study tables are unable to load university portals.',
        evidenceUrl: '',
        status: 'Assigned',
        assignedDepartment: 'IT Support & Network Services',
        isEmergency: false,
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        timeline: [
          {
            status: 'Submitted',
            note: 'Report submitted by student. Tracking ID CH-10485 generated.',
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
          },
          {
            status: 'Under Review',
            note: 'IT Helpdesk verified access point telemetry showing packet loss on AP-LIB-201 and 202.',
            timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
          },
          {
            status: 'Assigned',
            note: 'Assigned to IT Support & Network Services (Campus Wireless Infrastructure Team).',
            timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'CH-10490',
        category: 'Security',
        urgency: 'Emergency',
        building: 'West Campus Parking Structure',
        roomNumber: 'Level 2 Stairwell (South Exit)',
        description: 'Stairwell emergency door magnetic latch is broken and propped open. Overhead motion sensor lights are non-functional, causing a severe dark blind spot after hours.',
        evidenceUrl: '',
        status: 'Under Review',
        assignedDepartment: 'Campus Safety & Security',
        isEmergency: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        timeline: [
          {
            status: 'Submitted',
            note: 'Emergency safety report submitted via priority portal.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            status: 'Under Review',
            note: 'Prioritized by Campus Safety dispatch. Security patrol routed to inspect stairwell door and temporary lighting unit deployed.',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'CH-10430',
        category: 'Cleanliness',
        urgency: 'Low',
        building: 'Student Union & Activities Hub',
        roomNumber: 'Ground Floor Restrooms',
        description: 'Hand soap dispenser is empty and paper towel trash bin is overflowing.',
        evidenceUrl: '',
        status: 'Resolved',
        assignedDepartment: 'Sanitation & Custodial Services',
        isEmergency: false,
        createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        timeline: [
          {
            status: 'Submitted',
            note: 'Report submitted by student.',
            timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString()
          },
          {
            status: 'Under Review',
            note: 'Custodial schedule checked.',
            timestamp: new Date(Date.now() - 45 * 60 * 60 * 1000).toISOString()
          },
          {
            status: 'Assigned',
            note: 'Assigned to Sanitation & Custodial Services (Student Union Day Crew).',
            timestamp: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString()
          },
          {
            status: 'In Progress',
            note: 'Restock and thorough cleaning in progress.',
            timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString()
          },
          {
            status: 'Resolved',
            note: 'Dispensers refilled, trash cleared, and sanitization log updated.',
            timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    ];
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(seedReports, null, 2), 'utf-8');
  }
}

// Helpers for reading & writing reports
function getReports() {
  try {
    const raw = fs.readFileSync(REPORTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading reports file:', err);
    return [];
  }
}

function saveReports(reports) {
  try {
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving reports file:', err);
    return false;
  }
}

function getUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
}

// Generate unique ID: "CH-" + 5 random digits or sequential number
function generateReportId() {
  const reports = getReports();
  let candidateId = '';
  let isUnique = false;
  while (!isUnique) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    candidateId = `CH-${randomNum}`;
    if (!reports.some(r => r.id === candidateId)) {
      isUnique = true;
    }
  }
  return candidateId;
}

// ================= AUTHENTICATION MIDDLEWARE =================
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication credentials required to access administrative resources.'
    });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid token. Please log in again.'
    });
  }

  // Verify role
  if (session.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Insufficient privileges. Admin access only.'
    });
  }

  req.user = session;
  next();
}

// ================= PUBLIC API ROUTES =================

// 1. Get Campus Metadata (Buildings & Departments)
app.get('/api/meta', (req, res) => {
  res.json({
    success: true,
    buildings: CAMPUS_BUILDINGS,
    departments: UNIVERSITY_DEPARTMENTS,
    categories: [
      'Emergency',
      'Security',
      'Harassment',
      'Utilities',
      'Facilities',
      'IT/Wi-Fi',
      'Cleanliness',
      'Transport',
      'Academic/Administrative',
      'Other'
    ],
    urgencyLevels: ['Low', 'Medium', 'High', 'Emergency'],
    emergencyContacts: [
      { name: 'Campus Safety & Security (24/7)', number: 'Ext. 3333 / (555) 019-3333' },
      { name: 'University Health & Medical Center', number: 'Ext. 4444 / (555) 019-4444' },
      { name: 'Facilities & Power Emergency Line', number: 'Ext. 2222 / (555) 019-2222' },
      { name: 'Counseling & Crisis Support Service', number: 'Ext. 5555 / (555) 019-5555' }
    ]
  });
});

// 2. Submit a New Problem Report (Student Facing)
app.post('/api/reports', (req, res) => {
  try {
    const {
      category,
      urgency,
      building,
      roomNumber,
      description,
      evidenceData,
      isEmergency,
      reportedTime
    } = req.body;

    // Validation
    if (!category || !building || !description || !description.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide Category, Building/Location, and a detailed Problem Description.'
      });
    }

    const reportId = generateReportId();
    const effectiveUrgency = isEmergency || category === 'Emergency' ? 'Emergency' : (urgency || 'Medium');

    const newReport = {
      id: reportId,
      category: String(category).trim(),
      urgency: effectiveUrgency,
      building: String(building).trim(),
      roomNumber: roomNumber ? String(roomNumber).trim() : 'Not Specified',
      description: String(description).trim(),
      evidenceUrl: evidenceData ? String(evidenceData).trim() : '',
      status: 'Submitted',
      assignedDepartment: 'Pending Review',
      isEmergency: effectiveUrgency === 'Emergency',
      createdAt: reportedTime || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'Submitted',
          note: `Report submitted anonymously by student. Unique tracking ID ${reportId} issued.`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    const reports = getReports();
    reports.unshift(newReport);
    saveReports(reports);

    // Return sanitized confirmation without exposing student identity
    res.status(201).json({
      success: true,
      message: 'Your report has been submitted successfully.',
      reportId: newReport.id,
      status: newReport.status,
      category: newReport.category,
      urgency: newReport.urgency,
      building: newReport.building,
      createdAt: newReport.createdAt
    });
  } catch (err) {
    console.error('Error submitting report:', err);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while filing your report.'
    });
  }
});

// 3. Track a Report (Public / Student - Sanitized, Safe)
app.get('/api/reports/track/:reportId', (req, res) => {
  try {
    const cleanId = String(req.params.reportId || '').trim().toUpperCase();
    if (!cleanId) {
      return res.status(400).json({ success: false, error: 'Please enter a valid Report ID.' });
    }

    const reports = getReports();
    const found = reports.find(r => r.id.toUpperCase() === cleanId);

    if (!found) {
      return res.status(404).json({
        success: false,
        error: `No report found matching ID "${cleanId}". Please verify your Report ID.`
      });
    }

    // Public sanitized payload: strictly no personal info
    const sanitized = {
      id: found.id,
      category: found.category,
      urgency: found.urgency,
      building: found.building,
      roomNumber: found.roomNumber,
      description: found.description,
      evidenceUrl: found.evidenceUrl ? true : false, // Do not leak raw image publicly if not needed, just flag
      status: found.status,
      assignedDepartment: found.assignedDepartment || 'Pending Assignment',
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
      isEmergency: found.isEmergency,
      timeline: found.timeline || []
    };

    res.json({
      success: true,
      report: sanitized
    });
  } catch (err) {
    console.error('Error tracking report:', err);
    res.status(500).json({
      success: false,
      error: 'Unable to track report at this time.'
    });
  }
});

// ================= AUTHENTICATION ROUTES =================

// Admin Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both username/email and password.'
      });
    }

    const users = getUsers();
    const cleanUser = String(username).trim().toLowerCase();

    const user = users.find(u =>
      u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials.'
      });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials.'
      });
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const sessionData = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      token: token,
      createdAt: Date.now()
    };

    activeSessions.set(token, sessionData);

    res.json({
      success: true,
      message: 'Login successful.',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, error: 'Authentication failed due to server error.' });
  }
});

// Verify Current Session
app.get('/api/auth/verify', requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role,
      department: req.user.department
    }
  });
});

// Admin Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ================= PROTECTED ADMIN ROUTES =================

// 1. Get Admin Stats
app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
  try {
    const reports = getReports();

    const stats = {
      total: reports.length,
      emergency: reports.filter(r => r.urgency === 'Emergency' || r.isEmergency).length,
      submitted: reports.filter(r => r.status === 'Submitted').length,
      underReview: reports.filter(r => r.status === 'Under Review').length,
      assigned: reports.filter(r => r.status === 'Assigned').length,
      inProgress: reports.filter(r => r.status === 'In Progress').length,
      resolved: reports.filter(r => r.status === 'Resolved').length
    };

    res.json({ success: true, stats });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve stats.' });
  }
});

// 2. Get All Reports (with Search & Filters)
app.get('/api/admin/reports', requireAdminAuth, (req, res) => {
  try {
    const { status, category, urgency, search } = req.query;
    let reports = getReports();

    if (status && status !== 'ALL') {
      reports = reports.filter(r => r.status.toLowerCase() === String(status).toLowerCase());
    }

    if (category && category !== 'ALL') {
      reports = reports.filter(r => r.category.toLowerCase() === String(category).toLowerCase());
    }

    if (urgency && urgency !== 'ALL') {
      reports = reports.filter(r => r.urgency.toLowerCase() === String(urgency).toLowerCase());
    }

    if (search && search.trim()) {
      const q = String(search).trim().toLowerCase();
      reports = reports.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.building.toLowerCase().includes(q) ||
        (r.roomNumber && r.roomNumber.toLowerCase().includes(q)) ||
        r.description.toLowerCase().includes(q) ||
        (r.assignedDepartment && r.assignedDepartment.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: reports.length, reports });
  } catch (err) {
    console.error('Error retrieving reports for admin:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch reports.' });
  }
});

// 3. Update Report Status
app.patch('/api/admin/reports/:id/status', requireAdminAuth, (req, res) => {
  try {
    const reportId = req.params.id;
    const { status, note } = req.body;

    const validStatuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const reports = getReports();
    const index = reports.findIndex(r => r.id === reportId);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }

    const now = new Date().toISOString();
    const report = reports[index];
    report.status = status;
    report.updatedAt = now;

    const timelineEntry = {
      status: status,
      note: note && note.trim() ? note.trim() : `Status updated to ${status} by administrator (${req.user.fullName}).`,
      timestamp: now,
      updatedBy: req.user.fullName
    };

    if (!report.timeline) report.timeline = [];
    report.timeline.push(timelineEntry);

    reports[index] = report;
    saveReports(reports);

    res.json({
      success: true,
      message: `Report ${reportId} status updated to ${status}.`,
      report
    });
  } catch (err) {
    console.error('Error updating report status:', err);
    res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
});

// 4. Assign Department to Report
app.patch('/api/admin/reports/:id/assign', requireAdminAuth, (req, res) => {
  try {
    const reportId = req.params.id;
    const { department, note } = req.body;

    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, error: 'Department name is required.' });
    }

    const reports = getReports();
    const index = reports.findIndex(r => r.id === reportId);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }

    const now = new Date().toISOString();
    const report = reports[index];
    report.assignedDepartment = department.trim();
    if (report.status === 'Submitted') {
      report.status = 'Assigned';
    }
    report.updatedAt = now;

    const timelineEntry = {
      status: report.status,
      note: note && note.trim()
        ? note.trim()
        : `Assigned to ${department.trim()} by ${req.user.fullName}.`,
      timestamp: now,
      updatedBy: req.user.fullName
    };

    if (!report.timeline) report.timeline = [];
    report.timeline.push(timelineEntry);

    reports[index] = report;
    saveReports(reports);

    res.json({
      success: true,
      message: `Report ${reportId} successfully assigned to ${department}.`,
      report
    });
  } catch (err) {
    console.error('Error assigning department:', err);
    res.status(500).json({ success: false, error: 'Failed to assign department.' });
  }
});

// 5. Add Progress Note / Response Update
app.post('/api/admin/reports/:id/notes', requireAdminAuth, (req, res) => {
  try {
    const reportId = req.params.id;
    const { note, newStatus } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, error: 'Note text cannot be empty.' });
    }

    const reports = getReports();
    const index = reports.findIndex(r => r.id === reportId);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }

    const now = new Date().toISOString();
    const report = reports[index];

    if (newStatus && ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].includes(newStatus)) {
      report.status = newStatus;
    }

    report.updatedAt = now;

    const timelineEntry = {
      status: report.status,
      note: note.trim(),
      timestamp: now,
      updatedBy: req.user.fullName
    };

    if (!report.timeline) report.timeline = [];
    report.timeline.push(timelineEntry);

    reports[index] = report;
    saveReports(reports);

    res.json({
      success: true,
      message: 'Progress update note added to report history.',
      report
    });
  } catch (err) {
    console.error('Error adding note to report:', err);
    res.status(500).json({ success: false, error: 'Failed to add note.' });
  }
});

// Fallback HTML routing for Single Page Application
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
initializeData();

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  Campus Help - University Incident Management System`);
  console.log(`  Server running at: http://localhost:${PORT}`);
  console.log(`  Admin Login: admin@campus.edu / AdminPassword2026!`);
  console.log(`=======================================================`);
});
