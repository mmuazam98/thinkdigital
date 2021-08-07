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
  const getPost = `SELECT userdetails.name,userdetails.username,posts.* FROM userdetails LEFT JOIN posts ON userdetails.userid = posts.userid WHERE postid='${postid}'`;
  const getComments = `SELECT userdetails.userid, userdetails.name, comments.* FROM userdetails
   LEFT JOIN comments ON userdetails.userid = comments.userid WHERE comments.postid='${postid}' ORDER BY comments.postedAt DESC; `;
  try {
    const response = await query(getPost);
    let post = parseData(response)[0];
    let comments = await query(getComments);
    comments = parseData(comments);
    post.createdAt = convert(post.createdAt);
    comments.forEach((comment) => {
      comment.postedAt = calculateDifference(comment.postedAt);
    });
    // res.status(200).json({ post, comments });

    res.render("post", { page: "post", user: req.user, post, comments });
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

module.exports = Router;
