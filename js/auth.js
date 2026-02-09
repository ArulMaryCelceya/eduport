/* =========================
   VALIDATION HELPERS
========================= */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add("input-error");
  let errEl = document.getElementById(fieldId + "-error");
  if (!errEl) {
    errEl = document.createElement("span");
    errEl.id = fieldId + "-error";
    errEl.className = "error-msg";
    field.closest(".form-group").appendChild(errEl);
  }
  errEl.textContent = message;
  errEl.style.display = "block";
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) field.classList.remove("input-error");
  const errEl = document.getElementById(fieldId + "-error");
  if (errEl) {
    errEl.textContent = "";
    errEl.style.display = "none";
  }
}

function clearAllErrors(formType) {
  if (formType === "login") {
    clearFieldError("email");
    clearFieldError("password");
  } else if (formType === "signup") {
    clearFieldError("name");
    clearFieldError("email");
    clearFieldError("password");
  }
}

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_REGEX.test(email.trim());
}

/* =========================
   SIGNUP
========================= */

function signup() {
  clearAllErrors("signup");

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  let hasError = false;

  if (!name) {
    showFieldError("name", "Full name is required.");
    hasError = true;
  } else if (name.length < 2) {
    showFieldError("name", "Name must be at least 2 characters.");
    hasError = true;
  }

  if (!email) {
    showFieldError("email", "Email is required.");
    hasError = true;
  } else if (!isValidEmail(email)) {
    showFieldError("email", "Please enter a valid email address.");
    hasError = true;
  }

  if (!password) {
    showFieldError("password", "Password is required.");
    hasError = true;
  } else if (password.length < 8) {
    showFieldError("password", "Password must be at least 8 characters.");
    hasError = true;
  }

  if (hasError) return;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    showFieldError("email", "An account with this email already exists.");
    return;
  }

  users.push({
    name,
    email,
    password,
    role: "user"
  });

  localStorage.setItem("users", JSON.stringify(users));
  alert("Signup successful");
  window.location.href = "login.html";
}

/* =========================
   LOGIN
========================= */

function login() {
  clearAllErrors("login");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  let hasError = false;

  if (!email) {
    showFieldError("email", "Email is required.");
    hasError = true;
  } else if (!isValidEmail(email)) {
    showFieldError("email", "Please enter a valid email address.");
    hasError = true;
  }

  if (!password) {
    showFieldError("password", "Password is required.");
    hasError = true;
  }

  if (hasError) return;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert("Login successful");
    window.location.href = "classes.html";
  } else {
    showFieldError("password", "Invalid email or password.");
  }
}
