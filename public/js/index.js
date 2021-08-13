const loginForm = document.getElementById("login");
const signupForm = document.getElementById("signup");
const loginAlert = document.querySelector(".loginMessage");
const signupAlert = document.querySelector(".signupMessage");
const handleLogin = async (e) => {
  loginAlert.style.display = "none";

  e.preventDefault();
  const user = document.getElementById("user").value;
  const password = document.getElementById("password").value;
  let type = -1;
  if (user.includes("@")) {
    type = 0;
  } else {
    type = 1;
  }
  const body = {
    user,
    password,
    type,
  };
  try {
    const response = await axios.post("/login", body);
    const status = response.status;
    if (status === 200) {
      window.location.href = "/home";
    }
  } catch (err) {
    loginAlert.style.display = "block";
    console.log(err);
  }
};
const handleSignup = async (e) => {
  signupAlert.style.display = "none";

  e.preventDefault();
  const username = document.getElementById("username-register").value;
  const password = document.getElementById("password-register").value;
  const name = document.getElementById("name-register").value;
  const email = document.getElementById("email-register").value;

  const body = {
    username,
    name,
    password,
    email,
  };
  console.log(body);
  try {
    const response = await axios.post("/signup", body);
    const status = response.status;
    if (status === 201) {
      window.location.href = "/home";
    }
  } catch (err) {
    signupAlert.style.display = "block";
    console.log(err);
  }
};
loginForm.addEventListener("submit", handleLogin);
signupForm.addEventListener("submit", handleSignup);
