/* =========================
   ADMIN LOGIN
========================= */
function adminLogin() {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  if (email === "admin@gmail.com" && password === "admin123") {
    localStorage.setItem("adminLoggedIn", "true");
    alert("Admin login successful");
    window.location.href = "admin-dashboard.html";
  } else {
    alert("Invalid admin credentials");
  }
}

/* =========================
   PROTECT ADMIN DASHBOARD
========================= */
if (window.location.pathname.includes("admin-dashboard.html")) {
  if (localStorage.getItem("adminLoggedIn") !== "true") {
    alert("Unauthorized access");
    window.location.href = "admin-login.html";
  }
}

/* =========================
   COURSES (localStorage)
========================= */
const COURSES_KEY = "courses";
const LEGACY_COURSES_KEY = "tuitionCourses"; // migrate from old key

function getDefaultCourses() {
  return [
    { id: 1, name: "Communication Skills", desc: "Effective verbal and written communication for work and life.", slots: 15, category: "Soft Skills" },
    { id: 2, name: "Leadership & Teamwork", desc: "Lead with confidence and collaborate effectively in teams.", slots: 12, category: "Soft Skills" },
    { id: 3, name: "Time Management", desc: "Prioritize tasks, meet deadlines, and boost productivity.", slots: 10, category: "Soft Skills" },
    { id: 4, name: "Problem Solving & Critical Thinking", desc: "Analyze problems, evaluate options, and make better decisions.", slots: 12, category: "Soft Skills" },
    { id: 5, name: "Emotional Intelligence", desc: "Self-awareness, empathy, and building strong relationships.", slots: 10, category: "Soft Skills" },
    { id: 6, name: "Web Development Basics", desc: "HTML, CSS, and JavaScript to build your first websites.", slots: 12, category: "IT" },
    { id: 7, name: "Python Programming", desc: "Learn programming fundamentals and automation with Python.", slots: 10, category: "IT" },
    { id: 8, name: "Data Analytics", desc: "Work with data, spreadsheets, and basic analytics tools.", slots: 8, category: "IT" }
  ];
}

function getCourses() {
  let stored = localStorage.getItem(COURSES_KEY);
  if (stored === null || stored === undefined) {
    stored = localStorage.getItem(LEGACY_COURSES_KEY);
    if (stored !== null && stored !== undefined) {
      localStorage.setItem(COURSES_KEY, stored);
      localStorage.removeItem(LEGACY_COURSES_KEY);
    }
  }
  if (stored === null || stored === undefined) {
    let defaultCourses = getDefaultCourses();
    localStorage.setItem(COURSES_KEY, JSON.stringify(defaultCourses));
    return defaultCourses;
  }
  let parsed = JSON.parse(stored);
  return Array.isArray(parsed) ? parsed : getDefaultCourses();
}

function saveCourses(courses) {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
}

/* =========================
   VIEW SWITCH (Dashboard / Courses)
========================= */
function showView(viewName) {
  document.querySelectorAll(".view").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-links a").forEach(a => a.classList.remove("active"));
  if (viewName === "dashboard") {
    document.getElementById("dashboardView").classList.add("active");
    let nav = document.getElementById("navDashboard");
    if (nav) nav.classList.add("active");
  } else {
    document.getElementById("coursesView").classList.add("active");
    let nav = document.getElementById("navCourses");
    if (nav) nav.classList.add("active");
    renderCoursesList();
  }
}

/* =========================
   LOAD REGISTRATIONS (dashboard table + modal)
   Admin sees only Pending; Accept/Reject updates status (user sees it in My Registrations).
   Rejected rows disappear from admin list.
========================= */
let regList = document.getElementById("regList");
let _currentRegIndex = -1;

function getRegistrations() {
  return JSON.parse(localStorage.getItem("registrations")) || [];
}

function saveRegistrations(regs) {
  localStorage.setItem("registrations", JSON.stringify(regs));
}

function openModal(index) {
  let registrations = getRegistrations();
  _currentRegIndex = index;
  let r = registrations[index];
  if (!r) return;
  document.getElementById("mName").innerText = r.userName || "—";
  document.getElementById("mEmail").innerText = r.userEmail || "—";
  document.getElementById("mPhone").innerText = r.phone || "—";
  document.getElementById("mAddress").innerText = r.address || "—";
  document.getElementById("mCourse").innerText = r.programName || "—";
  let mDate = document.getElementById("mDate");
  if (mDate) mDate.innerText = r.date || "—";
  document.getElementById("mStatus").innerText = r.status || "Pending";
  document.getElementById("detailModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("detailModal").style.display = "none";
}

function updateStatusFromModal(status) {
  if (_currentRegIndex >= 0) updateStatus(_currentRegIndex, status);
  closeModal();
}

function renderRegList() {
  if (!regList) return;
  let registrations = getRegistrations();
  let pending = registrations
    .map((r, index) => ({ ...r, _index: index }))
    .filter(r => (r.status || "Pending") === "Pending");
  if (pending.length === 0) {
    regList.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--text-muted)">No pending registrations. Accepted and rejected items are hidden from this list.</td></tr>';
  } else {
    regList.innerHTML = pending.map((r) => {
      let dateStr = r.date || "—";
      return `
        <tr onclick="openModal(${r._index})">
          <td><strong>${(r.userName || "—").replace(/</g, "&lt;")}</strong></td>
          <td>${(r.programName || "—").replace(/</g, "&lt;")}</td>
          <td>${dateStr.replace(/</g, "&lt;")}</td>
          <td><span class="status status-pending">Pending</span></td>
        </tr>
      `;
    }).join("");
  }
}

renderRegList();

/* =========================
   STATS (total registrations, unique students)
========================= */
function updateStats() {
  let registrations = getRegistrations();
  let totalEl = document.getElementById("totalRegs");
  let studentsEl = document.getElementById("totalStudents");
  if (totalEl) totalEl.textContent = registrations.length;
  if (studentsEl) {
    let emails = new Set(registrations.map(r => r.userEmail).filter(Boolean));
    studentsEl.textContent = emails.size;
  }
}

if (document.getElementById("totalRegs")) updateStats();

/* =========================
   COURSE REGISTRATION CHART
========================= */
let courseChartInstance = null;

function buildCourseChart() {
  let chartCanvas = document.getElementById("courseChart");
  if (!chartCanvas) return;
  let registrations = getRegistrations();
  let courseCount = {};
  registrations.forEach(r => {
    if (r.programName) {
      courseCount[r.programName] = (courseCount[r.programName] || 0) + 1;
    }
  });

  let courseNames = Object.keys(courseCount);
  let counts = Object.values(courseCount);

  if (courseChartInstance) {
    courseChartInstance.destroy();
    courseChartInstance = null;
  }

  courseChartInstance = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: courseNames.length ? courseNames : ["No registrations yet"],
      datasets: [{
        label: "Students per course",
        data: counts.length ? counts : [0],
        backgroundColor: "rgba(79, 70, 229, 0.6)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

if (document.getElementById("courseChart")) buildCourseChart();

/* =========================
   UPDATE STATUS (saved to same localStorage — user sees it in My Registrations)
   Rejected: status set to Rejected, row removed from admin list.
   Accepted: status set to Accepted, row removed from admin list.
========================= */
function updateStatus(index, status) {
  let registrations = getRegistrations();
  if (index < 0 || index >= registrations.length) return;
  registrations[index].status = status === "Rejected" ? "Rejected" : "Accepted";
  saveRegistrations(registrations);
  if (status === "Rejected") {
    alert("Registration rejected. It has been removed from your list. The user will see 'Rejected' in My Registrations.");
  } else {
    alert("Registration accepted. The user will see 'Accepted' in My Registrations.");
  }
  renderRegList();
  updateStats();
  buildCourseChart();
}

/* =========================
   COURSES: render list, add, remove
========================= */
function renderCoursesList() {
  let listEl = document.getElementById("coursesList");
  if (!listEl) return;
  let courses = getCourses();
  listEl.innerHTML = courses.map((c, i) => `
    <div class="course-row" data-index="${i}">
      <div>
        <div class="course-name">${(c.name || "").replace(/</g, "&lt;")} <span style="color:var(--text-muted);font-size:0.8em;">· ${c.category || "Course"}</span></div>
        <div class="course-meta">${(c.desc || "").replace(/</g, "&lt;")} · ${c.slots || 0} seats</div>
      </div>
      <button type="button" class="btn-remove" onclick="removeCourse(${i})"><i class="fas fa-trash"></i> Remove</button>
    </div>
  `).join("");
}

function addCourse() {
  let nameEl = document.getElementById("newCourseName");
  let descEl = document.getElementById("newCourseDesc");
  let slotsEl = document.getElementById("newCourseSlots");
  let categoryEl = document.getElementById("newCourseCategory");
  let name = (nameEl && nameEl.value || "").trim();
  let desc = (descEl && descEl.value || "").trim();
  let slots = parseInt((slotsEl && slotsEl.value) || "10", 10) || 10;
  let category = (categoryEl && categoryEl.value) || "Course";

  if (!name) {
    alert("Enter a course name.");
    return;
  }

  let courses = getCourses();
  let maxId = courses.length ? Math.max(...courses.map(c => c.id)) : 0;
  courses.push({
    id: maxId + 1,
    name: name,
    desc: desc || "Course.",
    slots: slots,
    category: category
  });
  saveCourses(courses);

  if (nameEl) nameEl.value = "";
  if (descEl) descEl.value = "";
  if (slotsEl) slotsEl.value = "";
  renderCoursesList();
  alert("Course added. Students will see it on the Classes page.");
}

function removeCourse(index) {
  let courses = getCourses();
  if (index < 0 || index >= courses.length) return;
  let name = courses[index].name;
  if (!confirm('Remove course "' + name + '"? Students will no longer see it.')) return;
  courses.splice(index, 1);
  saveCourses(courses);
  renderCoursesList();
}

/* =========================
   ADMIN LOGOUT
========================= */
function logoutAdmin() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "admin-login.html";
}
