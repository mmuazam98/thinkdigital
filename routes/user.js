const Router = require("express").Router();
const util = require("util");
const cookieParser = require("cookie-parser");
const shortid = require("shortid");
const auth = require("../middleware/auth");
const con = require("../database/database");
require("dotenv").config();
Router.use(cookieParser());
const query = util.promisify(con.query).bind(con);

Router.get("/followers/:id", auth, async (req, res) => {
  const { id } = req.params;
  const getFollowers = `SELECT userdetails.name,userdetails.userid,userdetails.username FROM userdetails LEFT JOIN followers ON followers.followingid=userdetails.userid WHERE followers.followerid='${id}' ORDER BY followers.followedAt DESC`;
  try {
    const response = await query(getFollowers);
    res.send(response);
  } catch (err) {
    res.status(400);
  }
});

Router.get("/following/:id", auth, async (req, res) => {
  const { id } = req.params;
  const getFollowers = `SELECT userdetails.name,userdetails.userid,userdetails.username FROM userdetails LEFT JOIN followers ON followers.followerid=userdetails.userid WHERE followers.followingid='${id}' ORDER BY followers.followedAt DESC`;
  try {
    const response = await query(getFollowers);
    res.send(response);
  } catch (err) {
    res.status(400);
  }
});

Router.post("/logout", auth, (req, res) => {
  res.clearCookie("jwtToken");
  res.status(200).json({ msg: "logged out" });
});
module.exports = Router;
