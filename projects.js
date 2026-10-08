(function () {
   // ----- DOM elements -----
  const themeToggle = document.getElementById("themeToggle");
  const goDashboardBtn = document.getElementById("goDashboardBtn");
  const exitSystemBtn = document.getElementById("exitSystemBtn");

  const showProjectFormBtn = document.getElementById("showProjectFormBtn");
  const projectForm = document.getElementById("projectForm");
  const cancelProjectBtn = document.getElementById("cancelProjectBtn");
  const projectNameInput = document.getElementById("projectName");
  const projectCodeInput = document.getElementById("projectCode");
  const projectDescriptionInput = document.getElementById("projectDescription");
  const projectMessage = document.getElementById("projectMessage");

  const projectsList = document.getElementById("projectsList");
  const totalProjects = document.getElementById("totalProjects");
  const emptyState = document.getElementById("emptyState");
  const clearProjectsBtn = document.getElementById("clearProjectsBtn");

  // ----- Storage keys -----
  const PROJECTS_KEY = "bugtracker_projects";
  const THEME_KEY = "bugflowTheme";

  const OLD_PROJECT_KEYS = [
    "bugflowProjects",
    "BugFlowProjects",
    "projects",
    "Projects",
    "savedProjects",
    "SavedProjects",
    "bugflow_saved_projects",
    "bugflowProjectList",
    "projectList"
  ];

  // ----- Theme -----
  function applyTheme(theme) {
    document.body.classList.remove("light", "dark");

    if (theme === "light") {
      document.body.classList.add("light");
      themeToggle.textContent = "☀️ Dark Mode";
    } else {
      document.body.classList.add("dark");
      themeToggle.textContent = "🌙 Light Mode";
    }

    localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    applyTheme(savedTheme === "light" ? "light" : "dark");
  }

  // ----- Storage helpers -----
  function safeParse(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  function loadProjects() {
    const projects = safeParse(localStorage.getItem(PROJECTS_KEY));
    return Array.isArray(projects) ? projects : [];
  }

  function saveProjects(projects) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }

  function createProjectId() {
    // Simple unique ID using current time. Easy for a junior dev to understand.
    return "PRJ" + Date.now();
  }

  function normalizeProject(project) {
    if (!project || typeof project !== "object") return null;

    const name = project.name || project.projectName || project.title || "";
    const id = project.id || project.projectId || project.projectID || "";

    if (!name && !id) return null;

    return {
      id: String(id || createProjectId()),
      name: String(name || "Untitled Project"),
      code: project.code || project.projectCode || "",
      description: project.description || project.projectDescription || "",
      createdAt: project.createdAt || project.dateCreated || project.created || new Date().toISOString()
    };
  }

  function importOldProjectsIfNeeded() {
    const currentProjects = loadProjects();

    // Do not overwrite real projects if they already exist.
    if (currentProjects.length > 0) return;

    for (const key of OLD_PROJECT_KEYS) {
      const oldData = safeParse(localStorage.getItem(key));
      if (!Array.isArray(oldData)) continue;

      const convertedProjects = oldData.map(normalizeProject).filter(Boolean);
      if (convertedProjects.length > 0) {
        saveProjects(convertedProjects);
        return;
      }
    }
  }

  // ----- Page actions -----
  function showMessage(text, type) {
    projectMessage.textContent = text;
    projectMessage.className = "project-message " + type;
  }

  function clearMessage() {
    projectMessage.textContent = "";
    projectMessage.className = "project-message";
  }

  function openProjectForm() {
    projectForm.hidden = false;
    showProjectFormBtn.hidden = true;
    clearMessage();
    projectNameInput.focus();
  }

  function closeProjectForm() {
    projectForm.reset();
    projectForm.hidden = true;
    showProjectFormBtn.hidden = false;
    clearMessage();
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
  }

  function addProject(event) {
    event.preventDefault();

    const name = projectNameInput.value.trim();
    const code = projectCodeInput.value.trim();
    const description = projectDescriptionInput.value.trim();

    if (!name) {
      showMessage("Please enter the project name.", "error");
      return;
    }

    const projects = loadProjects();

    const projectExists = projects.some(function (project) {
      return project.name.toLowerCase() === name.toLowerCase();
    });

    if (projectExists) {
      showMessage("A project with this name already exists.", "error");
      return;
    }

    const newProject = {
      id: createProjectId(),
      name: name,
      code: code,
      description: description,
      createdAt: new Date().toISOString()
    };

    projects.push(newProject);
    saveProjects(projects);

    showMessage("Project saved successfully.", "success");
    projectForm.reset();
    showProjectFormBtn.hidden = false;
    projectForm.hidden = true;
    renderProjects();
  }

  function renderProjects() {
    const projects = loadProjects();

    totalProjects.textContent = "Total Projects: " + projects.length;
    projectsList.innerHTML = "";

    if (projects.length === 0) {
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    // Newest projects show first.
    const sortedProjects = projects.slice().sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    sortedProjects.forEach(function (project) {
      const card = document.createElement("div");
      card.className = "project-card";

      const title = document.createElement("p");
      title.className = "project-title";
      title.textContent = project.name;

      const description = document.createElement("p");
      description.className = "project-description";
      description.textContent = project.description || "No description added.";

      const meta = document.createElement("div");
      meta.className = "project-meta";

      const idSpan = document.createElement("span");
      idSpan.textContent = "ID: " + project.id;

      const codeSpan = document.createElement("span");
      codeSpan.textContent = "Code: " + (project.code || "—");

      const dateSpan = document.createElement("span");
      dateSpan.textContent = "Created: " + formatDate(project.createdAt);

      meta.appendChild(idSpan);
      meta.appendChild(codeSpan);
      meta.appendChild(dateSpan);

      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(meta);

      projectsList.appendChild(card);
    });
  }

  // ----- Event listeners -----
  themeToggle.addEventListener("click", function () {
    const currentTheme = document.body.classList.contains("light") ? "light" : "dark";
    applyTheme(currentTheme === "light" ? "dark" : "light");
  });

  goDashboardBtn.addEventListener("click", function () {
    window.location.href = "dashboard.html";
  });

  exitSystemBtn.addEventListener("click", function () {
    window.location.href = "welcome.html";
  });

  showProjectFormBtn.addEventListener("click", openProjectForm);
  cancelProjectBtn.addEventListener("click", closeProjectForm);
  projectForm.addEventListener("submit", addProject);

  clearProjectsBtn.addEventListener("click", function () {
    if (!confirm("Clear saved projects? (For testing only)")) return;

    localStorage.removeItem(PROJECTS_KEY);
    renderProjects();
  });

  // ----- Start page -----
  initTheme();
  importOldProjectsIfNeeded();
  renderProjects();
})();
