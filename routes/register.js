const Router = require("express").Router();
const util = require("util");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const shortid = require("shortid");
const bcrypt = require("bcryptjs");
const con = require("../database/database");
Router.use(cookieParser());

// FUNCTION TO PARSE YOUR SQL RESPONSES
const parseData = (x) => {
  return JSON.parse(JSON.stringify(x));
};
// HANDLE PROMISES
const query = util.promisify(con.query).bind(con);

// SIGNUP ROUTE
Router.post("/signup", async (req, res) => {
  // USE DESTRUCTURING TO GET VALUES FROM POSTMAN
  const { name, username, email, password } = req.body;
  console.log(req.body);
  // GENERATE A UNIQUE ID
  const userid = shortid.generate();

  // QUERY FOR CHECKING UNIQUENESS OF EMAIL
  const checkEmail = `SELECT * FROM userdetails WHERE email='${email}'`;
  // QUERY FOR CHECKING UNIQUENESS OF USERNAME
  const checkUsername = `SELECT * FROM userdetails WHERE username='${username}'`;
  try {
    // EXECUTE THE ABOVE MENTIONED QUERIES
    const check1 = await query(checkEmail);
    const check2 = await query(checkUsername);
    // console.log(check1, check2);
    //CHECK IF THE EMAIL AND USERNAME ARE UNIQUE
    if (parseData(check1).length == 0 && parseData(check2).length == 0) {
      // SIGNUP QUERY
      const hashedPassword = await bcrypt.hash(password, 10);
      const signup = `INSERT INTO userdetails (userid,name,username,email,password) VALUES ('${userid}','${name}','${username}','${email}','${hashedPassword}')`;
      // EXECUTE THE SIGNUP QUERY
      const response = await query(signup);
      // CHECK THE NUMBER OF AFFECTED ROWS
      if (response.affectedRows > 0) {
        const payload = req.body;

        const token = jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("jwtToken", token, { httpOnly: true });
        res.status(201).json({ msg: "User created successfully" });
      }
    } else {
      res.status(400).json({ msg: "already exists" });
    }
    // res.json({ check1, check2 });
  } catch (err) {
    res.status(400).json({ msg: "An error occured" });
  }
});

// LOGIN ROUTE
Router.post("/login", async (req, res) => {
  // GET VALUES FROM POSTMAN
  const { user, password, type } = req.body;
  // type 0 - email || type 1 - username
  try {
    // CHECK TYPE
    if (type == 0) {
      //EMAIL LOGIN
      // EMAIL LOGIN QUERY
      const login = `SELECT password FROM userdetails WHERE email='${user}'`;
      const response = await query(login);
      // TASK 1: COMPLETE THIS PART i.e COMPLETE THE JWT.SIGN AND COOKIE PART HERE AS WELL
      // res.json({ response });

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
      // USERNAME LOGIN QUERY
      const login = `SELECT * FROM userdetails WHERE username='${user}'`;
      const response = await query(login);
      // STORE THE USERDETAILS IN VARIABLE FOR EASY ACCESS
      const userdetails = parseData(response)[0];
      // COMPARE PASSWORD

      const check = await bcrypt.compare(password, userdetails.password);
      console.log(password, userdetails.password);
      if (check) {
        // STORE USERDETAILS IN PAYLOAD
        const payload = { userdetails };
        // GENERATE TOKEN
        const token = jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: "1d" });
        //STORE TOKEN IN COOKIE
        res.cookie("jwtToken", token, { httpOnly: true }); //maxAge: 60000,
        res.status(200).json({ message: "Username Login successful" });
      } else {
        throw new Error();
      }
    }
  } catch (e) {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

module.exports = Router;
