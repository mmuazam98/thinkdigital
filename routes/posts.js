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

Router.post("/post", auth, async (req, res) => {
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

Router.get("/posts", auth, async (req, res) => {
  const getPosts = `SELECT * FROM posts WHERE userid='${req.user.userid}'`;
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
  const getPost = `SELECT userdetails.name,posts.* FROM userdetails LEFT JOIN posts ON userdetails.userid = posts.userid WHERE postid='${postid}'`;
  const getComments = `SELECT userdetails.userid, userdetails.name, comments.* FROM userdetails
   LEFT JOIN comments ON userdetails.userid = comments.userid WHERE comments.postid='${postid}' ORDER BY comments.commenttime DESC; `;
  const getLikes = `SELECT userdetails.userid, userdetails.username, userdetails.name, likes.* FROM userdetails
  LEFT JOIN likes ON likes.userid = userdetails.userid WHERE postid='${postid}';`;
  try {
    const response = await query(getPost);
    const post = parseData(response)[0];
    let comments = await query(getComments);
    let likes = await query(getLikes);
    comments = parseData(comments);
    res.status(200).json({ post, comments, likes: likes.length });
  } catch (e) {
    res.status(400).json({ msg: "An error occured. Please try again later." });
  }
});

Router.post("/post/:postid/likes", auth, async (req, res) => {
  const postid = req.params.postid;
  const getLikes = `SELECT userdetails.userid, userdetails.username, userdetails.name, likes.* FROM userdetails
  LEFT JOIN likes ON likes.userid = userdetails.userid WHERE postid='${postid}';`;
  try {
    const response = await query(getLikes);
    if(response) {
      res.status(200).send({response})
    } else throw new Error();
  } catch (error) {
    res.status(400).json({msg: error})
  }
});

Router.delete("/post", auth, async (req, res) => {
  const { postid } = req.body;
  const deletePost = `DELETE FROM posts WHERE postid='${postid}'`;
  try {
    const response = await query(deletePost);
    res.send(response);
  } catch (e) {
    res.status(400).json({ msg: "An error occured. Please try again later." });
  }
});
Router.patch("/post", auth, async (req, res) => {
  const { postid } = req.body;
  const userid = req.user.userid;
  const getPost = `SELECT * FROM posts WHERE postid='${postid}'`;
  try {
    const response = await query(getPost);
    const post = parseData(response)[0];
    if(userid === post.userid){
      const editedPost = { ...post, ...req.body };
      const editPost = `UPDATE posts SET title='${editedPost.title}', description='${editedPost.description}' WHERE postid='${postid} AND userid='${userid}''`;
      const editedResponse = await query(editPost);
      if(editedResponse.affectedRows > 0){
        res.status(200).json({msg: "Post updated successfully"});
      } else throw new Error();
    } else res.status(401).json({msg: "Invalid credentials, editing other user posts not allowed"})
  } catch (e) {
    res.status(400).send();
  }
});

// const a = {
//   name: "Muazam",
//   age: 17,
// };
// const b = {
//   age: 20,
// };
// const c = { ...a, ...b };
// console.log(c);

module.exports = Router;
