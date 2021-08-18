const Router = require("express").Router();
const util = require("util");
const cookieParser = require("cookie-parser");
const auth = require("../middleware/auth");
const con = require("../database/database");
Router.use(cookieParser());

const parseData = (x) => {
  return JSON.parse(JSON.stringify(x));
};
const convert = (datetime) => {
  let created_date = new Date(datetime);
  let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let year = created_date.getFullYear();
  let month = months[created_date.getMonth()];
  let date = created_date.getDate();

  let time = date + ", " + month + " " + year;
  return time;
};
const query = util.promisify(con.query).bind(con);
Router.get("/", async (req, res) => {
  if(req.user) res.render("home", { page: "index", user: req.user });
  else res.render("index", { page: "index" });
});

Router.get("/home", auth, async (req, res) => {
  console.log(req.user);
  const getPosts = `SELECT userdetails.username,userdetails.name,posts.* FROM userdetails LEFT JOIN posts ON posts.userid=userdetails.userid WHERE posts.postid IS NOT NULL; `;
  try {
    const response = await query(getPosts);
    let posts = parseData(response);
    posts.forEach((post) => {
      post.createdAt = convert(post.createdAt);
    });
    res.render("home", { user: req.user, page: "home", posts });
  } catch (err) {
    res.status(400);
  }
});
Router.get("/create", auth, async (req, res) => {
  res.render("create", { user: req.user, page: "create" });
});
Router.get("/search", auth, async (req, res) => {
  res.render("search", { user: req.user, page: "search" });
});
Router.get("/terms", auth, async (req, res) => {
  res.render("terms", { user: req.user, page: "terms" });
});
Router.get("/about", auth, async (req, res) => {
  res.render("about", { user: req.user, page: "about" });
});
module.exports = Router;
