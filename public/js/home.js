// document.addEventListener("DOMContentLoaded", () => {
//   console.log(currUserId);
//   localStorage.setItem("userid", currUserId);
// });
const likePost = document.querySelector("#like-btn") || null;
if(likePost){
  likePost.addEventListener("click", async() => {
    try {
      const response = await axios.post(`/like/${postid}`);
      window.location.href = `/post/${postid}`;
    } catch (error) {
      console.log(err)
    }

  })
}

