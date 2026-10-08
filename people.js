var PEOPLE_KEY = "bugtracker_people";
var OLD_PEOPLE_KEY = "people"; // old key kept only so older saved people can still be found
var THEME_KEY = "darkMode";

var people = [];

// Read a JSON array from localStorage safely.
function loadArrayFromStorage(key) {
  var savedData = localStorage.getItem(key);

  if (!savedData) {
    return [];
  }

  try {
    var parsedData = JSON.parse(savedData);

    if (Array.isArray(parsedData)) {
      return parsedData;
    }
  } catch (error) {
    console.log("Could not read saved people data.", error);
  }

  return [];
}

// Load people from the shared key used by the issue and dashboard pages.
function loadPeople() {
  people = loadArrayFromStorage(PEOPLE_KEY);

  if (people.length === 0) {
    var oldPeople = loadArrayFromStorage(OLD_PEOPLE_KEY);

    if (oldPeople.length > 0) {
      people = oldPeople;
      savePeople();
    }
  }
}

// Save people where the rest of the system can read them.
function savePeople() {
  localStorage.setItem(PEOPLE_KEY, JSON.stringify(people));

  // Keep the old key updated too, but the main system uses bugtracker_people.
  localStorage.setItem(OLD_PEOPLE_KEY, JSON.stringify(people));
}

// Create a neat person id for the school project.
function makePersonId() {
  return "P" + Date.now();
}

// Get full name for display.
function getFullName(person) {
  return person.name + " " + person.surname;
}

// Show small messages below the form.
function showFormMessage(text, type) {
  var messageBox = document.getElementById("formMessage");

  messageBox.textContent = text;
  messageBox.className = "form-message " + type;

  setTimeout(function () {
    messageBox.textContent = "";
    messageBox.className = "form-message";
  }, 3000);
}

// Clear the form and return it to add mode.
function clearPeopleForm() {
  document.getElementById("personId").value = "";
  document.getElementById("personName").value = "";
  document.getElementById("personSurname").value = "";
  document.getElementById("personEmail").value = "";
  document.getElementById("personUsername").value = "";

  document.getElementById("formTitle").textContent = "Add New Person";
  document.getElementById("savePersonBtn").textContent = "Save Person";
}

// Check that the username is not already used by another person.
function usernameExists(username, currentId) {
  for (var i = 0; i < people.length; i++) {
    if (
      people[i].username.toLowerCase() === username.toLowerCase() &&
      people[i].id != currentId
    ) {
      return true;
    }
  }

  return false;
}

// Check that the email is not already used by another person.
function emailExists(email, currentId) {
  for (var i = 0; i < people.length; i++) {
    if (
      people[i].email.toLowerCase() === email.toLowerCase() &&
      people[i].id != currentId
    ) {
      return true;
    }
  }

  return false;
}

// Draw the saved people cards on the page.
function displayPeople() {
  var peopleList = document.getElementById("peopleList");
  var emptyPeopleState = document.getElementById("emptyPeopleState");
  var peopleCount = document.getElementById("peopleCount");

  peopleList.innerHTML = "";
  peopleCount.textContent = people.length + (people.length === 1 ? " Person" : " People");

  if (people.length === 0) {
    emptyPeopleState.hidden = false;
    return;
  }

  emptyPeopleState.hidden = true;

  for (var i = 0; i < people.length; i++) {
    var person = people[i];

    var card = document.createElement("div");
    card.className = "person-box";

    var topRow = document.createElement("div");
    topRow.className = "person-top-row";

    var nameHeading = document.createElement("h3");
    nameHeading.className = "person-name";
    nameHeading.textContent = getFullName(person);

    var idBadge = document.createElement("span");
    idBadge.className = "person-id";
    idBadge.textContent = person.id;

    topRow.appendChild(nameHeading);
    topRow.appendChild(idBadge);

    var details = document.createElement("div");
    details.className = "person-details";
    details.innerHTML =
      "<span><strong>Email:</strong> " + person.email + "</span>" +
      "<span><strong>Username:</strong> " + person.username + "</span>";

    var actions = document.createElement("div");
    actions.className = "person-actions";

    var editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "people-btn people-btn-chip";
    editBtn.textContent = "Edit";
    editBtn.setAttribute("data-id", person.id);

    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "people-btn people-btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("data-id", person.id);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(topRow);
    card.appendChild(details);
    card.appendChild(actions);

    peopleList.appendChild(card);
  }
}

// Add a new person or update an existing person.
function savePerson(event) {
  event.preventDefault();

  var id = document.getElementById("personId").value;
  var name = document.getElementById("personName").value.trim();
  var surname = document.getElementById("personSurname").value.trim();
  var email = document.getElementById("personEmail").value.trim();
  var username = document.getElementById("personUsername").value.trim();

  if (name === "" || surname === "" || email === "" || username === "") {
    showFormMessage("Please fill in all fields.", "error");
    return;
  }

  if (emailExists(email, id)) {
    showFormMessage("This email is already saved for another person.", "error");
    return;
  }

  if (usernameExists(username, id)) {
    showFormMessage("This username is already saved for another person.", "error");
    return;
  }

  if (id === "") {
    var newPerson = {
      id: makePersonId(),
      name: name,
      surname: surname,
      email: email,
      username: username
    };

    people.push(newPerson);
    showFormMessage("Person saved successfully. They can now be selected when creating an issue.", "success");
  } else {
    for (var i = 0; i < people.length; i++) {
      if (people[i].id == id) {
        people[i].name = name;
        people[i].surname = surname;
        people[i].email = email;
        people[i].username = username;
        break;
      }
    }

    showFormMessage("Person updated successfully.", "success");
  }

  savePeople();
  displayPeople();
  clearPeopleForm();
}

// Put a person's details into the form for editing.
function editPerson(id) {
  for (var i = 0; i < people.length; i++) {
    if (people[i].id == id) {
      document.getElementById("personId").value = people[i].id;
      document.getElementById("personName").value = people[i].name;
      document.getElementById("personSurname").value = people[i].surname;
      document.getElementById("personEmail").value = people[i].email;
      document.getElementById("personUsername").value = people[i].username;

      document.getElementById("formTitle").textContent = "Edit Person";
      document.getElementById("savePersonBtn").textContent = "Update Person";
      window.scrollTo({ top: 0, behavior: "smooth" });
      break;
    }
  }
}

// Delete a saved person from the system.
function deletePerson(id) {
  var confirmDelete = confirm("Are you sure you want to delete this person?");

  if (!confirmDelete) {
    return;
  }

  people = people.filter(function (person) {
    return person.id != id;
  });

  savePeople();
  displayPeople();
  clearPeopleForm();
  showFormMessage("Person deleted successfully.", "success");
}

// Apply the dark/light mode to match the rest of the project.
function applyTheme() {
  var themeToggleBtn = document.getElementById("themeToggleBtn");

  if (localStorage.getItem(THEME_KEY) === "disabled") {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    themeToggleBtn.textContent = "☀️ Dark Mode";
  } else {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
    themeToggleBtn.textContent = "🌙 Light Mode";
  }
}

// Start all page features after the HTML is ready.
function startPeopleManagement() {
  loadPeople();
  displayPeople();
  applyTheme();

  document.getElementById("peopleForm").addEventListener("submit", savePerson);
  document.getElementById("clearPeopleFormBtn").addEventListener("click", clearPeopleForm);

  document.getElementById("themeToggleBtn").addEventListener("click", function () {
    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem(THEME_KEY, "disabled");
    } else {
      localStorage.setItem(THEME_KEY, "enabled");
    }

    applyTheme();
  });

  document.getElementById("goDashboardBtn").addEventListener("click", function () {
    window.location.href = "dashboard.html";
  });

  document.getElementById("exitSystemBtn").addEventListener("click", function () {
    window.location.href = "welcome.html";
  });

  document.getElementById("peopleList").addEventListener("click", function (event) {
    var clickedButton = event.target;
    var personId = clickedButton.getAttribute("data-id");

    if (!personId) {
      return;
    }

    if (clickedButton.textContent === "Edit") {
      editPerson(personId);
    }

    if (clickedButton.textContent === "Delete") {
      deletePerson(personId);
    }
  });
}

document.addEventListener("DOMContentLoaded", startPeopleManagement);
