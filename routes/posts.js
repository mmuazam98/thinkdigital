const Router = require("express").Router();
const mysql = require("mysql");
const util = require("util");
const cookieParser = require("cookie-parser");
const shortid = require("shortid");
const auth = require("../middleware/auth");
const { parse } = require("dotenv");
Router.use(cookieParser());

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: "",
  database: process.env.DB_NAME,
});
con.connect();
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
      res.status(201).json({ msg: "Post created successfully" });
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
  const getPost = `SELECT * FROM posts WHERE userid='${req.user.userid}' AND postid='${req.params.id}'`;
  try {
    const response = await query(getPost);
    const post = parseData(response);
    res.status(200).send(post);
  } catch (e) {
    res.status(400).json({ msg: "An error occured. Please try again later." });
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
  const getPost = `SELECT * FROM posts WHERE postid='${postid}'`;
  console.log(getPost);
  try {
    const response = await query(getPost);
    const post = parseData(response)[0];
    res.json({ ...post, ...req.body });
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
