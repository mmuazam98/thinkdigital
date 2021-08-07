const Router = require("express").Router();
const util = require("util");
const cookieParser = require("cookie-parser");
const shortid = require("shortid");
const auth = require("../middleware/auth");
const con = require("../database/database");
require("dotenv").config();
Router.use(cookieParser());
const query = util.promisify(con.query).bind(con);

Router.post("/follow/:id", auth, async (req, res) => {
  const followerId = req.params.id;
  const followingId = req.user.userid;
  const followUser = `INSERT INTO followers (followerid,followingid) VALUES ('${followerId}','${followingId}')`;
  try {
    const response = await query(followUser);
    if (response.affectedRows > 0) {
      res.status(200).json({ msg: "Followed" });
    } else throw new Error();
  } catch (err) {
    res.status(400).json();
  }
});

Router.post("/unfollow/:id", auth, async (req, res) => {
  const followerId = req.params.id;
  const followingId = req.user.userid;
  const unfollowUser = `DELETE FROM followers WHERE followerid='${followerId}' AND followingid='${followingId}'`;
  try {
    const response = await query(unfollowUser);
    if (response.affectedRows > 0) {
      res.status(200).json({ msg: "Unfollowed" });
    } else throw new Error();
  } catch (err) {
    res.status(400).json();
  }
});

module.exports = Router;
