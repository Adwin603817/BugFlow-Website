// ==========================================
// 1. UI, THEME & SEED LOGIC
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Ensure the database has the dropdown options so the system doesn't crash
    seedDemoDataIfNeeded();

    // 2. Dark Mode Setup
    const darkBtn = document.getElementById("darkBtn");
    const body = document.body;

    if (localStorage.getItem("darkMode") === "disabled") {
        body.classList.remove("dark-mode");
    } else {
        body.classList.add("dark-mode"); 
    }

    if (darkBtn) {
        darkBtn.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            if (body.classList.contains("dark-mode")) {
                localStorage.setItem("darkMode", "enabled");
            } else {
                localStorage.setItem("darkMode", "disabled");
            }
        });
    }

    // 3. Exit button setup
    // This sends the user back to the welcome page, just like the other pages.
    const dashboardExitBtn = document.getElementById("dashboardExitBtn");
    if (dashboardExitBtn) {
        dashboardExitBtn.addEventListener("click", () => {
            window.location.href = "welcome.html";
        });
    }

    // 4. Draw the initial Kanban board
    renderKanbanBoard();
});

function seedDemoDataIfNeeded() {
    var people = JSON.parse(localStorage.getItem('bugtracker_people') || '[]');
    if (people.length === 0) {
        localStorage.setItem('bugtracker_people', JSON.stringify([
          { id: 'P1', name: 'Lebo', surname: 'Dlamini' },
          { id: 'P2', name: 'Sipho', surname: 'Nkosi' },
          { id: 'P3', name: 'Ayasha', surname: 'Patel' },
          { id: 'P4', name: 'Marco', surname: 'Ferreira' }
        ]));
    }
    var projects = JSON.parse(localStorage.getItem('bugtracker_projects') || '[]');
    if (projects.length === 0) {
        localStorage.setItem('bugtracker_projects', JSON.stringify([
          { id: 'PR1', name: 'Website Redesign' },
          { id: 'PR2', name: 'Mobile App' },
          { id: 'PR3', name: 'Admin Panel' }
        ]));
    }
}

// ==========================================
// 2. SEARCH & FILTER LOGIC
// ==========================================

// Real-Time Search Bar
var searchBox = document.getElementById('searchBox');
if (searchBox) {
    searchBox.addEventListener('keyup', function() {
        let filter = this.value.toLowerCase();
        let cards = document.querySelectorAll('.col-container .task-card');
        let hasResults = false;

        cards.forEach(card => {
            let text = card.innerText.toLowerCase();
            if (text.includes(filter)) {
                card.style.display = "";
                hasResults = true;
            } else {
                card.style.display = "none";
            }
        });

        let noResultsMsg = document.getElementById('noResultsMessage');
        if (noResultsMsg) {
            noResultsMsg.classList.toggle('d-none', hasResults || filter === "");
        }
    });
}

// Priority Filter Pills
const filterButtons = document.querySelectorAll('.filter-pill');
filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        let filterValue = this.innerText.toLowerCase(); 
        let cards = document.querySelectorAll('.col-container .task-card');

        cards.forEach(card => {
            if (filterValue === 'all') {
                card.style.display = 'block'; 
            } else {
                if (card.querySelector('.badge-' + filterValue)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
});

// Trigger a re-render when the Sort Dropdown is changed
const sortSelect = document.getElementById('sortSelect');
if (sortSelect) {
    sortSelect.addEventListener('change', renderKanbanBoard);
}


// ==========================================
// 3. RENDERING & SORTING THE KANBAN BOARD
// ==========================================
function getPersonName(id) {
    if (!id) return "Unassigned";
    let people = JSON.parse(localStorage.getItem('bugtracker_people') || '[]');
    let person = people.find(p => p.id === id);
    return person ? person.name + " " + person.surname : "Unassigned";
}

function getProjectName(id) {
    let projects = JSON.parse(localStorage.getItem('bugtracker_projects') || '[]');
    let project = projects.find(p => p.id === id);
    return project ? project.name : "Unknown Project";
}

function renderKanbanBoard() {
    var issues = JSON.parse(localStorage.getItem('bugtracker_issues') || '[]');
    
    // Member 4 Integration: Dynamic Sorting Algorithm
    var sortDropdown = document.getElementById('sortSelect');
    var sortMethod = sortDropdown ? sortDropdown.value : 'date';
    
    issues.sort(function(a, b) {
        if (sortMethod === 'priority') {
            var pVals = { 'high': 3, 'medium': 2, 'low': 1 };
            return (pVals[b.priority] || 0) - (pVals[a.priority] || 0); // High to Low
        } else {
            return new Date(b.dateIdentified || 0) - new Date(a.dateIdentified || 0); // Newest First
        }
    });
    
    var openCol = document.getElementById('column-open');
    var resolvedCol = document.getElementById('column-resolved');
    var overdueCol = document.getElementById('column-overdue');

    if(openCol) openCol.innerHTML = '';
    if(resolvedCol) resolvedCol.innerHTML = '';
    if(overdueCol) overdueCol.innerHTML = '';

    var openCount = 0, resolvedCount = 0, overdueCount = 0;

    issues.forEach(function(issue) {
        var priorityColor = issue.priority || "low";
        
        // Fetch the assigned person's name for the profile picture
        var assignedName = getPersonName(issue.assignedTo);
        var avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(assignedName)}&background=d4af37&color=121212&rounded=true&bold=true`;

        var cardHTML = `
        <div class="card task-card mb-3 shadow-sm" style="display:block;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="my-badge badge-${priorityColor} text-capitalize">${issue.priority}</span>
              </div>
              <span class="text-muted small fw-bold">${issue.id}</span>
            </div>
            
            <h6 class="fw-semibold mt-3 mb-1">${issue.summary}</h6>
            <p class="text-muted small mb-3">Project: ${getProjectName(issue.projectId)}</p>
            
            <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
              <div class="d-flex align-items-center">
                <img src="${avatarUrl}" alt="${assignedName}" width="28" height="28" class="rounded-circle me-2 border border-secondary">
                <small class="text-muted"><strong>${assignedName}</strong></small>
              </div>
              <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold shadow-sm" onclick="openEdit('${issue.id}')">View Details</button>
            </div>
          </div>
        </div>`;

        if (issue.status === 'open' && openCol) {
            openCol.innerHTML += cardHTML;
            openCount++;
        } else if (issue.status === 'resolved' && resolvedCol) {
            resolvedCol.innerHTML += cardHTML;
            resolvedCount++;
        } else if (issue.status === 'overdue' && overdueCol) {
            overdueCol.innerHTML += cardHTML;
            overdueCount++;
        }
    });

    // Update Kanban Counters
    var cOpen = document.getElementById('count-open');
    var cRes = document.getElementById('count-resolved');
    var cOver = document.getElementById('count-overdue');
    var cTotal = document.getElementById('stat-total');
    
    if(cOpen) cOpen.textContent = openCount;
    if(cRes) cRes.textContent = resolvedCount;
    if(cOver) cOver.textContent = overdueCount;
    if(cTotal) cTotal.textContent = issues.length;

    // Show Empty States if columns have no cards
    if(openCount === 0 && openCol) openCol.innerHTML = `<div class="empty-state text-center opacity-50 p-4"><h6 class="fw-bold text-muted">No open issues</h6></div>`;
    if(resolvedCount === 0 && resolvedCol) resolvedCol.innerHTML = `<div class="empty-state text-center opacity-50 p-4"><h1 class="mb-2">🎉</h1><h6 class="fw-bold text-muted">No issues here</h6></div>`;
    if(overdueCount === 0 && overdueCol) overdueCol.innerHTML = `<div class="empty-state text-center opacity-50 p-4"><h1 class="mb-2">✅</h1><h6 class="fw-bold text-muted">Looking good!</h6></div>`;
}

// ==========================================
// 4. THE FULL EDIT MODAL LOGIC (Member 3's Form integration)
// ==========================================
function populateDropdowns(personId, projectId, assignedId) {
    var people = JSON.parse(localStorage.getItem('bugtracker_people') || '[]');
    var projects = JSON.parse(localStorage.getItem('bugtracker_projects') || '[]');
    
    var idBySel = document.getElementById('e-identified-by');
    if (idBySel) {
        idBySel.innerHTML = '<option value="">-- Select person --</option>';
        people.forEach(p => { idBySel.innerHTML += `<option value="${p.id}" ${p.id === personId ? 'selected' : ''}>${p.name} ${p.surname}</option>`; });
    }
    
    var assignSel = document.getElementById('e-assigned');
    if (assignSel) {
        assignSel.innerHTML = '<option value="">-- Unassigned --</option>';
        people.forEach(p => { assignSel.innerHTML += `<option value="${p.id}" ${p.id === assignedId ? 'selected' : ''}>${p.name} ${p.surname}</option>`; });
    }
    
    var projSel = document.getElementById('e-project');
    if (projSel) {
        projSel.innerHTML = '<option value="">-- Select project --</option>';
        projects.forEach(pr => { projSel.innerHTML += `<option value="${pr.id}" ${pr.id === projectId ? 'selected' : ''}>${pr.name}</option>`; });
    }
}

function openEdit(issueId) {
    var issues = JSON.parse(localStorage.getItem('bugtracker_issues') || '[]');
    var issue = issues.find(i => i.id === issueId);
    if (!issue) {
        alert("Error loading ticket. It may have been deleted.");
        return;
    }

    // Safely populate all the input fields in the modal
    if(document.getElementById('edit-id-label')) document.getElementById('edit-id-label').textContent = issueId;
    if(document.getElementById('e-summary')) document.getElementById('e-summary').value = issue.summary || "";
    if(document.getElementById('e-description')) document.getElementById('e-description').value = issue.description || "";
    if(document.getElementById('e-date')) document.getElementById('e-date').value = issue.dateIdentified || "";
    if(document.getElementById('e-status')) document.getElementById('e-status').value = issue.status || "open";
    if(document.getElementById('e-priority')) document.getElementById('e-priority').value = issue.priority || "low";
    if(document.getElementById('e-target')) document.getElementById('e-target').value = issue.targetDate || "";
    if(document.getElementById('e-actual')) document.getElementById('e-actual').value = issue.actualDate || "";
    if(document.getElementById('e-resolution')) document.getElementById('e-resolution').value = issue.resolutionSummary || "";

    populateDropdowns(issue.identifiedBy, issue.projectId, issue.assignedTo);

    // Open the Bootstrap Modal safely
    const modalElement = document.getElementById('viewIssueModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
        const viewModal = bootstrap.Modal.getOrCreateInstance(modalElement);
        viewModal.show();
    } else {
        alert("System Error: Modal HTML missing or Bootstrap not loaded.");
    }
}

function saveEdit() {
    var issueIdLabel = document.getElementById('edit-id-label');
    if (!issueIdLabel) return;
    
    var issueId = issueIdLabel.textContent;
    var issues = JSON.parse(localStorage.getItem('bugtracker_issues') || '[]');
    var index = issues.findIndex(i => i.id === issueId);
    
    if (index === -1) return;

    let updatedIssue = issues[index];
    
    // Gather all updated data from the modal
    updatedIssue.summary = document.getElementById('e-summary') ? document.getElementById('e-summary').value.trim() : updatedIssue.summary;
    updatedIssue.description = document.getElementById('e-description') ? document.getElementById('e-description').value.trim() : updatedIssue.description;
    updatedIssue.identifiedBy = document.getElementById('e-identified-by') ? document.getElementById('e-identified-by').value : updatedIssue.identifiedBy;
    updatedIssue.dateIdentified = document.getElementById('e-date') ? document.getElementById('e-date').value : updatedIssue.dateIdentified;
    updatedIssue.projectId = document.getElementById('e-project') ? document.getElementById('e-project').value : updatedIssue.projectId;
    updatedIssue.assignedTo = document.getElementById('e-assigned') ? (document.getElementById('e-assigned').value || null) : updatedIssue.assignedTo;
    updatedIssue.status = document.getElementById('e-status') ? document.getElementById('e-status').value : updatedIssue.status;
    updatedIssue.priority = document.getElementById('e-priority') ? document.getElementById('e-priority').value : updatedIssue.priority;
    updatedIssue.targetDate = document.getElementById('e-target') ? (document.getElementById('e-target').value || null) : updatedIssue.targetDate;
    updatedIssue.actualDate = document.getElementById('e-actual') ? (document.getElementById('e-actual').value || null) : updatedIssue.actualDate;
    updatedIssue.resolutionSummary = document.getElementById('e-resolution') ? (document.getElementById('e-resolution').value || null) : updatedIssue.resolutionSummary;
    // Keep the status selected by the user in the modal.
    // The board columns already separate Open, Resolved and Overdue tickets.
    
    // Auto-High Priority for Overdue assigned tasks
    if (updatedIssue.assignedTo && updatedIssue.status === 'overdue') {
        updatedIssue.priority = 'high';
    }

    // Save back to local storage
    issues[index] = updatedIssue;
    localStorage.setItem('bugtracker_issues', JSON.stringify(issues));

    // Close the modal and refresh the board so cards move instantly
    closeEdit();
    renderKanbanBoard();
}

function closeEdit() {
    var modalElement = document.getElementById('viewIssueModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
        var viewModal = bootstrap.Modal.getInstance(modalElement);
        if (viewModal) {
            viewModal.hide();
        }
    }
}

function deleteIssue() {
    var issueIdLabel = document.getElementById('edit-id-label');
    if (!issueIdLabel) return;
    
    var issueId = issueIdLabel.textContent;
    if (confirm("Are you sure you want to permanently delete ticket " + issueId + " from the Kanban board?")) {
        var issues = JSON.parse(localStorage.getItem('bugtracker_issues') || '[]');
        var updatedIssues = issues.filter(i => i.id !== issueId);
        localStorage.setItem('bugtracker_issues', JSON.stringify(updatedIssues));
        
        closeEdit();
        renderKanbanBoard();
    }
}
