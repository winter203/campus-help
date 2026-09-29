/**
 * Comprehensive Automated Verification Suite for Campus Help
 */

async function runTests() {
  console.log('--- STARTING CAMPUS HELP END-TO-END VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  const BASE_URL = 'http://localhost:3000';

  try {
    // 1. Metadata Endpoint
    console.log('\n1. Testing Metadata API...');
    const metaRes = await fetch(`${BASE_URL}/api/meta`);
    const metaData = await metaRes.json();
    assert(metaData.success === true, 'Meta API returns success');
    assert(metaData.categories.length >= 10, 'All 10 required problem categories exist');
    assert(metaData.buildings.length > 0, 'Campus buildings list exists');
    assert(metaData.emergencyContacts.length > 0, 'Emergency contacts list exists');

    // 2. Student Anonymous Problem Submission
    console.log('\n2. Testing Student Problem Report Submission...');
    const reportPayload = {
      category: 'Facilities',
      urgency: 'High',
      building: 'Engineering Block A',
      roomNumber: 'Room 102',
      reportedTime: new Date().toISOString(),
      description: 'Classroom projector HDMI port is broken and ceiling mount is loose.',
      evidenceData: '',
      isEmergency: false
    };

    const submitRes = await fetch(`${BASE_URL}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportPayload)
    });
    const submitData = await submitRes.json();
    assert(submitRes.status === 201, 'Submission returns 201 Created');
    assert(submitData.success === true, 'Report submission successful');
    assert(submitData.reportId && submitData.reportId.startsWith('CH-'), `Generated unique Report ID: ${submitData.reportId}`);
    assert(!submitData.studentName && !submitData.studentId, 'Student identity is strictly anonymous (no name/ID in response)');

    const newReportId = submitData.reportId;

    // 3. Student Report Tracking (Sanitized)
    console.log('\n3. Testing Student Tracking API...');
    const trackRes = await fetch(`${BASE_URL}/api/reports/track/${newReportId}`);
    const trackData = await trackRes.json();
    assert(trackRes.status === 200, 'Tracking returns 200 OK');
    assert(trackData.report.id === newReportId, 'Tracked report ID matches');
    assert(trackData.report.status === 'Submitted', 'Initial status is "Submitted"');
    assert(trackData.report.category === 'Facilities', 'Category matches');
    assert(trackData.report.timeline.length >= 1, 'Initial timeline entry logged');
    assert(!trackData.report.studentEmail && !trackData.report.studentName, 'Zero student personal identifiers in tracking response');

    // 4. Emergency Submission
    console.log('\n4. Testing Emergency Reporting Submission...');
    const emergencyPayload = {
      category: 'Emergency',
      urgency: 'Emergency',
      building: 'Science & Technology Hall',
      roomNumber: 'Chemistry Lab B',
      description: 'Spill hazard in chemistry prep room requiring immediate containment.',
      isEmergency: true
    };
    const emergRes = await fetch(`${BASE_URL}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emergencyPayload)
    });
    const emergData = await emergRes.json();
    assert(emergData.success === true, 'Emergency submission successful');
    assert(emergData.urgency === 'Emergency', 'Emergency urgency tagged');

    // 5. Admin Security & Role Authorization Check
    console.log('\n5. Testing Admin Authorization Security...');
    const unauthAdminRes = await fetch(`${BASE_URL}/api/admin/reports`);
    assert(unauthAdminRes.status === 401, 'Unauthenticated request to /api/admin/reports returns 401 Unauthorized');

    // Invalid Login
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin@campus.edu', password: 'WrongPassword123' })
    });
    assert(badLoginRes.status === 401, 'Invalid password rejected with 401');

    // Valid Admin Login
    console.log('\n6. Testing Admin Login...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin@campus.edu', password: 'AdminPassword2026!' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Admin login succeeded with 200 OK');
    assert(loginData.token && loginData.token.length > 20, 'Received secure session token');
    assert(loginData.user.role === 'ADMIN', 'User role verified as ADMIN');

    const adminToken = loginData.token;

    // 7. Protected Admin Dashboard Stats
    console.log('\n7. Testing Protected Admin Stats...');
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    assert(statsData.success === true, 'Admin stats retrieved successfully');
    assert(statsData.stats.total >= 5, `Total reports count: ${statsData.stats.total}`);
    assert(statsData.stats.emergency >= 1, `Emergency count: ${statsData.stats.emergency}`);

    // 8. Admin Operations on Report: Status, Department, and Notes
    console.log('\n8. Testing Admin Incident Management Operations...');
    
    // Update Status to In Progress
    const statusUpdateRes = await fetch(`${BASE_URL}/api/admin/reports/${newReportId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'In Progress', note: 'Technician dispatched to Room 102.' })
    });
    const statusData = await statusUpdateRes.json();
    assert(statusData.success === true, 'Status successfully updated to "In Progress"');
    assert(statusData.report.status === 'In Progress', 'Report status reflects "In Progress"');

    // Assign Department
    const assignRes = await fetch(`${BASE_URL}/api/admin/reports/${newReportId}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ department: 'Facilities & Building Maintenance', note: 'Assigned to Audio-Visual Repair Unit.' })
    });
    const assignData = await assignRes.json();
    assert(assignData.success === true, 'Department assigned to "Facilities & Building Maintenance"');

    // Add Progress Note
    const noteRes = await fetch(`${BASE_URL}/api/admin/reports/${newReportId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ note: 'Replacement ceiling bracket installed and projector HDMI interface restored.', newStatus: 'Resolved' })
    });
    const noteData = await noteRes.json();
    assert(noteData.success === true, 'Resolution note added and status moved to "Resolved"');
    assert(noteData.report.status === 'Resolved', 'Report status is now "Resolved"');

    // 9. Re-verify Public Tracking View reflects the changes
    console.log('\n9. Testing Student Tracking Real-Time Reflection...');
    const reTrackRes = await fetch(`${BASE_URL}/api/reports/track/${newReportId}`);
    const reTrackData = await reTrackRes.json();
    assert(reTrackData.report.status === 'Resolved', 'Student tracking immediately reflects "Resolved" status');
    assert(reTrackData.report.assignedDepartment === 'Facilities & Building Maintenance', 'Assigned department displayed to student');
    assert(reTrackData.report.timeline.length >= 4, `Timeline reflects all 4 lifecycle stages: ${reTrackData.report.timeline.map(t => t.status).join(' -> ')}`);

    console.log(`\n========================================`);
    console.log(`TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================`);

    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }

  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
