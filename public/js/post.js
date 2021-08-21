const editPost = document.querySelector(".edit-post") || null;
const deletePost = document.querySelector(".delete-post") || null;
const postid = window.location.pathname.split("/")[2];

const route = window.location.pathname;

if(route.split("/")[3] !== "likes"){

  if (editPost || deletePost) {
    deletePost.addEventListener("click", async () => {
      const confirm = window.confirm("Are you sure you want to delete this post?");
      if (confirm) {
        try {
          const response = await axios.delete(`/post/${postid}`);
          console.log(response);
          if (response.status === 200) {
            window.location.href = `/users/${loggedInUser}`;
          }
        } catch (err) {
          console.log(err);
        }
      }
    });
    editPost.addEventListener("click", async () => {
      window.location.href = `/post/${postid}/edit`;
    });
  }
  
  const postBtn = document.getElementById("btn-comment");
  postBtn.addEventListener("click", async () => {
    const commented = document.getElementById("comment").value;
    if (commented.length > 0) {
      try {
        const response = await axios.post(`/comment/${postid}`, { commented });
        window.location.reload();
      } catch (err) {
        console.log(err);
      }
    }
  });
  
  const deleteComment = document.querySelectorAll(".delete-comment") || null;
  if (deleteComment) {
    deleteComment.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const confirm = window.confirm("Are you sure you want to delete this comment?");
        if (confirm) {
          try {
            const response = await axios.delete(`/comment/${postid}/${btn.dataset.id}`);
            window.location.reload();
          } catch (err) {
            console.log(err);
          }
        }
      });
    });
  }
}

  const likePost = document.querySelector("#like-btn") || null;
  const likeCount = document.querySelector("#like-count");
  if(likePost){
    likePost.addEventListener("click", async() => {
      const likeList = document.querySelectorAll(".liked-list");
      const likeContainer = document.querySelector("#like-container");
      try {
        const response = await axios.post(`/like/${postid}`);
        likeCount.innerHTML = `(${response.data.likes})`;
        if(response.data.isLikedByUser == true){
          likePost.style.color = "red";
          if(likeList){
            let isCurrentUserUnliked = true;
            likeList.forEach(like => {
              let likeUser = like.attributes.href.value.split("/")[2]
              if(loggedInUser !== likeUser && isCurrentUserUnliked){
                likeContainer.innerHTML += `<a href="/users/${currentUser.userid}" class="list-group-item liked-list list-group-item-action">
                <img class="avatar-tiny" src="/images/user.png" /> <strong>${currentUser.name}</strong>
                <span class="text-muted small"> ${currentUser.username} </span>
            </a>`;
            isCurrentUserUnliked=false;
              } else {
                like.style.display = "block";
              }
              
          });
          }
        } 
        else{
          likePost.style.color = "#fff"
          if(likeList){
            likeList.forEach(like => {
              let user = like.attributes.href.value.split("/")[2]
              if(loggedInUser === user){
                like.style.display = "none";
              }
          });
          }
        } 
      } catch (error) {
        console.log(error)
      }
  
    })
  }


