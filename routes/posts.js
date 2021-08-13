const Router = require("express").Router();
const util = require("util");
const cookieParser = require("cookie-parser");
const shortid = require("shortid");
const auth = require("../middleware/auth");
const con = require("../database/database");
require("dotenv").config();
Router.use(cookieParser());

const parseData = (x) => {
  return JSON.parse(JSON.stringify(x));
};

const query = util.promisify(con.query).bind(con);

const convert = (datetime) => {
  let created_date = new Date(datetime);
  let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let year = created_date.getFullYear();
  let month = months[created_date.getMonth()];
  let day = created_date.getDate();
  let date = `${day}, ${month} ${year}`;
  return date;
};

const calculateDifference = (datetime) => {
  const date1 = new Date(datetime);
  const date2 = new Date();
  const diffTime = Math.abs(date1 - date2);
  const diffMin = Math.floor(diffTime / (1000 * 60));
  const diffHrs = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) {
    if (diffMin < 60) return diffMin + "m";
    else return diffHrs + "h";
  } else if (diffDays < 7) return diffDays + "d";
  else return Math.floor(diffDays / 7) + "w";
};

// create a post
Router.post("/post", auth, async (req, res) => {
  const userid = req.user.userid;
  const postid = shortid.generate();
  const { title, description } = req.body;
  const createPost = `INSERT INTO posts (userid,postid,title,description) VALUES ('${userid}','${postid}','${title}','${description}')`;
  try {
    const response = await query(createPost);
    console.log(response);
    if (response.affectedRows > 0) {
      res.status(201).json({ msg: "Post created successfully", postid });
    } else throw new Error();
  } catch (e) {
    res.status(400).json({ msg: "An error occured. Please try again later." });
  }
});

// get posts by a user
Router.get("/posts/:id", auth, async (req, res) => {
  const getPosts = `SELECT * FROM posts WHERE userid='${req.params.id}' ORDER BY posts.createdAt DESC`;
  try {
    const response = await query(getPosts);
    const posts = parseData(response);
    res.status(200).send(posts);
  } catch (e) {
    res.status(400).json({ msg: "An error occured. Please try again later." });
  }
});

// get a post & it's comments
Router.get("/post/:id", auth, async (req, res) => {
  const postid = req.params.id;
  console.log(postid);
  const getPost = `SELECT userdetails.name,userdetails.username,posts.* FROM userdetails LEFT JOIN posts ON userdetails.userid = posts.userid WHERE postid='${postid}'`;
  const getComments = `SELECT userdetails.userid,userdetails.name, comments.* FROM userdetails LEFT JOIN comments ON userdetails.userid = comments.userid WHERE 
  comments.postid='${postid}' ORDER BY postedAt DESC; `;
  try {
    const response = await query(getPost);
    let post = parseData(response)[0];
    let comments = await query(getComments);
    comments.forEach((comment) => {
      comment.postedAt = calculateDifference(comment.postedAt);
    });
    console.log(comments);
    post.createdAt = convert(post.createdAt);
    res.status(200).json({ post, comments });
  } catch (e) {
    res.status(400).json({ msg: "An error occured. Please try again later." });
  }
});

// delete a post
Router.delete("/post/:postid", auth, async (req, res) => {
  const { postid } = req.params;
  const deletePost = `DELETE FROM posts WHERE postid='${postid}' AND userid='${req.user.userid}'`;
  try {
    const response = await query(deletePost);
    console.log(response);
    if (response.affectedRows > 0) res.status(200).json({ msg: "Post deleted successfully" });
  } catch (e) {
    res.status(400).json({ msg: "An error occured. Please try again later." });
  }
});

// edit post route
Router.get("/post/:id/edit", auth, async (req, res) => {
  const postid = req.params.id;
  const getPost = `SELECT * FROM posts WHERE postid='${postid}' AND userid='${req.user.userid}'`;
  try {
    const response = await query(getPost);
    const { title, description } = response[0];
    res.render("create", { user: req.user, page: "create", title, description });
  } catch (err) {
    res.status(400).json();
  }
});

// update a post
Router.patch("/post/:id", auth, async (req, res) => {
  const postid = req.params.id;
  req.body.postid = postid;
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
  const searchPost = `SELECT userdetails.username,userdetails.name,posts.* FROM userdetails LEFT JOIN posts ON userdetails.userid=posts.userid WHERE title LIKE '%${searchQuery}%' OR description LIKE '%${searchQuery}%'; `;
  const searchUser = `SELECT * FROM userdetails WHERE username LIKE '%${searchQuery}%' OR name LIKE '%${searchQuery}%'`;
  try {
    let posts = await query(searchPost);
    let users = await query(searchUser);
    posts.forEach((post) => {
      post.createdAt = convert(post.createdAt);
    });
    res.json({ posts, users });
  } catch (err) {
    res.status(400);
  }
});

module.exports = Router;
