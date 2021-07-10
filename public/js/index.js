document.getElementById("login").addEventListener("submit", async function (e) {
  e.preventDefault();
  let username = document.getElementById("luname").value;
  let password = document.getElementById("lpass").value;
  let body = {
    username,
    password,
  };
  let config = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  };
  const response = await fetch("/login", config);
  const json = await response.json();
  const status = await response.status;
  console.log(json, status);
  document.getElementById("loginError").innerHTML = json.message;
  if (status == 200) {
    window.location.href = "/";
  }
});

document.getElementById("signup").addEventListener("submit", async function (e) {
  e.preventDefault();
  let username = document.getElementById("suname").value;
  let password = document.getElementById("spass").value;
  let email = document.getElementById("semail").value;
  let name = document.getElementById("sname").value;
  let body = {
    username,
    password,
    email,
    name,
  };
  let config = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  };
  const response = await fetch("/signup", config);
  const json = await response.json();
  const status = await response.status;
  console.log(json, status);
  document.getElementById("signupError").innerHTML = json.message;
  if (status == 200) {
    window.location.href = "/";
  }
});
