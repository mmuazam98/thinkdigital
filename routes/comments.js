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

Router.post("/comment/:id", auth, async (req, res) => {
  const postid = req.params.id;
  const comment = req.body.comment;
  const addComment = `INSERT INTO comments (userid,postid,commentid,comment) VALUES ('${req.user.userid}','${postid}','${shortid.generate()}','${comment}')`;
  try {
    const response = await query(addComment);
    if (response.affectedRows > 0) res.status(201).json({ msg: "Comment posted" });
    else throw new Error();
  } catch (err) {
    res.status(400).json();
  }
});

Router.delete("/comment/:postid/:commentid", auth, async (req, res) => {
  const { postid, commentid } = req.params;
  const getCommentOwner = `SELECT userid FROM comments WHERE commentid='${commentid}'`;
  const getPostOwner = `SELECT userid FROM posts WHERE postid='${postid}'`;
  try {
    const comment = await query(getCommentOwner);
    const commentOwner = comment[0].userid;
    const owner = await query(getPostOwner);
    const postOwner = owner[0].userid;
    if (req.user.userid == postOwner || req.user.userid == commentOwner) {
      const deleteComment = `DELETE FROM comments WHERE commentid='${commentid}'`;
      const response = await query(deleteComment);
      if (response.affectedRows > 0) res.status(200).json({ msg: "Comment deleted" });
    }
  } catch (err) {
    res.status(400).json();
  }
});

module.exports = Router;
