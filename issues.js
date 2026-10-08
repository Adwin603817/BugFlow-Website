// The three localStorage keys the whole group uses
var ISSUES_KEY   = 'bugtracker_issues';
var PEOPLE_KEY   = 'bugtracker_people';
var PROJECTS_KEY = 'bugtracker_projects';

function loadData(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function makeId() {
  return 'ISS-' + Date.now();
}

// Seed demo data so the page works on its own
function seedDemo() {
  if (loadData(PEOPLE_KEY).length === 0) {
    saveData(PEOPLE_KEY, [
      { id: 'P1', name: 'Lebo',   surname: 'Dlamini', email: 'lebo@mail.com',    username: 'ldlamini'  },
      { id: 'P2', name: 'Sipho',  surname: 'Nkosi',   email: 'sipho@mail.com',   username: 'snkosi'    },
      { id: 'P3', name: 'Ayasha', surname: 'Patel',   email: 'ayasha@mail.com',  username: 'apatel'    },
      { id: 'P4', name: 'Marco',  surname: 'Ferreira',email: 'marco@mail.com',   username: 'mferreira' }
    ]);
  }
  if (loadData(PROJECTS_KEY).length === 0) {
    saveData(PROJECTS_KEY, [
      { id: 'PR1', name: 'Website Redesign' },
      { id: 'PR2', name: 'Mobile App'       },
      { id: 'PR3', name: 'Admin Panel'      }
    ]);
  }
}

function fillPeople(selectId, selectedId) {
  var sel = document.getElementById(selectId);
  var firstOption = sel.options[0].outerHTML;
  sel.innerHTML = firstOption;
  loadData(PEOPLE_KEY).forEach(function(p) {
    var opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name + ' ' + p.surname;
    if (p.id === selectedId) opt.selected = true;
    sel.appendChild(opt);
  });
}

function fillProjects(selectId, selectedId) {
  var sel = document.getElementById(selectId);
  sel.innerHTML = '<option value="">-- Select project --</option>';
  loadData(PROJECTS_KEY).forEach(function(pr) {
    var opt = document.createElement('option');
    opt.value = pr.id;
    opt.textContent = pr.name;
    if (pr.id === selectedId) opt.selected = true;
    sel.appendChild(opt);
  });
}

function showMessage(text, isError) {
  var box = document.getElementById('message');
  box.textContent = text;
  box.className = isError ? 'msg-error' : 'msg-success';
  box.style.display = 'block';
  setTimeout(function() { box.style.display = 'none'; }, 3000);
}

function renderTable() {
  var issues = loadData(ISSUES_KEY);
  var tbody  = document.getElementById('issue-table-body');
  var noMsg  = document.getElementById('no-issues');
  tbody.innerHTML = '';

  if (issues.length === 0) {
    noMsg.style.display = 'block';
    return;
  }
  noMsg.style.display = 'none';

  issues.slice().reverse().forEach(function(issue) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td style="color:#8b949e; font-size:11px;">' + issue.id + '</td>' +
      '<td>' + issue.summary + '</td>' +
      '<td><span class="badge-' + issue.status   + '">' + issue.status   + '</span></td>' +
      '<td><span class="badge-' + issue.priority + '">' + issue.priority + '</span></td>' +
      '<td style="color:#8b949e; font-size:12px;">' + (issue.dateIdentified || '-') + '</td>' +
      '<td><button class="btn-gold" style="padding: 4px 10px; font-size:12px;" onclick="openEdit(\'' + issue.id + '\')">Edit</button></td>';
    tbody.appendChild(tr);
  });
}

function createIssue() {
  var summary      = document.getElementById('c-summary').value.trim();
  var description  = document.getElementById('c-description').value.trim();
  var identifiedBy = document.getElementById('c-identified-by').value;
  var dateId       = document.getElementById('c-date').value;
  var project      = document.getElementById('c-project').value;
  var priority     = document.getElementById('c-priority').value;

  if (!summary || !description || !identifiedBy || !dateId || !project || !priority) {
    showMessage('Please fill in all required fields.', true);
    return;
  }

  var newIssue = {
    id:                makeId(),
    summary:           summary,
    description:       description,
    identifiedBy:      identifiedBy,
    dateIdentified:    dateId,
    projectId:         project,
    assignedTo:        document.getElementById('c-assigned').value || null,
    status:            document.getElementById('c-status').value,
    priority:          priority,
    targetDate:        document.getElementById('c-target').value || null,
    actualDate:        document.getElementById('c-actual').value || null,
    resolutionSummary: document.getElementById('c-resolution').value || null
  };

  var issues = loadData(ISSUES_KEY);
  issues.push(newIssue);
  saveData(ISSUES_KEY, issues);

  showMessage('Ticket created successfully!', false);
  clearCreateForm();
  renderTable();
}

function clearCreateForm() {
  document.getElementById('c-summary').value        = '';
  document.getElementById('c-description').value    = '';
  document.getElementById('c-identified-by').value  = '';
  document.getElementById('c-date').value           = new Date().toISOString().split('T')[0];
  document.getElementById('c-project').value        = '';
  document.getElementById('c-assigned').value       = '';
  document.getElementById('c-status').value         = 'open';
  document.getElementById('c-priority').value       = '';
  document.getElementById('c-target').value         = '';
  document.getElementById('c-actual').value         = '';
  document.getElementById('c-resolution').value     = '';
}

function openEdit(issueId) {
  var issues = loadData(ISSUES_KEY);
  var issue  = issues.find(function(i) { return i.id === issueId; });
  if (!issue) return;

  document.getElementById('edit-id-label').textContent  = issueId;
  document.getElementById('e-summary').value            = issue.summary;
  document.getElementById('e-description').value        = issue.description;
  document.getElementById('e-date').value               = issue.dateIdentified || '';
  document.getElementById('e-status').value             = issue.status;
  document.getElementById('e-priority').value           = issue.priority;
  document.getElementById('e-target').value             = issue.targetDate || '';
  document.getElementById('e-actual').value             = issue.actualDate || '';
  document.getElementById('e-resolution').value         = issue.resolutionSummary || '';

  fillPeople('e-identified-by', issue.identifiedBy);
  fillPeople('e-assigned',      issue.assignedTo);
  fillProjects('e-project',     issue.projectId);

  document.getElementById('edit-section').style.display = 'block';
  document.getElementById('edit-section').scrollIntoView({ behavior: 'smooth' });
}

function saveEdit() {
  var issueId     = document.getElementById('edit-id-label').textContent;
  var summary     = document.getElementById('e-summary').value.trim();
  var description = document.getElementById('e-description').value.trim();
  var identifiedBy= document.getElementById('e-identified-by').value;
  var dateId      = document.getElementById('e-date').value;
  var project     = document.getElementById('e-project').value;
  var priority    = document.getElementById('e-priority').value;

  if (!summary || !description || !identifiedBy || !dateId || !project || !priority) {
    showMessage('Please fill in all required fields.', true);
    return;
  }

  var issues = loadData(ISSUES_KEY);
  var index  = issues.findIndex(function(i) { return i.id === issueId; });
  if (index === -1) return;

  issues[index].summary           = summary;
  issues[index].description       = description;
  issues[index].identifiedBy      = identifiedBy;
  issues[index].dateIdentified    = dateId;
  issues[index].projectId         = project;
  issues[index].assignedTo        = document.getElementById('e-assigned').value || null;
  issues[index].status            = document.getElementById('e-status').value;
  issues[index].priority          = priority;
  issues[index].targetDate        = document.getElementById('e-target').value || null;
  issues[index].actualDate        = document.getElementById('e-actual').value || null;
  issues[index].resolutionSummary = document.getElementById('e-resolution').value || null;

  saveData(ISSUES_KEY, issues);
  showMessage('Ticket updated successfully!', false);
  closeEdit();
  renderTable();
}

function closeEdit() {
  document.getElementById('edit-section').style.display = 'none';
}

// ==========================================
// NEW DELETE LOGIC ADDED HERE
// ==========================================
function deleteIssue() {
  var issueId = document.getElementById('edit-id-label').textContent;
  if (confirm("Are you sure you want to permanently delete ticket " + issueId + "?")) {
    var issues = loadData(ISSUES_KEY);
    var updatedIssues = issues.filter(function(i) { return i.id !== issueId; });
    saveData(ISSUES_KEY, updatedIssues);
    
    showMessage('Ticket deleted successfully!', false);
    closeEdit();
    renderTable();
  }
}

// Start up functions (These will populate the dropdowns instantly)
seedDemo();
fillPeople('c-identified-by', '');
fillPeople('c-assigned', '');
fillProjects('c-project', '');
renderTable();
document.getElementById('c-date').value = new Date().toISOString().split('T')[0];

// ==========================================
// MEMBER 4'S INTERCEPTOR LOGIC
// ==========================================
function validateWorkflowLogic(issue) {
  return issue;
}

function processAssignment(issue) {
  if (!issue.assignedTo || issue.assignedTo === "") {
    issue.assignedTo = null;
  }
  if (issue.assignedTo && issue.status === 'overdue') {
    issue.priority = 'high';
  }
  return issue;
}

const originalCreateIssue = createIssue;
createIssue = function() {
  originalCreateIssue();
  
  let issues = loadData(ISSUES_KEY);
  if (issues.length > 0) {
    let latestIssue = issues[issues.length - 1];
    
    latestIssue = validateWorkflowLogic(latestIssue);
    latestIssue = processAssignment(latestIssue);
    
    saveData(ISSUES_KEY, issues);
    renderTable();
  }
};

const originalSaveEdit = saveEdit;
saveEdit = function() {
  originalSaveEdit();
  
  let issues = loadData(ISSUES_KEY);
  let issueId = document.getElementById('edit-id-label').textContent;
  let index = issues.findIndex(i => i.id === issueId);
  
  if (index !== -1) {
    issues[index] = validateWorkflowLogic(issues[index]);
    issues[index] = processAssignment(issues[index]);
    
    saveData(ISSUES_KEY, issues);
    renderTable();
  }
};