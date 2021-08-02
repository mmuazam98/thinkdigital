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

const parseData = (x) => {
    return JSON.parse(JSON.stringify(x));
  };

const query = util.promisify(con.query).bind(con);

Router.post("/comment/:id", auth, async (req, res) => {
  const userid = req.user.userid;
  const commentid = shortid.generate();
  const {commented} = req.body;

  const createComment = `INSERT INTO comments (userid, postid, commentid, commented) VALUES
  ('${userid}', '${req.params.id}', '${commentid}', '${commented}')`;
  
  try {
    const response = await query(createComment);
    if(response.affectedRows > 0){
      res.status(201).json({msg: "Commented Successful"});
    } else throw new Error();
  } catch (error) {
    res.status(400).json({msg: "An error occured, please try again"})
  }
})

Router.delete("/comment/:commentid", auth, async (req, res) => {
  const userid = req.user.userid;
  const deleteComment = `DELETE FROM comments WHERE userid='${userid}' AND commentid='${req.params.commentid}'`;
  try {
    const response = await query(deleteComment);
   if(response.affectedRows > 0){
     res.status(200).json({msg: "Comment Deleted Successfully"})
   } else throw new Error();
  } catch (error) {
    res.status(400).json({msg: "An error has occured, please try again"})
  }
})

Router.patch("/comment/:commentid", auth, async (req, res) => {
  const getComment = `SELECT * FROM comments WHERE commentid='${req.params.commentid}'`;
  const userid = req.user.userid;
  try{
    const response = await query(getComment);
    const comment = parseData(response)[0];
    if(userid === comment.userid){
      const editedComment = {...comment, ...req.body};
      const editComment = `UPDATE comments SET commented='${editedComment.commented}' WHERE commentid='${req.params.commentid} AND userid='${userid}''`;
      const editedResponse = await query(editComment);
      if(editedResponse.affectedRows > 0){
        res.status(200).json({ msg: "Comment edited successfully"})
      } else throw new Error();
    } else res.status(401).json({msg: "Invalid credentials, editing other user comments not allowed"})
  } catch (error) {
    res.send(400).json({msg: "an error occured, please try again"})
  }
})




module.exports = Router;