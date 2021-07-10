const login = document.querySelector(".btn-login") || null;
const logout = document.querySelector(".btn-logout") || null;
if (login)
  login.addEventListener("click", function () {
    window.location.href = "/login";
  });
if (logout)
  logout.addEventListener("click", async function () {
    let config = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    };
    const response = await fetch("/logout", config);
    const status = await response.status;
    console.log(status);
    if (status == 200) {
      location.reload();
    }
  });
document.querySelector(".profile").addEventListener("click", function () {
  window.location.href = "/profile";
});
