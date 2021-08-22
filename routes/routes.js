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
    const posts = parseData(response);

    posts.forEach(async (post, index) => {
      
      post.createdAt = convert(post.createdAt);
      const getLikes = `SELECT userdetails.userid, userdetails.username, userdetails.name, likes.* FROM userdetails
      LEFT JOIN likes ON likes.userid = userdetails.userid WHERE postid='${post.postid}';`;
      const getLike = `SELECT * FROM likes WHERE postid = '${post.postid}' AND userid ='${req.user.userid}'`
      const likes = await query(getLike);
      const allLikes = await query(getLikes);

      if(likes.length > 0) post["isLikedByUser"] = true;
      else post["isLikedByUser"] = false
      post["likes"] = allLikes.length;

      if(index == posts.length - 1){
        res.render("home", { user: req.user, page: "home", posts });
      } 
    });
    if(posts.length === 0) res.render("home", { user: req.user, page: "home", posts });

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
Router.get("/users/edit", auth, async (req, res) => {
  res.render("edit", {user: req.user, page: "edit"})
})
module.exports = Router;
