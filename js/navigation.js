function go(path) {
  window.location.href = path;
}

function logout() {
  localStorage.removeItem("auth");
  window.location.href = "../index.html";
}

if (localStorage.getItem("auth") !== "true") {
  window.location.href = "../index.html";
}
