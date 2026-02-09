/* =========================
   LOAD USER & COURSE
   Without login or selected course, user cannot register.
========================= */

let user = null;
let course = null;

try {
  user = JSON.parse(localStorage.getItem("currentUser"));
  course = JSON.parse(localStorage.getItem("selectedCourse"));
} catch (e) {}

if (!user) {
  alert("You must sign in to register for a course. Redirecting to login.");
  window.location.href = "login.html";
} else if (!course) {
  alert("No course selected. Please choose a course or camp first.");
  window.location.href = "classes.html";
} else {
  /* =========================
     SHOW SELECTED COURSE
  ========================= */
  document.getElementById("courseInfo").innerHTML = `
    <strong>Course:</strong> ${course.programName}
  `;

  /* =========================
     PRE-FILL USER DETAILS
  ========================= */
  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  if (nameEl) nameEl.value = user.name || "";
  if (emailEl) emailEl.value = user.email || "";
}

/* =========================
   VALIDATION HELPERS
========================= */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\+\(\)]{8,20}$/;

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

function clearAllErrors() {
  ["name", "email", "phone", "address"].forEach(clearFieldError);
}

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_REGEX.test(email.trim());
}

function isValidPhone(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 && PHONE_REGEX.test(phone.trim());
}

/* =========================
   SUBMIT REGISTRATION (with validation)
========================= */

function submitRegistration() {
  if (!user || !course) {
    alert("Session invalid. Please sign in and select a course again.");
    window.location.href = "login.html";
    return;
  }

  clearAllErrors();

  const name = (document.getElementById("name").value || "").trim();
  const email = (document.getElementById("email").value || "").trim();
  const phone = (document.getElementById("phone").value || "").trim();
  const address = (document.getElementById("address").value || "").trim();

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

  if (!phone) {
    showFieldError("phone", "Phone number is required.");
    hasError = true;
  } else if (!isValidPhone(phone)) {
    showFieldError("phone", "Enter a valid phone number (8–15 digits).");
    hasError = true;
  }

  if (!address) {
    showFieldError("address", "Address is required.");
    hasError = true;
  } else if (address.trim().length < 10) {
    showFieldError("address", "Please enter a complete address (at least 10 characters).");
    hasError = true;
  }

  if (hasError) return;

  let registrations = JSON.parse(localStorage.getItem("registrations")) || [];

  let registration = {
    userName: name,
    userEmail: email,
    phone: phone.trim(),
    address: address.trim(),
    programType: course.programType,
    programId: course.programId,
    programName: course.programName,
    status: "Pending",
    date: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" })
  };

  registrations.push(registration);
  localStorage.setItem("registrations", JSON.stringify(registrations));

  alert("Registration submitted! Waiting for admin approval.");

  localStorage.removeItem("selectedCourse");
  window.location.href = "my-registrations.html";
}
