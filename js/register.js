/* =========================
   REGISTER FUNCTION
   (Redirects to form)
========================= */

function register(type, id, name) {
  let user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  // Save selected course temporarily
  localStorage.setItem(
    "selectedCourse",
    JSON.stringify({
      programType: type,   // Course / Camp
      programId: id,
      programName: name
    })
  );

  // Redirect to registration form
  window.location.href = "register.html";
}

/* =========================
   DISPLAY TUITION CLASSES
   (Uses 'courses' from HTML)
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const classList = document.getElementById("classList");

  // Stop if this page doesn't have classList
  if (!classList || typeof courses === "undefined") return;

  classList.innerHTML = "";

  courses.forEach(course => {
    classList.innerHTML += `
      <div class="course-card">
        <span class="badge">Limited Seats</span>

        <div class="course-title">${course.name}</div>

        <p class="course-desc">${course.desc}</p>

        <div class="course-meta">
          <span>
            <i class="fas fa-user-graduate"></i>
            Grade ${course.name.split(" ")[1]}
          </span>
          <span>
            <i class="fas fa-chair"></i>
            ${course.slots} Seats Left
          </span>
        </div>

        <button class="btn-reg"
          onclick="register('Course', ${course.id}, '${course.name}')">
          Enroll Now
        </button>
      </div>
    `;
  });
});
