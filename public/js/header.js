const buttonLogout = document.querySelector(".btn-logout");
buttonLogout.addEventListener("click", async () => {
  try {
    const response = await axios.post("/logout", { body: "" });
    window.location.href = "/";
  } catch (err) {
    console.log(err);
  }
});
