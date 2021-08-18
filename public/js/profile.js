const postsContainer = document.querySelector(".posts");
const followersContainer = document.querySelector(".followers");
const followingContainer = document.querySelector(".following");
const totalPosts = document.getElementById("posts");
const totalFollowers = document.getElementById("followers");
const totalFollowing = document.getElementById("following");
const convert = (datetime) => {
  let created_date = new Date(datetime);
  let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let year = created_date.getFullYear();
  let month = months[created_date.getMonth()];
  let date = created_date.getDate();
  let time = date + ", " + month + " " + year;
  return time;
};
const hideAllComponents = () => {
  postsContainer.style.display = "none";
  followersContainer.style.display = "none";
  followingContainer.style.display = "none";
};
const showComponent = () => {
  const location = window.location.search.split("=")[1];
  hideAllComponents();
  if (location === "followers") {
    document.getElementById("followersTab").classList.add("active");
    followersContainer.style.display = "";
  } else if (location === "following") {
    document.getElementById("followingTab").classList.add("active");
    followingContainer.style.display = "";
  } else {
    document.getElementById("postsTab").classList.add("active");
    postsContainer.style.display = "";
  }
};
const fetchPosts = async () => {
  const userid = window.location.pathname.split("/")[2];
  console.log(userid);
  try {
    const response = await axios.get(`/posts/${userid}`);
    const posts = response.data;
    totalPosts.innerHTML = posts.length;
    if (posts.length > 0) {
      posts.forEach((post) => {
        let appendPost = `<a href="/post/${post.postid}" class="list-group-item list-group-item-action">
                <img class="avatar-tiny" src="/images/user.png" /> <strong>${post.title}</strong>
                <span class="text-muted small">on ${convert(post.createdAt)} </span>
            </a>`;
        let div = document.createElement("div");
        div.innerHTML = appendPost;
        postsContainer.appendChild(div);
      });
    } else {
      let div = document.createElement("div");
      div.classList += "text-center text-muted mt-3 mb-2";
      div.innerHTML = "No Posts Available.";
      postsContainer.append(div);
    }
  } catch (err) {
    console.log(err);
  }
};
const fetchFollowers = async () => {
  const userid = window.location.pathname.split("/")[2];
  try {
    const response = await axios.get(`/followers/${userid}`);
    const followers = response.data;
    totalFollowers.innerHTML = followers.length;
    console.log(followers);
    if (followers.length > 0) {
      followers.forEach((follower) => {
        let appendPost = ` <a href="/users/${follower.userid}?tab=posts" class="list-group-item list-group-item-action"> <img class="avatar-tiny" src="/images/user.png" /> ${follower.name} </a>`;
        let div = document.createElement("div");
        div.innerHTML = appendPost;
        followersContainer.appendChild(div);
      });
    } else {
      let div = document.createElement("div");
      div.classList += "text-center text-muted mt-3 mb-2";
      div.innerHTML = "No Users Available.";
      followersContainer.append(div);
    }
  } catch (err) {
    console.log(err);
  }
};
const fetchFollowing = async () => {
  const userid = window.location.pathname.split("/")[2];
  try {
    const response = await axios.get(`/following/${userid}`);
    const following = response.data;
    totalFollowing.innerHTML = following.length;
    if (following.length > 0) {
      following.forEach((follower) => {
        let appendPost = ` <a href="/users/${follower.userid}?tab=posts" class="list-group-item list-group-item-action"> <img class="avatar-tiny" src="/images/user.png" /> ${follower.name} </a>`;
        let div = document.createElement("div");
        div.innerHTML = appendPost;
        followingContainer.appendChild(div);
      });
    } else {
      let div = document.createElement("div");
      div.classList += "text-center text-muted mt-3 mb-2";
      div.innerHTML = "No Users Available.";
      followingContainer.append(div);
    }
  } catch (err) {
    console.log(err);
  }
};

document.addEventListener("DOMContentLoaded", showComponent);
document.addEventListener("DOMContentLoaded", fetchPosts);
document.addEventListener("DOMContentLoaded", fetchFollowers);
document.addEventListener("DOMContentLoaded", fetchFollowing);

const followButton = document.querySelector(".followUser") || null;
const unfollowButton = document.querySelector(".unfollowUser") || null;
if (followButton) {
  followButton.addEventListener("click", async () => {
    followButton.disabled = true;
    const followerid = followButton.dataset.id;
    try {
      const response = await axios.post(`/follow/${followerid}`, { body: "" });
      console.log(response);
      followButton.disabled = false;

      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  });
}
if (unfollowButton) {
  unfollowButton.addEventListener("click", async () => {
    unfollowButton.disabled = true;

    const followerid = unfollowButton.dataset.id;
    try {
      const response = await axios.post(`/unfollow/${followerid}`, { body: "" });
      console.log(response);
      unfollowButton.disabled = false;

      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  });
}
