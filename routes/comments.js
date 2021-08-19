const Router = require("express").Router();
const util = require("util");
const con = require("../database/database");
const cookieParser = require("cookie-parser");
const shortid = require("shortid");
const auth = require("../middleware/auth");
const { parse } = require("dotenv");
Router.use(cookieParser());


const parseData = (x) => {
    return JSON.parse(JSON.stringify(x));
  };

const query = util.promisify(con.query).bind(con);

Router.post("/comment/:id", auth, async (req, res) => {
  const userid = req.user.userid;
  const postid = req.params.id;
  const commentid = shortid.generate();
  const {commented} = req.body;

  const createComment = `INSERT INTO comments (userid, postid, commentid, commented) VALUES ('${userid}', '${postid}', '${commentid}', '${commented}');`;
  
  try {
    const response = await query(createComment);
    if(response.affectedRows > 0){
      res.status(201).json({msg: "Commented Successful"});
    } else throw new Error();
  } catch (error) {
    console.log(error);
    res.status(400).json({msg: "An error occured, please try again"})
  }
})

Router.delete("/comment/:postid/:commentid", auth, async (req, res) => {
  const commentid = req.params.commentid;
  const postid = req.params.postid;
  const getComment = `SELECT * FROM comments WHERE commentid='${commentid}'`;
  const getPostOwner = `SELECT * FROM posts WHERE postid='${postid}'`;
  const deleteComment = `DELETE FROM comments WHERE commentid='${commentid}'`;
  try {
    const comment = await query(getComment);
    const commentOwner = comment[0].userid;
    const owner = await query(getPostOwner);
    const postOwner = owner[0].userid;
    if (req.user.userid == postOwner || req.user.userid == commentOwner) {
      const response = await query(deleteComment);
      if (response.affectedRows > 0) res.status(200).json({ msg: "Comment deleted" });
      else throw new Error();
    }
  } catch (e) {
    res.status(400).json();
  }
})




module.exports = Router;