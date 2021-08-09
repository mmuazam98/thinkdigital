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

Router.post("/follow/:id", auth, async (req, res) => {
    const followerid = req.params.id;
    const followingid = req.user.userid;
    const followUser = `INSERT INTO followers(followerid, followingid) VALUES ('${followerid}', '${followingid}')`
    try {
        const response = await query(followUser);
        if(response.affectedRows > 0){
            res.status(201).json({ msg: "followed"});
        } else throw new Error();
    } catch (error) {
        res.status(400).json({msg: error})
    }
});

Router.post("/unfollow/:id", auth, async (req, res) => {
    const followerid = req.params.id;
    const followingid = req.user.userid;
    const unFollowUser = `DELETE FROM followers WHERE followerid='${followerid}' AND followingid='${followingid}'`
    try {
        const response = await query(unFollowUser);
        if(response.affectedRows > 0){
            res.status(201).json({ msg: "unfollowed"});
        } else throw new Error();
    } catch (error) {
        res.status(400).json({msg: error})
    }
});


module.exports = Router;