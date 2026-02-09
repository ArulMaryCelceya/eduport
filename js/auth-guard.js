/* =========================
   AUTH GUARD
   Redirect to login if user is not signed in.
   Include this script first on any page that requires login.
========================= */
(function() {
  var user = null;
  try {
    user = JSON.parse(localStorage.getItem("currentUser"));
  } catch (e) {}
  if (!user) {
    window.location.replace("login.html");
  }
})();
