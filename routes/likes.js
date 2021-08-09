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

Router.post("/like/:id",auth,  async (req, res) => {
    const userid = req.user.userid;
    const postid = req.params.id;
    const likePost = `INSERT INTO likes (postid, userid) VALUES ('${postid}', '${userid}')`;

    try {
        const response = await query(likePost);
        if(response.affectedRows > 0){
            res.status(201).json({msg: "post liked", postid});
        } else throw new Error();
    } catch (error) {
        console.log(error);
        res.status(400).json({msg: "An error occured!"});
    }
});

Router.post("/unlike/:id", auth,  async (req, res) => {
    console.log("hi")
    const userid = req.user.userid;
    const postid = req.params.id;
    const unLikePost = `DELETE FROM likes WHERE postid='${postid}' AND userid='${userid}'`;

    try {
        const response = await query(unLikePost);
        if(response.affectedRows > 0){
            res.status(201).json({msg: "post unliked", postid});
        } else throw new Error();
    } catch (error) {
        console.log(error);
        res.status(400).json({msg: "An error occured!"});
    }
});



module.exports = Router;