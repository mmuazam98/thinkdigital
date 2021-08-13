const editPost = document.querySelector(".edit-post") || null;
const deletePost = document.querySelector(".delete-post") || null;
const postid = window.location.pathname.split("/")[2];

if (editPost || deletePost) {
  deletePost.addEventListener("click", async () => {
    const confirm = window.confirm("Are you sure you want to delete this post?");
    if (confirm) {
      try {
        const response = await axios.delete(`/post/${postid}`);
        console.log(response);
        if (response.status === 200) {
          window.location.href = `/users/${localStorage.getItem("userid")}`;
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
  const comment = document.getElementById("comment").value;
  console.log(comment);
  if (comment.length > 0) {
    try {
      const response = await axios.post(`/comment/${postid}`, { comment });
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
