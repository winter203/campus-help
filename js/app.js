/**
 * Campus Help - University Problem Reporting & Incident Resolution Portal
 * Frontend Application Controller (Pure JavaScript, Zero AI references)
 */

// ================= GLOBAL STATE =================
const AppState = {
  currentView: 'home',
  adminToken: sessionStorage.getItem('campus_admin_token') || null,
  adminUser: null,
  activeReports: [],
  selectedReport: null,
  attachedEvidenceBase64: '',
  attachedFileName: ''
};

// Lifecycle Stages in Sequence
const LIFECYCLE_STAGES = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];

// ================= DOM ELEMENTS =================
const DOM = {
  // Navigation & Views
  views: {
    home: document.getElementById('view-home'),
    report: document.getElementById('view-report'),
    track: document.getElementById('view-track'),
    emergency: document.getElementById('view-emergency'),
    adminLogin: document.getElementById('view-admin-login'),
    adminDashboard: document.getElementById('view-admin-dashboard')
  },
  navLinks: {
    home: document.getElementById('navHome'),
    report: document.getElementById('navReport'),
    track: document.getElementById('navTrack'),
    emergency: document.getElementById('navEmergency'),
    adminPortal: document.getElementById('btnAdminPortalLink')
  },
  
  // Hero & Actions
  heroBtnReport: document.getElementById('heroBtnReport'),
  heroBtnTrack: document.getElementById('heroBtnTrack'),
  heroBtnEmergency: document.getElementById('heroBtnEmergency'),
  quickTrackForm: document.getElementById('quickTrackForm'),
  quickTrackInput: document.getElementById('quickTrackInput'),
  categoryGrid: document.getElementById('categorySelectionGrid'),
  
  // Student Report Form
  studentReportForm: document.getElementById('studentReportForm'),
  reportCategory: document.getElementById('reportCategory'),
  reportBuilding: document.getElementById('reportBuilding'),
  reportRoom: document.getElementById('reportRoom'),
  reportDateTime: document.getElementById('reportDateTime'),
  reportDescription: document.getElementById('reportDescription'),
  fileDropZone: document.getElementById('fileDropZone'),
  reportFileInput: document.getElementById('reportFileInput'),
  uploadPrompt: document.getElementById('uploadPrompt'),
  uploadPreview: document.getElementById('uploadPreview'),
  previewImage: document.getElementById('previewImage'),
  previewFileName: document.getElementById('previewFileName'),
  btnRemoveFile: document.getElementById('btnRemoveFile'),
  btnCancelReport: document.getElementById('btnCancelReport'),

  // Emergency Form
  emergencyReportForm: document.getElementById('emergencyReportForm'),
  emergCategory: document.getElementById('emergCategory'),
  emergBuilding: document.getElementById('emergBuilding'),
  emergRoom: document.getElementById('emergRoom'),
  emergDescription: document.getElementById('emergDescription'),

  // Tracking Elements
  trackReportForm: document.getElementById('trackReportForm'),
  trackInput: document.getElementById('trackInput'),
  trackResultContainer: document.getElementById('trackResultContainer'),
  trackErrorCard: document.getElementById('trackErrorCard'),
  trackErrorMessage: document.getElementById('trackErrorMessage'),
  trackDisplayId: document.getElementById('trackDisplayId'),
  trackDisplayCategory: document.getElementById('trackDisplayCategory'),
  trackDisplayUrgency: document.getElementById('trackDisplayUrgency'),
  trackDisplayStatusBadge: document.getElementById('trackDisplayStatusBadge'),
  trackDisplayBuilding: document.getElementById('trackDisplayBuilding'),
  trackDisplayRoom: document.getElementById('trackDisplayRoom'),
  trackDisplayDept: document.getElementById('trackDisplayDept'),
  trackDisplayDate: document.getElementById('trackDisplayDate'),
  trackDisplayDescription: document.getElementById('trackDisplayDescription'),
  trackEvidenceStatusBlock: document.getElementById('trackEvidenceStatusBlock'),
  trackTimelineStream: document.getElementById('trackTimelineStream'),
  lifecycleStepsBar: document.getElementById('lifecycleStepsBar'),

  // Success Modal
  modalSubmissionSuccess: document.getElementById('modalSubmissionSuccess'),
  modalGeneratedId: document.getElementById('modalGeneratedId'),
  btnCopyReportId: document.getElementById('btnCopyReportId'),
  copyBtnText: document.getElementById('copyBtnText'),
  btnTrackSubmittedReport: document.getElementById('btnTrackSubmittedReport'),
  btnCloseSuccessModal: document.getElementById('btnCloseSuccessModal'),

  // Admin Login
  adminLoginForm: document.getElementById('adminLoginForm'),
  adminUsername: document.getElementById('adminUsername'),
  adminPassword: document.getElementById('adminPassword'),
  btnTogglePassword: document.getElementById('btnTogglePassword'),
  loginErrorAlert: document.getElementById('loginErrorAlert'),
  loginErrorMsg: document.getElementById('loginErrorMsg'),

  // Admin Dashboard
  adminUserFullName: document.getElementById('adminUserFullName'),
  adminUserDept: document.getElementById('adminUserDept'),
  btnAdminLogout: document.getElementById('btnAdminLogout'),
  statTotal: document.getElementById('statTotal'),
  statEmergency: document.getElementById('statEmergency'),
  statSubmitted: document.getElementById('statSubmitted'),
  statAssigned: document.getElementById('statAssigned'),
  statInProgress: document.getElementById('statInProgress'),
  statResolved: document.getElementById('statResolved'),
  adminSearchInput: document.getElementById('adminSearchInput'),
  filterStatus: document.getElementById('filterStatus'),
  filterCategory: document.getElementById('filterCategory'),
  filterUrgency: document.getElementById('filterUrgency'),
  btnAdminRefresh: document.getElementById('btnAdminRefresh'),
  adminReportsTableBody: document.getElementById('adminReportsTableBody'),
  adminEmptyState: document.getElementById('adminEmptyState'),

  // Admin Inspect Modal
  modalAdminInspect: document.getElementById('modalAdminInspect'),
  inspectReportId: document.getElementById('inspectReportId'),
  inspectCategory: document.getElementById('inspectCategory'),
  inspectUrgency: document.getElementById('inspectUrgency'),
  inspectStatus: document.getElementById('inspectStatus'),
  inspectTime: document.getElementById('inspectTime'),
  inspectLocation: document.getElementById('inspectLocation'),
  inspectDescription: document.getElementById('inspectDescription'),
  inspectEvidenceContainer: document.getElementById('inspectEvidenceContainer'),
  inspectEvidenceImg: document.getElementById('inspectEvidenceImg'),
  inspectStatusSelect: document.getElementById('inspectStatusSelect'),
  btnUpdateStatus: document.getElementById('btnUpdateStatus'),
  inspectDeptSelect: document.getElementById('inspectDeptSelect'),
  btnAssignDept: document.getElementById('btnAssignDept'),
  inspectNoteInput: document.getElementById('inspectNoteInput'),
  btnAddNote: document.getElementById('btnAddNote'),
  inspectTimelineStream: document.getElementById('inspectTimelineStream'),
  btnCloseInspectModal: document.getElementById('btnCloseInspectModal'),
  btnCloseInspectFooter: document.getElementById('btnCloseInspectFooter'),

  // Toast & Misc
  toastContainer: document.getElementById('toastContainer'),
  campusAnnouncementBar: document.getElementById('campusAnnouncementBar'),
  btnCloseAnnouncement: document.getElementById('btnCloseAnnouncement')
};

// ================= UTILITIES & HELPERS =================

function showToast(message, type = 'info') {
  if (!DOM.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : ''}`;
  toast.textContent = message;
  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function formatDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

function getUrgencyBadgeClass(urgency) {
  switch (urgency) {
    case 'Emergency': return 'urgency-crit';
    case 'High': return 'urgency-high';
    case 'Medium': return 'urgency-med';
    default: return 'urgency-low';
  }
}

// ================= ROUTING SYSTEM =================

function navigateTo(routeHash) {
  const cleanRoute = (routeHash || window.location.hash || '#home').replace('#', '');
  
  // Protected Route Check for Admin Dashboard
  if (cleanRoute === 'admin-dashboard') {
    if (!AppState.adminToken) {
      window.location.hash = '#admin-login';
      return;
    }
  }

  // Hide all views
  Object.values(DOM.views).forEach(v => {
    if (v) v.classList.remove('active');
  });

  // Remove active nav class
  Object.values(DOM.navLinks).forEach(l => {
    if (l) l.classList.remove('active');
  });

  // Activate matching view
  switch (cleanRoute) {
    case 'report':
      DOM.views.report.classList.add('active');
      DOM.navLinks.report.classList.add('active');
      AppState.currentView = 'report';
      break;
    case 'track':
      DOM.views.track.classList.add('active');
      DOM.navLinks.track.classList.add('active');
      AppState.currentView = 'track';
      break;
    case 'emergency':
      DOM.views.emergency.classList.add('active');
      DOM.navLinks.emergency.classList.add('active');
      AppState.currentView = 'emergency';
      break;
    case 'admin-login':
      if (AppState.adminToken) {
        window.location.hash = '#admin-dashboard';
        return;
      }
      DOM.views.adminLogin.classList.add('active');
      AppState.currentView = 'admin-login';
      break;
    case 'admin-dashboard':
      DOM.views.adminDashboard.classList.add('active');
      AppState.currentView = 'admin-dashboard';
      loadAdminDashboardData();
      break;
    case 'home':
    default:
      DOM.views.home.classList.add('active');
      DOM.navLinks.home.classList.add('active');
      AppState.currentView = 'home';
      break;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= FILE UPLOAD HANDLING =================

function setupFileUpload() {
  if (!DOM.fileDropZone || !DOM.reportFileInput) return;

  DOM.fileDropZone.addEventListener('click', (e) => {
    if (e.target !== DOM.btnRemoveFile) {
      DOM.reportFileInput.click();
    }
  });

  DOM.reportFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleSelectedFile(file);
  });

  // Drag & drop
  DOM.fileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.fileDropZone.style.borderColor = '#1B365D';
  });

  DOM.fileDropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    DOM.fileDropZone.style.borderColor = '';
  });

  DOM.fileDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.fileDropZone.style.borderColor = '';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  });

  DOM.btnRemoveFile.addEventListener('click', (e) => {
    e.stopPropagation();
    AppState.attachedEvidenceBase64 = '';
    AppState.attachedFileName = '';
    DOM.reportFileInput.value = '';
    DOM.uploadPreview.classList.add('hidden');
    DOM.uploadPrompt.classList.remove('hidden');
  });
}

function handleSelectedFile(file) {
  if (file.size > 10 * 1024 * 1024) {
    showToast('File exceeds 10MB limit. Please choose a smaller image.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    AppState.attachedEvidenceBase64 = e.target.result;
    AppState.attachedFileName = file.name;
    DOM.previewFileName.textContent = file.name;
    DOM.previewImage.src = e.target.result;
    DOM.uploadPrompt.classList.add('hidden');
    DOM.uploadPreview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

// ================= STUDENT PROBLEM SUBMISSION =================

function setupStudentReporting() {
  // Set default datetime to now
  if (DOM.reportDateTime) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    DOM.reportDateTime.value = now.toISOString().slice(0, 16);
  }

  // Category Grid Clicks from Home
  if (DOM.categoryGrid) {
    DOM.categoryGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.category-card');
      if (!card) return;
      const category = card.dataset.category;
      if (category === 'Emergency') {
        window.location.hash = '#emergency';
      } else {
        window.location.hash = '#report';
        if (DOM.reportCategory) {
          DOM.reportCategory.value = category;
        }
      }
    });
  }

  // Cancel Button
  if (DOM.btnCancelReport) {
    DOM.btnCancelReport.addEventListener('click', () => {
      window.location.hash = '#home';
    });
  }

  // Submit Report Form
  if (DOM.studentReportForm) {
    DOM.studentReportForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const urgencyEl = document.querySelector('input[name="urgency"]:checked');
      const payload = {
        category: DOM.reportCategory.value,
        urgency: urgencyEl ? urgencyEl.value : 'Medium',
        building: DOM.reportBuilding.value,
        roomNumber: DOM.reportRoom.value,
        reportedTime: DOM.reportDateTime.value ? new Date(DOM.reportDateTime.value).toISOString() : new Date().toISOString(),
        description: DOM.reportDescription.value,
        evidenceData: AppState.attachedEvidenceBase64,
        isEmergency: false
      };

      try {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
          // Reset form
          DOM.studentReportForm.reset();
          AppState.attachedEvidenceBase64 = '';
          AppState.attachedFileName = '';
          if (DOM.uploadPreview) DOM.uploadPreview.classList.add('hidden');
          if (DOM.uploadPrompt) DOM.uploadPrompt.classList.remove('hidden');

          // Show Success Modal
          showSubmissionSuccess(data.reportId);
        } else {
          showToast(data.error || 'Failed to submit report.', 'error');
        }
      } catch (err) {
        console.error('Submission error:', err);
        showToast('Network error while filing report. Please try again.', 'error');
      }
    });
  }

  // Submit Priority Emergency Form
  if (DOM.emergencyReportForm) {
    DOM.emergencyReportForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        category: DOM.emergCategory.value,
        urgency: 'Emergency',
        building: DOM.emergBuilding.value,
        roomNumber: DOM.emergRoom.value,
        description: `[EMERGENCY PRIORITY] ${DOM.emergDescription.value}`,
        evidenceData: '',
        isEmergency: true,
        reportedTime: new Date().toISOString()
      };

      try {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
          DOM.emergencyReportForm.reset();
          showSubmissionSuccess(data.reportId);
        } else {
          showToast(data.error || 'Emergency submission failed.', 'error');
        }
      } catch (err) {
        console.error('Emergency submission error:', err);
        showToast('Network error filing emergency report.', 'error');
      }
    });
  }
}

// Success Modal Actions
function showSubmissionSuccess(reportId) {
  if (!DOM.modalSubmissionSuccess) return;
  DOM.modalGeneratedId.textContent = reportId;
  DOM.modalSubmissionSuccess.classList.remove('hidden');

  DOM.btnCopyReportId.onclick = () => {
    navigator.clipboard.writeText(reportId);
    DOM.copyBtnText.textContent = 'Copied!';
    setTimeout(() => {
      DOM.copyBtnText.textContent = 'Copy ID';
    }, 2000);
    showToast(`Report ID ${reportId} copied to clipboard.`, 'success');
  };

  DOM.btnTrackSubmittedReport.onclick = () => {
    DOM.modalSubmissionSuccess.classList.add('hidden');
    window.location.hash = '#track';
    lookupReport(reportId);
  };

  DOM.btnCloseSuccessModal.onclick = () => {
    DOM.modalSubmissionSuccess.classList.add('hidden');
    window.location.hash = '#home';
  };
}

// ================= REPORT TRACKING LOGIC =================

function setupReportTracking() {
  // Quick Track form on Home Page
  if (DOM.quickTrackForm) {
    DOM.quickTrackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = DOM.quickTrackInput.value.trim();
      if (id) {
        window.location.hash = '#track';
        lookupReport(id);
      }
    });
  }

  // Track Form on Tracking Page
  if (DOM.trackReportForm) {
    DOM.trackReportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = DOM.trackInput.value.trim();
      if (id) {
        lookupReport(id);
      }
    });
  }

  // Sample ID Chips
  document.querySelectorAll('.sample-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (id) {
        DOM.trackInput.value = id;
        lookupReport(id);
      }
    });
  });
}

async function lookupReport(reportId) {
  if (!reportId) return;
  const cleanId = reportId.trim().toUpperCase();

  try {
    const res = await fetch(`/api/reports/track/${cleanId}`);
    const data = await res.json();

    if (data.success && data.report) {
      renderTrackedReport(data.report);
      DOM.trackResultContainer.classList.remove('hidden');
      DOM.trackErrorCard.classList.add('hidden');
    } else {
      DOM.trackResultContainer.classList.add('hidden');
      DOM.trackErrorMessage.textContent = data.error || `No report found matching ID "${cleanId}".`;
      DOM.trackErrorCard.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Tracking fetch error:', err);
    DOM.trackResultContainer.classList.add('hidden');
    DOM.trackErrorMessage.textContent = 'Unable to reach the server to look up this report.';
    DOM.trackErrorCard.classList.remove('hidden');
  }
}

function renderTrackedReport(report) {
  DOM.trackDisplayId.textContent = report.id;
  DOM.trackDisplayCategory.textContent = report.category;
  DOM.trackDisplayUrgency.textContent = report.urgency;
  DOM.trackDisplayUrgency.className = `urgency-pill ${report.urgency === 'Emergency' ? 'text-emergency' : ''}`;
  DOM.trackDisplayStatusBadge.textContent = report.status;
  DOM.trackDisplayBuilding.textContent = report.building;
  DOM.trackDisplayRoom.textContent = report.roomNumber || 'Not Specified';
  DOM.trackDisplayDept.textContent = report.assignedDepartment || 'Pending Assignment';
  DOM.trackDisplayDate.textContent = formatDate(report.createdAt);
  DOM.trackDisplayDescription.textContent = report.description;

  // Evidence Flag
  if (report.evidenceUrl) {
    DOM.trackEvidenceStatusBlock.classList.remove('hidden');
  } else {
    DOM.trackEvidenceStatusBlock.classList.add('hidden');
  }

  // Update Stepper Progress Bar
  updateLifecycleProgress(report.status);

  // Render Timeline
  DOM.trackTimelineStream.innerHTML = '';
  if (report.timeline && report.timeline.length > 0) {
    report.timeline.forEach(item => {
      const el = document.createElement('div');
      el.className = 'timeline-item';
      el.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-header">
          <span class="timeline-status">${escapeHtml(item.status)}</span>
          <span class="timeline-time">${formatDate(item.timestamp)}</span>
        </div>
        <p class="timeline-note">${escapeHtml(item.note)}</p>
      `;
      DOM.trackTimelineStream.appendChild(el);
    });
  } else {
    DOM.trackTimelineStream.innerHTML = '<p class="text-subtle">No updates logged yet.</p>';
  }
}

function updateLifecycleProgress(currentStatus) {
  const steps = document.querySelectorAll('#lifecycleStepsBar .l-step');
  const connectors = document.querySelectorAll('#lifecycleStepsBar .l-connector');
  const currentIndex = LIFECYCLE_STAGES.indexOf(currentStatus);

  steps.forEach((step, idx) => {
    step.classList.remove('completed', 'current');
    if (idx < currentIndex) {
      step.classList.add('completed');
    } else if (idx === currentIndex) {
      step.classList.add('current');
    }
  });

  connectors.forEach((conn, idx) => {
    conn.classList.remove('completed');
    if (idx < currentIndex) {
      conn.classList.add('completed');
    }
  });
}

// ================= ADMIN AUTHENTICATION =================

function setupAdminAuth() {
  // Password Visibility Toggle
  if (DOM.btnTogglePassword && DOM.adminPassword) {
    DOM.btnTogglePassword.addEventListener('click', () => {
      const isPwd = DOM.adminPassword.type === 'password';
      DOM.adminPassword.type = isPwd ? 'text' : 'password';
      DOM.btnTogglePassword.textContent = isPwd ? 'Hide' : 'Show';
    });
  }

  // Admin Login Form
  if (DOM.adminLoginForm) {
    DOM.adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      DOM.loginErrorAlert.classList.add('hidden');

      const username = DOM.adminUsername.value.trim();
      const password = DOM.adminPassword.value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (data.success && data.token) {
          AppState.adminToken = data.token;
          AppState.adminUser = data.user;
          sessionStorage.setItem('campus_admin_token', data.token);

          // Update header controls
          DOM.adminUserFullName.textContent = data.user.fullName;
          DOM.adminUserDept.textContent = data.user.department;

          showToast('Administrator authenticated successfully.', 'success');
          window.location.hash = '#admin-dashboard';
        } else {
          DOM.loginErrorMsg.textContent = data.error || 'Invalid administrator credentials.';
          DOM.loginErrorAlert.classList.remove('hidden');
        }
      } catch (err) {
        console.error('Login request error:', err);
        DOM.loginErrorMsg.textContent = 'Network or server error during authentication.';
        DOM.loginErrorAlert.classList.remove('hidden');
      }
    });
  }

  // Admin Logout
  if (DOM.btnAdminLogout) {
    DOM.btnAdminLogout.addEventListener('click', async () => {
      if (AppState.adminToken) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${AppState.adminToken}` }
          });
        } catch (e) {
          // ignore
        }
      }
      AppState.adminToken = null;
      AppState.adminUser = null;
      sessionStorage.removeItem('campus_admin_token');
      showToast('You have been logged out of the admin panel.');
      window.location.hash = '#home';
    });
  }
}

// ================= ADMIN DASHBOARD & MANAGEMENT =================

async function loadAdminDashboardData() {
  if (!AppState.adminToken) {
    window.location.hash = '#admin-login';
    return;
  }

  try {
    // 1. Fetch Stats
    const statsRes = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${AppState.adminToken}` }
    });

    if (statsRes.status === 401 || statsRes.status === 403) {
      AppState.adminToken = null;
      sessionStorage.removeItem('campus_admin_token');
      window.location.hash = '#admin-login';
      return;
    }

    const statsData = await statsRes.json();
    if (statsData.success) {
      DOM.statTotal.textContent = statsData.stats.total;
      DOM.statEmergency.textContent = statsData.stats.emergency;
      DOM.statSubmitted.textContent = statsData.stats.submitted;
      DOM.statAssigned.textContent = statsData.stats.assigned;
      DOM.statInProgress.textContent = statsData.stats.inProgress;
      DOM.statResolved.textContent = statsData.stats.resolved;
    }

    // 2. Fetch Reports
    fetchAdminReportsList();
  } catch (err) {
    console.error('Error loading admin dashboard:', err);
    showToast('Failed to retrieve admin data.', 'error');
  }
}

async function fetchAdminReportsList() {
  const status = DOM.filterStatus.value;
  const category = DOM.filterCategory.value;
  const urgency = DOM.filterUrgency.value;
  const search = DOM.adminSearchInput.value.trim();

  const queryParams = new URLSearchParams({
    status: status,
    category: category,
    urgency: urgency,
    search: search
  });

  try {
    const res = await fetch(`/api/admin/reports?${queryParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${AppState.adminToken}` }
    });

    const data = await res.json();
    if (data.success) {
      AppState.activeReports = data.reports || [];
      renderAdminReportsTable(AppState.activeReports);
    }
  } catch (err) {
    console.error('Error fetching admin reports:', err);
  }
}

function renderAdminReportsTable(reports) {
  DOM.adminReportsTableBody.innerHTML = '';

  if (!reports || reports.length === 0) {
    DOM.adminEmptyState.classList.remove('hidden');
    return;
  }

  DOM.adminEmptyState.classList.add('hidden');

  reports.forEach(report => {
    const tr = document.createElement('tr');
    
    // Status pill style
    let statusClass = 'category-pill';
    if (report.status === 'Resolved') statusClass = 'text-green';
    if (report.status === 'In Progress') statusClass = 'text-amber';
    if (report.status === 'Under Review') statusClass = 'text-blue';

    tr.innerHTML = `
      <td class="tbl-id">${escapeHtml(report.id)}</td>
      <td>
        <span class="urgency-pill ${report.urgency === 'Emergency' ? 'text-emergency' : ''}">
          ${escapeHtml(report.urgency)}
        </span>
      </td>
      <td><strong>${escapeHtml(report.category)}</strong></td>
      <td>
        <span class="tbl-loc-main">${escapeHtml(report.building)}</span>
        <span class="tbl-loc-sub">${escapeHtml(report.roomNumber || '')}</span>
      </td>
      <td><span class="tbl-dept">${escapeHtml(report.assignedDepartment || 'Unassigned')}</span></td>
      <td class="tbl-time">${formatDate(report.createdAt)}</td>
      <td><span class="status-indicator-badge ${statusClass}">${escapeHtml(report.status)}</span></td>
      <td>
        <button type="button" class="btn btn-navy btn-sm btn-inspect" data-id="${report.id}">
          Manage
        </button>
      </td>
    `;
    DOM.adminReportsTableBody.appendChild(tr);
  });

  // Attach Inspect Button Handlers
  document.querySelectorAll('.btn-inspect').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      openAdminInspectModal(id);
    });
  });
}

function setupAdminFilters() {
  if (DOM.adminSearchInput) {
    DOM.adminSearchInput.addEventListener('input', debounce(fetchAdminReportsList, 300));
  }
  if (DOM.filterStatus) DOM.filterStatus.addEventListener('change', fetchAdminReportsList);
  if (DOM.filterCategory) DOM.filterCategory.addEventListener('change', fetchAdminReportsList);
  if (DOM.filterUrgency) DOM.filterUrgency.addEventListener('change', fetchAdminReportsList);
  if (DOM.btnAdminRefresh) DOM.btnAdminRefresh.addEventListener('click', loadAdminDashboardData);
}

// Admin Inspect & Action Modal
function openAdminInspectModal(reportId) {
  const report = AppState.activeReports.find(r => r.id === reportId);
  if (!report) return;

  AppState.selectedReport = report;

  DOM.inspectReportId.textContent = report.id;
  DOM.inspectCategory.textContent = report.category;
  DOM.inspectUrgency.textContent = report.urgency;
  DOM.inspectUrgency.className = `urgency-pill ${report.urgency === 'Emergency' ? 'text-emergency' : ''}`;
  DOM.inspectStatus.textContent = report.status;
  DOM.inspectTime.textContent = formatDate(report.createdAt);
  DOM.inspectLocation.textContent = `${report.building} — ${report.roomNumber || 'Not specified'}`;
  DOM.inspectDescription.textContent = report.description;

  // Evidence
  if (report.evidenceUrl && report.evidenceUrl.startsWith('data:image')) {
    DOM.inspectEvidenceImg.src = report.evidenceUrl;
    DOM.inspectEvidenceContainer.classList.remove('hidden');
  } else {
    DOM.inspectEvidenceContainer.classList.add('hidden');
  }

  // Pre-set select options
  DOM.inspectStatusSelect.value = report.status;
  if (report.assignedDepartment && report.assignedDepartment !== 'Pending Assignment') {
    DOM.inspectDeptSelect.value = report.assignedDepartment;
  }
  DOM.inspectNoteInput.value = '';

  // Render Timeline
  renderInspectTimeline(report.timeline);

  DOM.modalAdminInspect.classList.remove('hidden');
}

function renderInspectTimeline(timeline) {
  DOM.inspectTimelineStream.innerHTML = '';
  if (timeline && timeline.length > 0) {
    timeline.forEach(item => {
      const el = document.createElement('div');
      el.className = 'timeline-item';
      el.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-header">
          <span class="timeline-status">${escapeHtml(item.status)} ${item.updatedBy ? `(${escapeHtml(item.updatedBy)})` : ''}</span>
          <span class="timeline-time">${formatDate(item.timestamp)}</span>
        </div>
        <p class="timeline-note">${escapeHtml(item.note)}</p>
      `;
      DOM.inspectTimelineStream.appendChild(el);
    });
  } else {
    DOM.inspectTimelineStream.innerHTML = '<p class="text-subtle">No progression logs.</p>';
  }
}

function setupAdminModalActions() {
  const closeInspect = () => {
    DOM.modalAdminInspect.classList.add('hidden');
    AppState.selectedReport = null;
  };

  if (DOM.btnCloseInspectModal) DOM.btnCloseInspectModal.addEventListener('click', closeInspect);
  if (DOM.btnCloseInspectFooter) DOM.btnCloseInspectFooter.addEventListener('click', closeInspect);

  // Update Status
  if (DOM.btnUpdateStatus) {
    DOM.btnUpdateStatus.addEventListener('click', async () => {
      if (!AppState.selectedReport) return;
      const newStatus = DOM.inspectStatusSelect.value;
      const note = DOM.inspectNoteInput.value.trim();

      try {
        const res = await fetch(`/api/admin/reports/${AppState.selectedReport.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AppState.adminToken}`
          },
          body: JSON.stringify({ status: newStatus, note: note })
        });

        const data = await res.json();
        if (data.success && data.report) {
          showToast(`Report ${data.report.id} updated to ${newStatus}`, 'success');
          AppState.selectedReport = data.report;
          DOM.inspectStatus.textContent = data.report.status;
          DOM.inspectNoteInput.value = '';
          renderInspectTimeline(data.report.timeline);
          loadAdminDashboardData();
        } else {
          showToast(data.error || 'Failed to update status.', 'error');
        }
      } catch (err) {
        console.error('Status update error:', err);
        showToast('Server error updating status.', 'error');
      }
    });
  }

  // Assign Department
  if (DOM.btnAssignDept) {
    DOM.btnAssignDept.addEventListener('click', async () => {
      if (!AppState.selectedReport) return;
      const dept = DOM.inspectDeptSelect.value;
      const note = DOM.inspectNoteInput.value.trim();

      try {
        const res = await fetch(`/api/admin/reports/${AppState.selectedReport.id}/assign`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AppState.adminToken}`
          },
          body: JSON.stringify({ department: dept, note: note })
        });

        const data = await res.json();
        if (data.success && data.report) {
          showToast(`Assigned to ${dept}`, 'success');
          AppState.selectedReport = data.report;
          DOM.inspectStatus.textContent = data.report.status;
          DOM.inspectNoteInput.value = '';
          renderInspectTimeline(data.report.timeline);
          loadAdminDashboardData();
        } else {
          showToast(data.error || 'Failed to assign department.', 'error');
        }
      } catch (err) {
        console.error('Assign department error:', err);
        showToast('Server error assigning department.', 'error');
      }
    });
  }

  // Add Progress Note
  if (DOM.btnAddNote) {
    DOM.btnAddNote.addEventListener('click', async () => {
      if (!AppState.selectedReport) return;
      const note = DOM.inspectNoteInput.value.trim();
      if (!note) {
        showToast('Please type a note first.', 'error');
        return;
      }

      try {
        const res = await fetch(`/api/admin/reports/${AppState.selectedReport.id}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AppState.adminToken}`
          },
          body: JSON.stringify({ note: note, newStatus: DOM.inspectStatusSelect.value })
        });

        const data = await res.json();
        if (data.success && data.report) {
          showToast('Progress note added.', 'success');
          AppState.selectedReport = data.report;
          DOM.inspectNoteInput.value = '';
          renderInspectTimeline(data.report.timeline);
          loadAdminDashboardData();
        } else {
          showToast(data.error || 'Failed to add note.', 'error');
        }
      } catch (err) {
        console.error('Note add error:', err);
        showToast('Server error adding note.', 'error');
      }
    });
  }
}

// Misc UI Helpers
function setupMiscHandlers() {
  if (DOM.heroBtnReport) {
    DOM.heroBtnReport.addEventListener('click', () => { window.location.hash = '#report'; });
  }
  if (DOM.heroBtnTrack) {
    DOM.heroBtnTrack.addEventListener('click', () => { window.location.hash = '#track'; });
  }
  if (DOM.heroBtnEmergency) {
    DOM.heroBtnEmergency.addEventListener('click', () => { window.location.hash = '#emergency'; });
  }
  if (DOM.btnCloseAnnouncement && DOM.campusAnnouncementBar) {
    DOM.btnCloseAnnouncement.addEventListener('click', () => {
      DOM.campusAnnouncementBar.style.display = 'none';
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

// ================= APP INITIALIZATION =================
document.addEventListener('DOMContentLoaded', async () => {
  // Check if session token exists and verify validity
  if (AppState.adminToken) {
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${AppState.adminToken}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        AppState.adminUser = data.user;
        if (DOM.adminUserFullName) DOM.adminUserFullName.textContent = data.user.fullName;
        if (DOM.adminUserDept) DOM.adminUserDept.textContent = data.user.department;
      } else {
        AppState.adminToken = null;
        sessionStorage.removeItem('campus_admin_token');
      }
    } catch (e) {
      AppState.adminToken = null;
      sessionStorage.removeItem('campus_admin_token');
    }
  }

  // Setup modules
  setupFileUpload();
  setupStudentReporting();
  setupReportTracking();
  setupAdminAuth();
  setupAdminFilters();
  setupAdminModalActions();
  setupMiscHandlers();

  // Listen to hash changes
  window.addEventListener('hashchange', () => navigateTo(window.location.hash));

  // Initialize Route
  navigateTo(window.location.hash);
});
