const express = require("express");
const Router = express.Router();
const fs = require("fs");
const filename = "./db.json";
const util = require("util");
const writeFile = util.promisify(fs.writeFile);

Router.get("/login", (req, res) => {
  res.render("index");
});
Router.get("/", (req, res) => {
  let data = fs.readFileSync(filename);
  let movies = JSON.parse(data);
  movies = movies.movies;
  // console.log(req.session.user);
  let isLoggedIn = false;
  if (req.session.user) {
    isLoggedIn = true;
    res.render("home", { page: "home", isLoggedIn, user: req.session.user, movies });
  } else {
    res.render("home", { page: "home", isLoggedIn, movies });
  }
});
module.exports = Router;
