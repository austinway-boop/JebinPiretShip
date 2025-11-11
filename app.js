// Alpha Fleet Board - Pirate Ship App
// Data Models and State

let students = [];
let auditLog = [];
let isAdminMode = true; // Start in Admin Mode by default
let currentStudent = null;
let undoAction = null;
let undoTimer = null;

// Initialize seed data
function initializeSeedData() {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Sam', 'Drew', 'Avery', 'Charlie', 'Dakota', 'Emerson', 'Finley', 'Harper', 'Jamie', 'Kai', 'Logan', 'Skyler', 'Quinn', 'Reese'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

    students = [];
    
    for (let i = 0; i < 18; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        // Make some students already in Pirate Ship
        const isPirate = i < 5;
        const pirateStart = isPirate ? new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000) : null;
        const pirateEnd = isPirate ? new Date(pirateStart.getTime() + 14 * 24 * 60 * 60 * 1000) : null;
        
        students.push({
            id: `student-${Date.now()}-${i}`,
            full_name: `${firstName} ${lastName}`,
            status: isPirate ? 'PirateShip' : 'Active',
            pirate_start: pirateStart ? pirateStart.toISOString() : null,
            pirate_end: pirateEnd ? pirateEnd.toISOString() : null,
            notes: '',
            last_updated_by: 'System',
            last_updated_at: new Date().toISOString()
        });
    }

    auditLog = [{
        timestamp: new Date().toISOString(),
        student_id: null,
        action: 'System Initialized',
        actor: 'System',
        old_values: null,
        new_values: null
    }];

    saveToLocalStorage();
}

// JSON File Storage (works for both local and Vercel)
async function saveToJSON() {
    const data = {
        students: students,
        auditLog: auditLog,
        lastUpdated: new Date().toISOString()
    };
    
    // Always save to localStorage as primary storage for client-side persistence
    localStorage.setItem('alpha_fleet_students', JSON.stringify(students));
    localStorage.setItem('alpha_fleet_audit', JSON.stringify(auditLog));
    localStorage.setItem('alpha_fleet_last_updated', new Date().toISOString());
    
    // Also try to sync with server if available
    try {
        const response = await fetch('/save-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('✅ Data synced to server');
        }
    } catch (error) {
        // Server not available, localStorage is sufficient
        console.log('💾 Data saved to localStorage (server unavailable)');
    }
}

async function loadFromJSON() {
    // Try localStorage first (primary storage for client-side app)
    const savedStudents = localStorage.getItem('alpha_fleet_students');
    const savedAudit = localStorage.getItem('alpha_fleet_audit');
    
    if (savedStudents) {
        students = JSON.parse(savedStudents);
        auditLog = JSON.parse(savedAudit || '[]');
        console.log('📦 Loaded data from localStorage');
        console.log(`   Students: ${students.length}, Audit logs: ${auditLog.length}`);
        return;
    }
    
    // If no localStorage data, try loading from server
    try {
        const response = await fetch('/data.json');
        if (response.ok) {
            const data = await response.json();
            if (data.students && data.students.length > 0) {
                students = data.students;
                auditLog = data.auditLog || [];
                console.log('📄 Loaded data from server JSON file');
                // Save to localStorage for future use
                saveToJSON();
                return;
            }
        }
    } catch (error) {
        console.log('ℹ️ No server data available');
    }
    
    // If no data found anywhere, initialize with seed data
    console.log('🌱 Initializing with seed data');
    initializeSeedData();
}

// Keep the old function name for compatibility
function saveToLocalStorage() {
    saveToJSON();
}

function loadFromLocalStorage() {
    return loadFromJSON();
}

// Audit logging
function logAction(studentId, action, actor, oldValues, newValues) {
    auditLog.push({
        timestamp: new Date().toISOString(),
        student_id: studentId,
        action,
        actor,
        old_values: oldValues,
        new_values: newValues
    });
    saveToLocalStorage();
}

// Calculate days remaining
function getDaysRemaining(endDate) {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Auto-release students
function autoReleaseExpiredStudents() {
    const now = new Date();
    let releasedCount = 0;
    
    students.forEach(student => {
        if (student.status === 'PirateShip' && student.pirate_end) {
            const endDate = new Date(student.pirate_end);
            if (endDate <= now) {
                const oldValues = { ...student };
                student.status = 'Active';
                student.pirate_start = null;
                student.pirate_end = null;
                student.last_updated_by = 'System Auto-Release';
                student.last_updated_at = new Date().toISOString();
                
                logAction(student.id, 'Auto-Release', 'System', oldValues, { ...student });
                releasedCount++;
            }
        }
    });
    
    if (releasedCount > 0) {
        saveToLocalStorage();
        render();
        console.log(`Auto-released ${releasedCount} student(s)`);
    }
}

// Schedule auto-release check at midnight
function scheduleAutoRelease() {
    // Check every minute for demo purposes (change to daily in production)
    setInterval(() => {
        autoReleaseExpiredStudents();
    }, 60000);
    
    // Also check on load
    autoReleaseExpiredStudents();
}

// Filter and sort students
function getFilteredStudents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const urgentFilter = document.getElementById('urgentFilter').checked;
    
    return students.filter(student => {
        const matchesSearch = student.full_name.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || student.status === statusFilter;
        const matchesUrgent = !urgentFilter || (student.status === 'PirateShip' && getDaysRemaining(student.pirate_end) <= 3);
        
        return matchesSearch && matchesStatus && matchesUrgent;
    });
}

// Render student card
function renderStudentCard(student) {
    const card = document.createElement('div');
    card.className = `student-card ${student.status === 'PirateShip' ? 'pirate-ship' : ''} ${isAdminMode ? 'draggable' : ''}`;
    card.dataset.studentId = student.id;
    
    if (isAdminMode) {
        card.draggable = true;
    }
    
    const daysLeft = student.status === 'PirateShip' ? getDaysRemaining(student.pirate_end) : null;
    let countdownClass = 'normal';
    if (daysLeft !== null) {
        if (daysLeft <= 3) countdownClass = 'urgent';
        else if (daysLeft <= 7) countdownClass = 'warning';
    }
    
    const pirateStartFormatted = student.pirate_start ? new Date(student.pirate_start).toLocaleDateString() : '';
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-name">${student.full_name}</div>
            <div class="status-chip ${student.status === 'Active' ? 'active' : 'pirate-ship'}">
                ${student.status === 'Active' ? '⚓ Active' : '🏴‍☠️ Pirate Ship'}
            </div>
        </div>
        <div class="card-body">
            ${student.status === 'PirateShip' && daysLeft !== null ? `
                <div class="countdown-badge ${countdownClass}">
                    ⏳ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left
                </div>
                <div class="pirate-start">Started: ${pirateStartFormatted}</div>
            ` : ''}
        </div>
    `;
    
    // Track if we're dragging to prevent click event
    let isDragging = false;
    
    card.addEventListener('click', (e) => {
        if (!isDragging) {
            openStudentDrawer(student.id);
        }
        isDragging = false;
    });
    
    if (isAdminMode) {
        card.addEventListener('dragstart', (e) => {
            isDragging = true;
            handleDragStart(e);
        });
        card.addEventListener('dragend', (e) => {
            handleDragEnd(e);
            // Reset isDragging after a short delay to allow click event to check it
            setTimeout(() => {
                isDragging = false;
            }, 100);
        });
    } else {
        // Show read-only tooltip on drag attempt
        card.addEventListener('mousedown', (e) => {
            if (!isAdminMode) {
                showReadOnlyTooltip(e.pageX, e.pageY);
            }
        });
    }
    
    return card;
}

// Render board view
function renderBoardView() {
    const activeColumn = document.getElementById('activeColumn');
    const pirateColumn = document.getElementById('pirateColumn');
    
    activeColumn.innerHTML = '';
    pirateColumn.innerHTML = '';
    
    const filteredStudents = getFilteredStudents();
    
    // Sort Active by name, Pirate Ship by days remaining
    const activeStudents = filteredStudents
        .filter(s => s.status === 'Active')
        .sort((a, b) => a.full_name.localeCompare(b.full_name));
    
    const pirateStudents = filteredStudents
        .filter(s => s.status === 'PirateShip')
        .sort((a, b) => {
            const daysA = getDaysRemaining(a.pirate_end) || 999;
            const daysB = getDaysRemaining(b.pirate_end) || 999;
            return daysA - daysB;
        });
    
    activeStudents.forEach(student => {
        activeColumn.appendChild(renderStudentCard(student));
    });
    
    pirateStudents.forEach(student => {
        pirateColumn.appendChild(renderStudentCard(student));
    });
    
    // Update counts
    document.getElementById('activeCount').textContent = activeStudents.length;
    document.getElementById('pirateCount').textContent = pirateStudents.length;
}

// Render table view
function renderTableView() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    const filteredStudents = getFilteredStudents();
    
    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        const daysLeft = student.status === 'PirateShip' ? getDaysRemaining(student.pirate_end) : null;
        
        row.innerHTML = `
            <td><input type="checkbox" class="student-checkbox" data-student-id="${student.id}"></td>
            <td>${student.full_name}</td>
            <td>
                <span class="status-chip ${student.status === 'Active' ? 'active' : 'pirate-ship'}">
                    ${student.status === 'Active' ? 'Active' : 'Pirate Ship'}
                </span>
            </td>
            <td>${student.pirate_start ? new Date(student.pirate_start).toLocaleDateString() : '--'}</td>
            <td>${student.pirate_end ? new Date(student.pirate_end).toLocaleDateString() : '--'}</td>
            <td>${daysLeft !== null ? `${daysLeft} days` : '--'}</td>
            <td class="table-notes">${student.notes || '--'}</td>
            <td>
                <button class="btn btn-primary btn-small" onclick="openStudentDrawer('${student.id}')">Details</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Update bulk action buttons
    updateBulkActionButtons();
}

// Render
function render() {
    updateLastRefresh();
    
    const boardView = document.getElementById('boardView');
    const tableView = document.getElementById('tableView');
    
    if (boardView.style.display !== 'none') {
        renderBoardView();
    }
    
    if (tableView.style.display !== 'none') {
        renderTableView();
    }
}

function updateLastRefresh() {
    const now = new Date();
    document.getElementById('lastRefresh').textContent = now.toLocaleTimeString();
}

// Drag and Drop handlers
function handleDragStart(e) {
    console.log('🎯 Drag started, isAdminMode:', isAdminMode, 'studentId:', e.target.dataset.studentId);
    if (!isAdminMode) {
        e.preventDefault();
        console.log('❌ Drag prevented - not in admin mode');
        return;
    }
    
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.dataset.studentId);
    console.log('✅ Drag data set');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    if (!isAdminMode) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const column = e.target.closest('.column-content');
    if (column) {
        column.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const column = e.target.closest('.column-content');
    if (column) {
        column.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    console.log('📍 Drop event triggered');
    e.preventDefault();
    
    const column = e.target.closest('.column-content');
    if (column) {
        column.classList.remove('drag-over');
    }
    
    if (!isAdminMode) {
        console.log('❌ Drop prevented - not in admin mode');
        return;
    }
    
    const studentId = e.dataTransfer.getData('text/html');
    const targetStatus = column ? column.dataset.status : null;
    
    console.log('📦 Drop data - studentId:', studentId, 'targetStatus:', targetStatus);
    
    if (!studentId || !targetStatus) {
        console.log('❌ Missing data for drop');
        return;
    }
    
    const student = students.find(s => s.id === studentId);
    if (!student) {
        console.log('❌ Student not found:', studentId);
        return;
    }
    
    if (student.status === targetStatus) {
        console.log('ℹ️ Student already in target status');
        return;
    }
    
    console.log('✅ Opening modal for:', student.full_name, 'to', targetStatus);
    
    if (targetStatus === 'PirateShip') {
        openPirateModal(student);
    } else if (targetStatus === 'Active') {
        openReleaseModal(student);
    }
}

// Modals
function openPirateModal(student) {
    currentStudent = student;
    const modal = document.getElementById('pirateModal');
    const message = document.getElementById('pirateModalMessage');
    const startInput = document.getElementById('pirateStartDate');
    const endInput = document.getElementById('pirateEndDate');
    const notesInput = document.getElementById('pirateNotes');
    
    message.textContent = `Set sail: ${student.full_name} enters Pirate Ship`;
    
    const now = new Date();
    startInput.value = formatDateTimeLocal(now);
    endInput.value = formatDateTimeLocal(new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000));
    notesInput.value = '';
    
    modal.classList.remove('hidden');
    
    // Update end date when start date changes
    startInput.addEventListener('input', () => {
        const start = new Date(startInput.value);
        const end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
        endInput.value = formatDateTimeLocal(end);
    });
}

function openReleaseModal(student) {
    currentStudent = student;
    const modal = document.getElementById('releaseModal');
    const message = document.getElementById('releaseModalMessage');
    
    message.textContent = `Anchors up: ${student.full_name} returns to Active.`;
    
    modal.classList.remove('hidden');
}

function openCustomEndModal() {
    const modal = document.getElementById('customEndModal');
    const input = document.getElementById('customEndDate');
    
    if (currentStudent && currentStudent.pirate_end) {
        input.value = formatDateTimeLocal(new Date(currentStudent.pirate_end));
    }
    
    modal.classList.remove('hidden');
}

function closePirateModal() {
    document.getElementById('pirateModal').classList.add('hidden');
    currentStudent = null;
}

function closeReleaseModal() {
    document.getElementById('releaseModal').classList.add('hidden');
    currentStudent = null;
}

function closeCustomEndModal() {
    document.getElementById('customEndModal').classList.add('hidden');
}

// Move student to Pirate Ship
function confirmMoveToPirateShip() {
    if (!currentStudent) return;
    
    const startInput = document.getElementById('pirateStartDate').value;
    const endInput = document.getElementById('pirateEndDate').value;
    const notes = document.getElementById('pirateNotes').value;
    
    const oldValues = { ...currentStudent };
    
    currentStudent.status = 'PirateShip';
    currentStudent.pirate_start = new Date(startInput).toISOString();
    currentStudent.pirate_end = new Date(endInput).toISOString();
    if (notes) currentStudent.notes = notes;
    currentStudent.last_updated_by = 'Admin';
    currentStudent.last_updated_at = new Date().toISOString();
    
    const endDate = new Date(endInput);
    const formattedEnd = `${endDate.getMonth() + 1}/${endDate.getDate()}`;
    
    logAction(currentStudent.id, 'Moved to Pirate Ship', 'Admin', oldValues, { ...currentStudent });
    
    // Store undo action
    undoAction = {
        type: 'moveToPirate',
        student: currentStudent,
        oldValues: oldValues
    };
    
    showUndoToast(`Set sail: ${currentStudent.full_name} enters Pirate Ship until ${formattedEnd}.`);
    
    saveToLocalStorage();
    render();
    closePirateModal();
}

// Release student from Pirate Ship
function confirmReleaseFromPirateShip() {
    if (!currentStudent) return;
    
    const oldValues = { ...currentStudent };
    
    currentStudent.status = 'Active';
    currentStudent.pirate_start = null;
    currentStudent.pirate_end = null;
    currentStudent.last_updated_by = 'Admin';
    currentStudent.last_updated_at = new Date().toISOString();
    
    logAction(currentStudent.id, 'Released from Pirate Ship', 'Admin', oldValues, { ...currentStudent });
    
    // Store undo action
    undoAction = {
        type: 'releaseFromPirate',
        student: currentStudent,
        oldValues: oldValues
    };
    
    showUndoToast(`Anchors up: ${currentStudent.full_name} returns to Active.`);
    
    saveToLocalStorage();
    render();
    closeReleaseModal();
}

// Undo action
function undoLastAction() {
    if (!undoAction) return;
    
    if (undoAction.type === 'moveToPirate' || undoAction.type === 'releaseFromPirate') {
        Object.assign(undoAction.student, undoAction.oldValues);
        logAction(undoAction.student.id, 'Undo Action', 'Admin', null, { ...undoAction.student });
    }
    
    saveToLocalStorage();
    render();
    hideUndoToast();
}

// Show/hide undo toast
function showUndoToast(message) {
    const toast = document.getElementById('undoToast');
    const messageEl = document.getElementById('undoMessage');
    
    messageEl.textContent = message;
    toast.classList.remove('hidden');
    
    // Clear existing timer
    if (undoTimer) clearTimeout(undoTimer);
    
    // Auto-hide after 10 seconds
    undoTimer = setTimeout(() => {
        hideUndoToast();
    }, 10000);
}

function hideUndoToast() {
    document.getElementById('undoToast').classList.add('hidden');
    undoAction = null;
    if (undoTimer) {
        clearTimeout(undoTimer);
        undoTimer = null;
    }
}

// Student drawer
function openStudentDrawer(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    currentStudent = student;
    
    const drawer = document.getElementById('detailDrawer');
    document.getElementById('drawerStudentName').textContent = student.full_name;
    document.getElementById('drawerStatus').textContent = student.status === 'Active' ? '⚓ Active' : '🏴‍☠️ Pirate Ship';
    document.getElementById('drawerPirateStart').textContent = student.pirate_start ? new Date(student.pirate_start).toLocaleString() : '--';
    document.getElementById('drawerPirateEnd').textContent = student.pirate_end ? new Date(student.pirate_end).toLocaleString() : '--';
    
    const daysLeft = student.status === 'PirateShip' ? getDaysRemaining(student.pirate_end) : null;
    document.getElementById('drawerDaysLeft').textContent = daysLeft !== null ? `${daysLeft} days` : '--';
    
    document.getElementById('drawerNotes').value = student.notes || '';
    
    // Show/hide quick actions based on status
    document.getElementById('quickExtend7').style.display = student.status === 'PirateShip' ? 'block' : 'none';
    document.getElementById('quickRelease').style.display = student.status === 'PirateShip' ? 'block' : 'none';
    document.getElementById('quickCustomEnd').style.display = student.status === 'PirateShip' ? 'block' : 'none';
    
    // Render history
    const historyList = document.getElementById('historyList');
    const studentHistory = auditLog
        .filter(log => log.student_id === student.id)
        .slice(-5)
        .reverse();
    
    if (studentHistory.length > 0) {
        historyList.innerHTML = studentHistory.map(log => `
            <div class="history-item">
                <div><strong>${log.action}</strong> by ${log.actor}</div>
                <div class="timestamp">${new Date(log.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    } else {
        historyList.innerHTML = '<p style="color: #6b7280;">No history available</p>';
    }
    
    drawer.classList.remove('hidden');
}

function closeStudentDrawer() {
    document.getElementById('detailDrawer').classList.add('hidden');
    currentStudent = null;
}

function saveStudentNotes() {
    if (!currentStudent) return;
    
    const notes = document.getElementById('drawerNotes').value;
    const oldValues = { notes: currentStudent.notes };
    
    currentStudent.notes = notes;
    currentStudent.last_updated_by = 'Admin';
    currentStudent.last_updated_at = new Date().toISOString();
    
    logAction(currentStudent.id, 'Updated Notes', 'Admin', oldValues, { notes });
    saveToLocalStorage();
    render();
    
    alert('Notes saved successfully!');
}

function quickExtend7Days() {
    if (!currentStudent || currentStudent.status !== 'PirateShip') return;
    
    const oldValues = { pirate_end: currentStudent.pirate_end };
    const newEnd = new Date(new Date(currentStudent.pirate_end).getTime() + 7 * 24 * 60 * 60 * 1000);
    currentStudent.pirate_end = newEnd.toISOString();
    currentStudent.last_updated_by = 'Admin';
    currentStudent.last_updated_at = new Date().toISOString();
    
    logAction(currentStudent.id, 'Extended +7 days', 'Admin', oldValues, { pirate_end: currentStudent.pirate_end });
    saveToLocalStorage();
    render();
    openStudentDrawer(currentStudent.id);
    
    alert('Extended by 7 days!');
}

function quickRelease() {
    if (!currentStudent || currentStudent.status !== 'PirateShip') return;
    
    openReleaseModal(currentStudent);
    closeStudentDrawer();
}

function confirmCustomEndDate() {
    if (!currentStudent) return;
    
    const newEndInput = document.getElementById('customEndDate').value;
    const oldValues = { pirate_end: currentStudent.pirate_end };
    
    currentStudent.pirate_end = new Date(newEndInput).toISOString();
    currentStudent.last_updated_by = 'Admin';
    currentStudent.last_updated_at = new Date().toISOString();
    
    logAction(currentStudent.id, 'Custom End Date Set', 'Admin', oldValues, { pirate_end: currentStudent.pirate_end });
    saveToLocalStorage();
    render();
    closeCustomEndModal();
    openStudentDrawer(currentStudent.id);
    
    alert('Custom end date set!');
}

// Read-only tooltip
function showReadOnlyTooltip(x, y) {
    const tooltip = document.getElementById('readonlyTooltip');
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y + 10}px`;
    tooltip.classList.remove('hidden');
    
    setTimeout(() => {
        tooltip.classList.add('hidden');
    }, 2000);
}

// Bulk actions
function updateBulkActionButtons() {
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    const count = checkboxes.length;
    
    document.getElementById('bulkPirateShip').disabled = count === 0 || !isAdminMode;
    document.getElementById('bulkRelease').disabled = count === 0 || !isAdminMode;
    document.getElementById('bulkExtend7').disabled = count === 0 || !isAdminMode;
    document.getElementById('bulkExtend14').disabled = count === 0 || !isAdminMode;
}

function bulkMoveToPirateShip() {
    if (!isAdminMode) return;
    
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    const studentIds = Array.from(checkboxes).map(cb => cb.dataset.studentId);
    
    if (studentIds.length === 0) return;
    
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    if (!confirm(`Move ${studentIds.length} student(s) to Pirate Ship?`)) return;
    
    studentIds.forEach(id => {
        const student = students.find(s => s.id === id);
        if (student && student.status === 'Active') {
            const oldValues = { ...student };
            student.status = 'PirateShip';
            student.pirate_start = startDate.toISOString();
            student.pirate_end = endDate.toISOString();
            student.last_updated_by = 'Admin';
            student.last_updated_at = new Date().toISOString();
            logAction(student.id, 'Bulk Move to Pirate Ship', 'Admin', oldValues, { ...student });
        }
    });
    
    saveToLocalStorage();
    render();
    alert(`${studentIds.length} student(s) moved to Pirate Ship!`);
}

function bulkRelease() {
    if (!isAdminMode) return;
    
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    const studentIds = Array.from(checkboxes).map(cb => cb.dataset.studentId);
    
    if (studentIds.length === 0) return;
    
    if (!confirm(`Release ${studentIds.length} student(s) from Pirate Ship?`)) return;
    
    studentIds.forEach(id => {
        const student = students.find(s => s.id === id);
        if (student && student.status === 'PirateShip') {
            const oldValues = { ...student };
            student.status = 'Active';
            student.pirate_start = null;
            student.pirate_end = null;
            student.last_updated_by = 'Admin';
            student.last_updated_at = new Date().toISOString();
            logAction(student.id, 'Bulk Release', 'Admin', oldValues, { ...student });
        }
    });
    
    saveToLocalStorage();
    render();
    alert(`${studentIds.length} student(s) released!`);
}

function bulkExtend(days) {
    if (!isAdminMode) return;
    
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    const studentIds = Array.from(checkboxes).map(cb => cb.dataset.studentId);
    
    if (studentIds.length === 0) return;
    
    if (!confirm(`Extend ${studentIds.length} student(s) by ${days} days?`)) return;
    
    studentIds.forEach(id => {
        const student = students.find(s => s.id === id);
        if (student && student.status === 'PirateShip' && student.pirate_end) {
            const oldValues = { pirate_end: student.pirate_end };
            const newEnd = new Date(new Date(student.pirate_end).getTime() + days * 24 * 60 * 60 * 1000);
            student.pirate_end = newEnd.toISOString();
            student.last_updated_by = 'Admin';
            student.last_updated_at = new Date().toISOString();
            logAction(student.id, `Bulk Extend +${days} days`, 'Admin', oldValues, { pirate_end: student.pirate_end });
        }
    });
    
    saveToLocalStorage();
    render();
    alert(`${studentIds.length} student(s) extended by ${days} days!`);
}

// Add new student
function openAddStudentModal() {
    console.log('📝 Open Add Student Modal clicked, isAdminMode:', isAdminMode);
    if (!isAdminMode) {
        alert('Please enable Admin Mode to add students.');
        return;
    }
    const modal = document.getElementById('addStudentModal');
    document.getElementById('newStudentName').value = '';
    modal.classList.remove('hidden');
    console.log('✅ Modal opened');
}

function closeAddStudentModal() {
    document.getElementById('addStudentModal').classList.add('hidden');
}

function confirmAddStudent() {
    console.log('💾 Confirm Add Student clicked');
    const name = document.getElementById('newStudentName').value.trim();
    
    if (!name) {
        alert('Please enter a student name.');
        return;
    }
    console.log('Adding student:', name);
    
    const newStudent = {
        id: `student-${Date.now()}`,
        full_name: name,
        status: 'Active',
        pirate_start: null,
        pirate_end: null,
        notes: '',
        last_updated_by: 'Admin',
        last_updated_at: new Date().toISOString()
    };
    
    students.push(newStudent);
    logAction(newStudent.id, 'Student Added', 'Admin', null, newStudent);
    saveToLocalStorage();
    closeAddStudentModal();
    render();
    
    // Show confirmation message briefly
    showUndoToast(`${name} has been added successfully!`);
    setTimeout(() => {
        hideUndoToast();
    }, 3000);
}

// Delete student
function deleteStudent() {
    if (!currentStudent) return;
    
    if (!isAdminMode) {
        alert('Please enable Admin Mode to delete students.');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${currentStudent.full_name}? This action cannot be undone.`)) {
        return;
    }
    
    const studentName = currentStudent.full_name;
    const studentId = currentStudent.id;
    
    logAction(studentId, 'Student Deleted', 'Admin', { ...currentStudent }, null);
    
    students = students.filter(s => s.id !== studentId);
    saveToLocalStorage();
    closeStudentDrawer();
    render();
    
    // Show confirmation
    showUndoToast(`${studentName} has been deleted.`);
    setTimeout(() => {
        hideUndoToast();
    }, 3000);
}

// Export CSV
function exportCSV() {
    const filteredStudents = getFilteredStudents();
    
    let csv = 'Name,Status,Pirate Start,Pirate End,Days Left,Notes\n';
    
    filteredStudents.forEach(student => {
        const daysLeft = student.status === 'PirateShip' ? getDaysRemaining(student.pirate_end) : '';
        const pirateStart = student.pirate_start ? new Date(student.pirate_start).toLocaleDateString() : '';
        const pirateEnd = student.pirate_end ? new Date(student.pirate_end).toLocaleDateString() : '';
        const notes = (student.notes || '').replace(/"/g, '""');
        
        csv += `"${student.full_name}","${student.status}","${pirateStart}","${pirateEnd}","${daysLeft}","${notes}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alpha-fleet-board-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Utility functions
function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 App initializing...');
    
    try {
        // Load data
        await loadFromLocalStorage();
        console.log('✅ Data loaded, students:', students.length);
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
    
    // Set admin mode active on load
    const adminToggle = document.getElementById('adminToggle');
    if (adminToggle) {
        adminToggle.classList.add('active');
        adminToggle.textContent = '🔓 Admin Mode';
        console.log('✅ Admin mode enabled by default');
        
        // Admin toggle
        adminToggle.addEventListener('click', (e) => {
            isAdminMode = !isAdminMode;
            e.target.classList.toggle('active');
            e.target.textContent = isAdminMode ? '🔓 Admin Mode' : 'Admin Mode';
            render();
        });
    } else {
        console.error('❌ Admin toggle button not found!');
    }
    
    // View tabs
    document.getElementById('boardViewBtn').addEventListener('click', () => {
        document.getElementById('boardView').style.display = 'block';
        document.getElementById('tableView').style.display = 'none';
        document.getElementById('boardViewBtn').classList.add('active');
        document.getElementById('tableViewBtn').classList.remove('active');
        render();
    });
    
    document.getElementById('tableViewBtn').addEventListener('click', () => {
        document.getElementById('boardView').style.display = 'none';
        document.getElementById('tableView').style.display = 'block';
        document.getElementById('boardViewBtn').classList.remove('active');
        document.getElementById('tableViewBtn').classList.add('active');
        render();
    });
    
    // Filters
    document.getElementById('searchInput').addEventListener('input', render);
    document.getElementById('statusFilter').addEventListener('change', render);
    document.getElementById('urgentFilter').addEventListener('change', render);
    
    // Add student
    const addStudentBtn = document.getElementById('addStudentBtn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', openAddStudentModal);
        console.log('✅ Add Student button listener attached');
    } else {
        console.error('❌ Add Student button not found!');
    }
    
    const confirmAddBtn = document.getElementById('confirmAddStudent');
    if (confirmAddBtn) {
        confirmAddBtn.addEventListener('click', confirmAddStudent);
    }
    
    const cancelAddBtn = document.getElementById('cancelAddStudent');
    if (cancelAddBtn) {
        cancelAddBtn.addEventListener('click', closeAddStudentModal);
    }
    
    const addModalOverlay = document.querySelector('#addStudentModal .modal-overlay');
    if (addModalOverlay) {
        addModalOverlay.addEventListener('click', closeAddStudentModal);
    }
    
    // Allow Enter key to submit add student form
    const newStudentNameInput = document.getElementById('newStudentName');
    if (newStudentNameInput) {
        newStudentNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmAddStudent();
            }
        });
    }
    
    // Export CSV
    document.getElementById('exportCsv').addEventListener('click', exportCSV);
    
    // Drag and drop on columns
    const columns = document.querySelectorAll('.column-content');
    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });
    
    // Pirate modal
    document.getElementById('confirmPirate').addEventListener('click', confirmMoveToPirateShip);
    document.getElementById('cancelPirate').addEventListener('click', closePirateModal);
    document.querySelector('#pirateModal .modal-overlay').addEventListener('click', closePirateModal);
    
    // Release modal
    document.getElementById('confirmRelease').addEventListener('click', confirmReleaseFromPirateShip);
    document.getElementById('cancelRelease').addEventListener('click', closeReleaseModal);
    document.querySelector('#releaseModal .modal-overlay').addEventListener('click', closeReleaseModal);
    
    // Custom end modal
    document.getElementById('confirmCustomEnd').addEventListener('click', confirmCustomEndDate);
    document.getElementById('cancelCustomEnd').addEventListener('click', closeCustomEndModal);
    document.querySelector('#customEndModal .modal-overlay').addEventListener('click', closeCustomEndModal);
    
    // Undo toast
    document.getElementById('undoBtn').addEventListener('click', undoLastAction);
    
    // Student drawer
    document.getElementById('closeDrawer').addEventListener('click', closeStudentDrawer);
    document.querySelector('#detailDrawer .drawer-overlay').addEventListener('click', closeStudentDrawer);
    document.getElementById('saveNotes').addEventListener('click', saveStudentNotes);
    document.getElementById('quickExtend7').addEventListener('click', quickExtend7Days);
    document.getElementById('quickRelease').addEventListener('click', quickRelease);
    document.getElementById('quickCustomEnd').addEventListener('click', () => {
        openCustomEndModal();
    });
    document.getElementById('deleteStudent').addEventListener('click', deleteStudent);
    
    // Bulk actions
    document.getElementById('selectAll').addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.student-checkbox');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
        updateBulkActionButtons();
    });
    
    document.getElementById('bulkPirateShip').addEventListener('click', bulkMoveToPirateShip);
    document.getElementById('bulkRelease').addEventListener('click', bulkRelease);
    document.getElementById('bulkExtend7').addEventListener('click', () => bulkExtend(7));
    document.getElementById('bulkExtend14').addEventListener('click', () => bulkExtend(14));
    
    // Delegate checkbox change events
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('student-checkbox')) {
            updateBulkActionButtons();
        }
    });
    
    // Initial render
    console.log('🎨 Starting initial render...');
    render();
    
    // Schedule auto-release
    scheduleAutoRelease();
    
    console.log('✅ App fully initialized and ready!');
});

