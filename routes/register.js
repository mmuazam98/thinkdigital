const Router = require("express").Router();
const util = require("util");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const shortid = require("shortid");
const bcrypt = require("bcryptjs");
const con = require("../database/database");
Router.use(cookieParser());

const parseData = (x) => {
  return JSON.parse(JSON.stringify(x));
};

const query = util.promisify(con.query).bind(con);


Router.post("/signup", async (req, res) => {
  const { name, username, email, password } = req.body;
  console.log(req.body);
  const userid = shortid.generate();
  const checkEmail = `SELECT * FROM userdetails WHERE email='${email}'`;
  const checkUsername = `SELECT * FROM userdetails WHERE username='${username}'`;
  try {
    const check1 = await query(checkEmail);
    const check2 = await query(checkUsername);
    if (parseData(check1).length == 0 && parseData(check2).length == 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const signup = `INSERT INTO userdetails (userid,name,username,email,password) VALUES ('${userid}','${name}','${username}','${email}','${hashedPassword}')`;
      const response = await query(signup);
      if (response.affectedRows > 0) {
        const payload = req.body;

        const token = jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("jwtToken", token, { httpOnly: true });
        res.status(201).json({ msg: "User created successfully" });
      }
    } else {
      res.status(400).json({ msg: "already exists" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "An error occured" });
  }
});

Router.post("/login", async (req, res) => {
  const { user, password, type } = req.body;
  // type 0 - email || type 1 - username
  try {
    if (type == 0) {
      //EMAIL LOGIN
      const login = `SELECT password FROM userdetails WHERE email='${user}'`;
      const response = await query(login);
      const userdetails = parseData(response)[0];
      const check = await bcrypt.compare(password, userdetails.password);
      if (check) {
        const payload = { userdetails };
        const token = jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("jwtToken", token, { httpOnly: true });
        res.status(200).json({ message: "Email login successful" });
      } else {
        throw new Error();
      }
    } else {
      //USERNAME LOGIN
      const login = `SELECT * FROM userdetails WHERE username='${user}'`;
      const response = await query(login);
      const userdetails = parseData(response)[0];
      const check = await bcrypt.compare(password, userdetails.password);
      if (check) {
        const payload = { userdetails };
        const token = jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("jwtToken", token, { httpOnly: true }); //maxAge: 60000,
        res.status(200).json({ message: "Username Login successful" });
      } else {
        throw new Error();
      }
    }
  } catch (e) {
    console.log(e);
    res.status(401).json({ message: "Invalid credentials" });
  }
});

module.exports = Router;
