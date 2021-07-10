const express = require("express");
const app = express();
const fs = require("fs");
const filename = "./db.json";
const util = require("util");
const writeFile = util.promisify(fs.writeFile);
const shortid = require("shortid");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const salt = 10;
const session = require("express-session");
const multer = require("multer");
const auth = require("./middleware/auth");
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

//! MULTER CONFIG
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/public/images");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".png");
  },
});
const upload = multer({ storage });
app.post(
  "/uploadfile",
  auth,
  upload.single("myFile"),
  (req, res) => {
    const file = req.file;
    let avatar = "/images/" + file.filename;
    let data = fs.readFileSync(filename);
    let db = JSON.parse(data);
    try {
      db.users.forEach(async (user) => {
        if (user.username == req.session.user.username) {
          user.avatar = avatar;
          await writeFile(filename, JSON.stringify(db, null, "\t"));
        }
      });
      res.status(200).json({ message: "Profile Updated Successfully" });
    } catch (err) {
      res.status(400).json();
    }
  },
  (error, req, res, next) => {
    res.status(400).json({ error: error.message });
  }
);

app.get("/about", (req, res) => {
  let isLoggedIn = false;
  if (req.session.user) {
    isLoggedIn = true;
    res.render("about", { page: "about", isLoggedIn, user: req.session.user });
  } else {
    res.render("about", { page: "about", isLoggedIn });
  }
});
app.get("/services", (req, res) => {
  let isLoggedIn = false;
  if (req.session.user) {
    isLoggedIn = true;
    res.render("services", { page: "services", isLoggedIn, user: req.session.user });
  } else {
    res.render("services", { page: "services", isLoggedIn });
  }
});

app.get("/profile", auth, (req, res) => {
  console.log(req.session.user);
  res.render("profile", { page: "profile", isLoggedIn: true, user: req.session.user });
});
//! signup post request

app.post("/signup", async (req, res) => {
  let data = fs.readFileSync(filename);
  let db = JSON.parse(data);
  let { name, username, email, password } = req.body;
  let userId = shortid.generate();
  let avatar = "/images/default.png";
  let checkEmail = db.users.map((user) => {
    return user.email == email;
  });
  let checkUsername = db.users.map((user) => {
    return user.username == username;
  });
  if (checkEmail.indexOf(true) > -1 || checkUsername.indexOf(true) > -1) {
    res.status(401).json({ message: "Already exists" });
  } else {
    try {
      let hashedPassword = await bcrypt.hash(password, salt);
      db.users.push({ userId, name, username, email, password: hashedPassword, avatar });
      await writeFile(filename, JSON.stringify(db, null, "\t"));
      req.session.user = {
        userId,
        email,
        name,
        username,
        avatar,
      };
      res.status(200).json({ message: "Account created successfully." });
    } catch (err) {
      res.status(400).json({});
    }
  }
});
app.post("/login", async (req, res) => {
  let data = fs.readFileSync(filename);
  let db = JSON.parse(data);
  let { username, password } = req.body;
  let user = db.users.filter((user) => {
    return user.username == username;
  });
  console.log(user);
  if (user.length) {
    let isMatch = await bcrypt.compare(password, user[0].password);
    if (isMatch) {
      console.log("Success");
      req.session.user = {
        userId: user[0].userId,
        email: user[0].email,
        name: user[0].name,
        username: user[0].username,
        avatar: user[0].avatar,
      };
      res.status(200).json({ message: "Login Successful" });
    } else {
      console.log("Invalid Password");
      res.status(400).json({ message: "Invalid Credentials" });
    }
  } else {
    res.status(400).json({ message: "Invalid Credentials" });
  }
});
app.post("/logout", auth, async (req, res) => {
  console.log("Logging out");
  await req.session.destroy();
  res.status(200).json({ message: "Logged out" });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server has started at http://localhost:" + PORT);
});
