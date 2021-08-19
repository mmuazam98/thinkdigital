const Router = require("express").Router();
const con = require("../database/database");
const util = require("util");
const cookieParser = require("cookie-parser");
const shortid = require("shortid");
const auth = require("../middleware/auth");
const { parse } = require("dotenv");
Router.use(cookieParser());

// FUNCTION TO PARSE YOUR SQL RESPONSES
const parseData = (x) => {
  return JSON.parse(JSON.stringify(x));
};
// HANDLE PROMISES
const query = util.promisify(con.query).bind(con);

const convert = (datetime) => {
  let created_date = new Date(datetime);
  let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let year = created_date.getFullYear();
  let month = months[created_date.getMonth()];
  let date = created_date.getDate();
  let time = date + ", " + month + " " + year;
  return time;
}
const calculateDifference = (datetime) => {
  const given_date = new Date(datetime);
  const today_date = new Date();
  const diffTime = Math.abs(today_date - given_date);
  const diffMin = Math.floor(diffTime / (1000*60));
  const diffHrs = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if(diffDays <= 1) 
    if(diffMin < 60) return diffMin + "m";
    else return diffHrs + "h";
  else if(diffDays < 7) return diffDays + "d";
  else return Math.floor(diffDays / 7) + "w";
}
Router.post("/post/", auth, async (req, res) => {
  const userid = req.user.userid;
  const postid = shortid.generate();
  const { title, description } = req.body;

  const createPost = `INSERT INTO posts (userid,postid,title,description) VALUES ('${userid}','${postid}','${title}','${description}')`;

  try {
    const response = await query(createPost);
    console.log(response);
    if (response.affectedRows > 0) {
      res.status(201).json({ msg: "Post created successfully" , postid});
    } else throw new Error();
  } catch (e) {
    res.status(400).json({ msg: "An error occured. Please try again later." });
  }
});

Router.get("/posts/:id", auth, async (req, res) => {
  const userid = req.params.id
  const getPosts = `SELECT * FROM posts WHERE userid='${userid}';`;
  try {
    const response = await query(getPosts);
    const posts = parseData(response);
    res.status(200).send(posts);
  } catch (e) {
    res.status(400).json({ msg: "An error occured. Please try again later." });
  }
});

Router.get("/post/:id", auth, async (req, res) => {
  const postid = req.params.id;
  const getPost = `SELECT userdetails.name, userdetails.username,posts.* FROM userdetails LEFT JOIN posts ON userdetails.userid = posts.userid WHERE postid='${postid}'`;
  const getComments = `SELECT userdetails.userid, userdetails.name, comments.* FROM userdetails
   LEFT JOIN comments ON userdetails.userid = comments.userid WHERE comments.postid='${postid}' ORDER BY comments.commentedAt DESC; `;
  const getLikes = `SELECT * FROM likes WHERE postid='${postid}'`;
  // const getLike = `SELECT * FROM likes WHERE postid = '${postid}' AND userid ='${req.user.userid}'`
  let isLikedByUser = false;
  let likeClass = " unliked";
  try {
    const response = await query(getPost);
    const post = parseData(response)[0];
    post.createdAt = convert(post.createdAt);
    let comments = await query(getComments);
    comments.forEach(comment => {
      comment.commentedAt = calculateDifference(comment.commentedAt);
    })
    let likes = await query(getLikes);
    likes = parseData(likes)
    const isLiked = likes.filter(like => {
      return like.userid == req.user.userid;
    })
    if(isLiked.length){
      isLikedByUser = true;
    }
    if(isLikedByUser){ likeClass = "liked"};
    comments = parseData(comments);
    res.render("post", {likeClass, post, comments, page: "post", user: req.user, isLikedByUser, likes: likes.length});
  } catch (e) {
    res.status(400).json({ msg: "An error occured. Please try again later." });
  }
});

Router.get("/post/:postid/likes", auth, async (req, res) => {
  const postid = req.params.postid;
  const getLikes = `SELECT userdetails.userid, userdetails.username, userdetails.name, likes.* FROM userdetails
  LEFT JOIN likes ON likes.userid = userdetails.userid WHERE postid='${postid}';`;
  const getPost = `SELECT userdetails.name, userdetails.username,posts.* FROM userdetails LEFT JOIN posts ON userdetails.userid = posts.userid WHERE postid='${postid}';`
  let isLikedByUser = false;
  let likeClass = "unliked";
  try {
    const resLike = await query(getLikes);
    const resPost = await query(getPost);
    const post = parseData(resPost)[0];
    const likes = parseData(resLike)
    const isLiked = likes.filter(like => {
      return like.userid == req.user.userid;
    })
    if(isLiked.length){
      isLikedByUser = true;
    }
    if(isLikedByUser){ likeClass = "liked"};
    if(resLike || resPost) {
      res.render("likes", { user: req.user, page: "likes", likes, post, isLikedByUser, likeClass });
    } else throw new Error();
  } catch (error) {
    res.status(400).json({error})
  }
});

Router.delete("/post/:postid", auth, async (req, res) => {
  const { postid } = req.params;
  const deletePost = `DELETE FROM posts WHERE postid='${postid}'`;
  try {
    const response = await query(deletePost);
    if(response.affectedRows > 0) res.status(200).json({msg: "Post deleted successfully"});
  } catch (e) {
    res.status(400).json({ msg: "An error occured. Please try again later." });
  }
});

Router.get("/post/:id/edit", auth, async (req, res) => {
  const postid = req.params.id;
  const getPost = `SELECT * FROM posts WHERE postid='${postid}' AND userid='${req.user.userid}'`;
  try {
    const response = await query(getPost);
    const {title, description} = response[0];
    res.render("create", {user: req.user, page: "create", title, description})
  } catch (error) {
    res.status(400).json();
  }
})


Router.patch("/post/:id", auth, async (req, res) => {
  const postid = req.params.id;
  const getPost = `SELECT * FROM posts WHERE postid='${postid}' AND userid='${req.user.userid}'`;
  try {
    const response = await query(getPost);
    const post = parseData(response)[0];
    const updatedPost = { ...post, ...req.body };
    if (updatedPost.userid === req.user.userid) {
      const { title, description } = updatedPost;
      const updatePost = `UPDATE posts SET title='${title}',description='${description}' WHERE postid='${postid}' AND userid='${req.user.userid}'`;
      const data = await query(updatePost);
      if (data.affectedRows > 0) res.status(200).json({ msg: "Post updated successfully.", postid });
    } else return new Error();
  } catch (e) {
    res.status(400).json({ msg: "An error occured" });
  }
});

Router.post("/search", auth, async (req, res) => {
  const searchQuery = req.body.query;
  const searchPost = `SELECT userdetails.name,userdetails.username,posts.* FROM userdetails LEFT JOIN posts ON userdetails.userid = posts.userid WHERE title LIKE '%${searchQuery}%' OR description LIKE '%${searchQuery}%'`;
  const searchUser = `SELECT userdetails.* FROM userdetails WHERE username LIKE '%${searchQuery}%' OR name LIKE '%${searchQuery}%'`;
  try {
    let posts = await query(searchPost);
    let users = await query(searchUser);
    posts.forEach((post) => {
      post.createdAt = convert(post.createdAt);
    });
    res.json({ posts, users });
  } catch (err) {
    res.status(400).json();
  }
})

module.exports = Router;
