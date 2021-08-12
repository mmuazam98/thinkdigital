const Router = require("express").Router();
const con = require(".../database/database")
const util = require("util");
const cookieParser = require("cookie-parser");
const shortid = require("shortid");
const auth = require("../middleware/auth");
const { parse } = require("dotenv");
Router.use(cookieParser());

const parseData = (x) => {
    return JSON.parse(JSON.stringify(x));
  };

const query = util.promisify(con.query).bind(con);


Router.get("/followers/:id", auth, async (req, res) => {
    const {id} = req.params;
    const getFollowers = `SELECT userdetails.name, userdetails.userid, userdetails.username FROM userdetails LEFT JOIN followers ON followingid = userdetails.userid WHERE followers.followerid = '${id}' ORDER BY followers.followedAt DESC;`
    try {
        const response = await query(getFollowers);
        res.status(201).json({msg: response})
    } catch (error) {
        res.status(400).json({msg: error})
    }
});

Router.get("/following/:id", auth, async (req, res) => {
    const {id} = req.params;
    const getFollowers = `SELECT userdetails.name, userdetails.userid FROM userdetails LEFT JOIN followers ON followerid = userdetails.userid WHERE followers.followingid = '${id}' ORDER BY followers.followedAt DESC;`
    try {
        const response = await query(getFollowers);
        res.status(201).json({msg: response})
    } catch (error) {
        res.status(400).json({msg: error});
    }
});


module.exports = Router;