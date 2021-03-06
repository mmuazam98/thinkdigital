const express = require("express");
const app = express();
require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

const routes = require("./routes/routes");
const user = require("./routes/user");
const register = require("./routes/register");
const posts = require("./routes/posts");
const comments = require("./routes/comments");
const follow = require("./routes/follow");
const likes = require("./routes/likes")
app.use("/", routes);
app.use("/", user);
app.use("/", register);
app.use("/", posts);
app.use("/", comments);
app.use("/", follow);
app.use("/", likes)

app.use(function(req, res, next){
  res.status(404).render("404", {page: "home"})
})

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
