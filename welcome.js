function enterApp() {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.5s ease";

  setTimeout(() => {
    window.location.href = "hub.html";
  }, 500);
}

// Function for the "View Projects" button, kept in case the page uses it later.
function goToProjects() {
  window.location.href = "projects.html";
}
