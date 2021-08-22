const Router = require("express").Router();
const con = require("../database/database")
const util = require("util");
const cookieParser = require("cookie-parser");
const shortid = require("shortid");
const auth = require("../middleware/auth");
const { parse } = require("dotenv");
const bcrypt = require("bcryptjs");
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
        res.send(response);
    } catch (error) {
        res.status(400).json({msg: error})
    }
});

Router.get("/following/:id", auth, async (req, res) => {
    const {id} = req.params;
    const getFollowers = `SELECT userdetails.name, userdetails.userid FROM userdetails LEFT JOIN followers ON followerid = userdetails.userid WHERE followers.followingid = '${id}' ORDER BY followers.followedAt DESC;`
    try {
        const response = await query(getFollowers);
        res.send(response);
    } catch (error) {
        res.status(400).json({msg: error});
    }
});

Router.get("/users/:id", auth, async (req, res) => {
    const { id } = req.params;
    if (id === req.user.userid) {
      const response = req.user;
      response.isCurrentUser = true;
      res.render("profile", { page: "profile", user: req.user, profile: req.user });
    } else {
      const getPosts = `SELECT * FROM posts WHERE userid='${id}'`
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
        res.status(400).send(err);
      }
    }
  });

Router.post("/users/:id/edit", auth, async (req, res) => {
  const {name, username, email, password, newPassword, changeFor, isSaved} = req.body;
  const userid = req.params.id;
  const getUser = `SELECT * FROM userdetails WHERE userid='${userid}'`
  const getName = `SELECT name FROM userdetails WHERE name='${name}'`;
  const getUserName = `SELECT username FROM userdetails WHERE username='${username}'`;
  const getEmail = `SELECT email FROM userdetails WHERE email='${email}'`
  let check = {name: false, username: false, email: false}
  //changeFor = 0, then edit for details
  //else edit password
  try {
    const User = await query(getUser);
    let Name = await query(getName);
    let UserName = await query(getUserName);
    let Email = await query(getEmail);
    Name = parseData(Name);
    UserName = parseData(UserName);
    Email = parseData(Email);
    const userPw = parseData(User)[0]
    const validPass = await bcrypt.compare(password, userPw.password)
    if(changeFor == 0){
      
        if(Name.length > 0) check.name = true;
        if(UserName.length > 0) check.username = true;
        if(Email.length > 0) check.email = true;
       
        if(isSaved == 1){
          if(validPass){ 
            const UpdateUserDetails = `UPDATE userdetails SET name='${name}', username='${username}', email='${email}' WHERE userid='${userid}'`
            const updatedUser = await query(UpdateUserDetails);
            if(updatedUser.affectedRows > 0) res.status(201).json({msg: "Details Updated"})
            else throw new Error();
          } else throw new Error();
      } else res.status(201).json({check})
      
    } else {
      if(validPass && username == userPw.username){
        const hashPassword = await bcrypt.hash(newPassword, 10)
        const UpdateUserPassword = `UPDATE userdetails SET password='${hashPassword}' WHERE userid='${userid}'`
        const updatedPassword = await query(UpdateUserPassword);
        if(updatedPassword.affectedRows > 0){
          res.status(201).json({msg: "Password Updated"})
        } else throw new Error();
      } else throw new Error();

    }
    
  } catch (error) {
    console.log(error);
    res.status(400).json({msg: "An error has occured!"})
  }
    
  
})

Router.get("/logout", auth, (req, res) => {
  res.clearCookie("jwtToken");
  res.redirect("/");
})

module.exports = Router;