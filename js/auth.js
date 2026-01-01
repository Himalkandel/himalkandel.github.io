const PASSWORD = "Himal10";

function login() {
  const input = document.getElementById("password").value;
  const error = document.getElementById("error");

  if (input === PASSWORD) {
    localStorage.setItem("auth", "true");
    window.location.href = "main.html";
  } else {
    error.textContent = "Incorrect password";
  }
}

if (localStorage.getItem("auth") === "true") {
  window.location.href = "main.html";
}
