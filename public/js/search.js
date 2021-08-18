const spinner = document.querySelector(".spinner-border");
spinner.style.display = "none";
const searchInput = document.getElementById("search");
const searchContainer = document.querySelector(".search-container");
let timeout = null;
searchInput.addEventListener("keyup", async (e) => {
  searchContainer.innerHTML = "";
  spinner.style.display = "";

  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    const query = e.target.value;
    if (query.length > 0) {
      try {
        const response = await axios.post("/search", { query });
        console.log(response.data.posts);
        if (response.data.posts.length > 0) {
          spinner.style.display = "none";
          response.data.posts.forEach((post) => {
            let appendPost = `<a href="/post/${post.postid}" class="list-group-item list-group-item-action">
                <img class="avatar-tiny" src="/images/user.png" /> <strong>${post.title}</strong>
                <span class="text-muted small">by ${post.username} on ${post.createdAt} </span>
            </a>`;
            let div = document.createElement("div");
            div.innerHTML = appendPost;
            searchContainer.appendChild(div);
          });
        }
        if (response.data.users.length > 0) {
          spinner.style.display = "none";
          response.data.users.forEach((user) => {
            let appendPost = `<a href="/post/${user.userid}" class="list-group-item list-group-item-action">
                <img class="avatar-tiny" src="/images/user.png" /> <strong>${user.name}</strong>
                <span class="text-muted small"> ${user.username} </span>

            </a>`;
            let div = document.createElement("div");
            div.innerHTML = appendPost;
            searchContainer.appendChild(div);
          });
        }
        if (response.data.posts.length === 0 && response.data.users.length === 0) {
          spinner.style.display = "none";
          let div = document.createElement("div");
          div.innerHTML = "No match found.";
          div.classList += "text-center text-muted noMatch";
          searchContainer.appendChild(div);
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      spinner.style.display = "none";
    }
  }, 800);
});
