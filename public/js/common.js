document.addEventListener("DOMContentLoaded", () => {
    const route = window.location.pathname;
      const homeLink = document.querySelector("#home");
      const aboutLink = document.querySelector("#about");
      const termsLink = document.querySelector("#terms");
      const searchLink = document.querySelector("#searchIcon");
      const createPostBtn = document.querySelector("#createPostBtn")
      const profileBtn = document.querySelector("#profileBtn")
      if(homeLink || createPostBtn || profileBtn){
        if(route == "/home") homeLink.classList.add("active");
        else if(route == "/about") aboutLink.classList.add("active");
        else if(route == "/terms") termsLink.classList.add("active");
        else if(route == "/search") searchLink.style.border = "solid 3px green"
        else if(route == "/create") {createPostBtn.style.background = "green"; createPostBtn.style.color = "#fff";}
        else if(route.split("/")[1] == "users") profileBtn.style.border="solid 3px green"
        else {homeLink.classList.remove("active"); aboutLink.classList.remove("active"); termsLink.classList.remove("active");}
      }
})