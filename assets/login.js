const API_URL = "http://localhost:5678/api";

function login() {
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  let errorMessage = document.getElementById("login-error");
  errorMessage.style.display = "none";
  var data = {
    email: email,
    password: password,
  };
  fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        errorMessage.style.display = "block";
      }
    })
    .then(function (data) {
      localStorage.setItem("email", email);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("token", data.token);
      window.location.href = "/";
    });
}

document
  .querySelector("#login-form form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    login();
  });
