const form = document.getElementById("create-post");
const button = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  button.disabled = true;
  const title = document.getElementById("post-title").value;
  const description = document.getElementById("post-body").value;
  try {
    if (!window.location.pathname.includes("edit")) {
      const response = await axios.post("/post", { title, description });
      console.log(response);
      if (response.status === 201) {
        button.disabled = false;
        window.location.href = `/post/${response.data.postid}`;
      }
    } else {
      const postid = window.location.pathname.split("/")[2];
      console.log(postid);
      const response = await axios.patch(`/post/${postid}`, { title, description });
      console.log(response);
      if (response.status === 200) {
        button.disabled = false;
        window.location.href = `/post/${response.data.postid}`;
      }
    }
  } catch (err) {
    button.disabled = false;
    console.log(err);
  }
});
