document.addEventListener("DOMContentLoaded", () => {
    const route = window.location.pathname;
      const homeLink = document.querySelector("#home");
      const aboutLink = document.querySelector("#about");
      const termsLink = document.querySelector("#terms");
      const searchLink = document.querySelector("#searchIcon");
      const createPostBtn = document.querySelector("#createPostBtn")
      const profileBtn = document.querySelector("#profileBtn")
      if(homeLink || createPostBtn || profileBtn){
        if(route == "/home") homeLink.style.fontWeight = "bold";
        else if(route == "/about") aboutLink.style.fontWeight = "bold";
        else if(route == "/terms") termsLink.style.fontWeight = "bold";
        else if(route == "/search") searchLink.style.border = "solid 3px green"
        else if(route == "/create") {createPostBtn.style.background = "green"; createPostBtn.style.color = "#fff";}
        else if(route.split("/")[1] == "users") profileBtn.style.border="solid 3px green"
        else homeLink.style.fontWeight = aboutLink.style.fontWeight = termsLink.style.fontWeight = "initial";
      }
})