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

Router.get("/users/:id", auth, async (req, res) => {
  const { id } = req.params;
  if (id === req.user.userid) {
    const response = req.user;
    response.isCurrentUser = true;
    res.render("profile", { page: "profile", user: req.user, profile: req.user });
  } else {
    const getProfile = `SELECT * FROM userdetails WHERE userid='${id}'`;
    const checkFollowing = `SELECT * FROM followers WHERE followingid='${req.user.userid}' AND followerid='${id}'`;
    try {
      let check = await query(checkFollowing);
      let isFollowing = false;
      if (check.length > 0) isFollowing = true;
      let response = await query(getProfile);
      response = response[0];
      delete response.password;
      response.isCurrentUser = false;
      response.isFollowing = isFollowing;
      res.render("profile", { page: "profile", user: req.user, profile: response });
    } catch (err) {
      res.status(400).send();
    }
  }
});
Router.get("/followers/:id", auth, async (req, res) => {
  const { id } = req.params;
  const getFollowers = `SELECT userdetails.name,userdetails.userid FROM userdetails LEFT JOIN followers ON followers.followingid=userdetails.userid WHERE followers.followerid='${id}' ORDER BY followers.followedAt DESC`;
  try {
    const response = await query(getFollowers);
    res.send(response);
  } catch (err) {
    res.status(400).send90;
  }
});
Router.get("/following/:id", auth, async (req, res) => {
  const { id } = req.params;
  const getFollowing = `SELECT userdetails.name,userdetails.userid FROM userdetails LEFT JOIN followers ON followers.followerid=userdetails.userid WHERE followers.followingid='${id}' ORDER BY followers.followedAt DESC`;
  try {
    const response = await query(getFollowing);
    res.send(response);
  } catch (err) {
    res.status(400).send90;
  }
});

Router.post("/logout", auth, async (req, res) => {
  res.clearCookie("jwtToken");
  res.status(200).json({ msg: "Logged out successfully" });
});
module.exports = Router;
