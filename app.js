const express = require("express");
const app = express();
const mysql = require("mysql");
const util = require("util");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const shortid = require("shortid");
require("dotenv").config();
app.use(express.json());
app.use(cookieParser());

// CONNECT TO YOUR SQL
const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: "",
  database: process.env.DB_NAME,
});
con.connect();

// FUNCTION TO PARSE YOUR SQL RESPONSES
const parseData = (x) => {
  return JSON.parse(JSON.stringify(x));
};
// HANDLE PROMISES
const query = util.promisify(con.query).bind(con);

app.get("/", async (req, res) => {
  const myquery = "SELECT * FROM `userdetails` WHERE username='mm9084'";
  //   con.query(myquery, (err, results) => {
  //     if (err) throw new Error();
  //     console.log(parseData(results));
  //     res.end();
  //   });
  const results = await query(myquery);
  console.log(parseData(results));
  res.end();
});

app.post("/test", (req, res) => {
  const payload = req.body;
  //GENERATE A TOKEN USING JWT.SIGN
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1m" });
  //STRORE THE TOKEN IN COOKIE
  res.cookie("jwtToken", token, { httpOnly: true });
  res.json({ payload, token });
});
app.get("/home", (req, res) => {
  // GET THE TOKEN FROM COOKIE
  const token = req.cookies.jwtToken;
  // CHECK IF IT EXISTS OR NOT
  if (!token) return res.status(401).json({ msg: "No token, please authorize" });
  //INCASE IT DOES EXIST
  try {
    // DECODE THE TOKEN USING JSON.VERIFY
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // DECODED TOKEN WILL BE STORE IN VARIABLE WITH ALL THE DECRYPTED VALUES THAT WERE ENCRYPTED IN JWT.SIGN
    res.status(200).json({ msg: "Token verified", decodedToken });
  } catch (err) {
    res.status(400).json({ msg: "Your token has expired. Please login again" });
  }
});

// SIGNUP ROUTE
app.post("/signup", async (req, res) => {
  // USE DESTRUCTURING TO GET VALUES FROM POSTMAN
  const { name, username, email, password, age } = req.body;
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
    //CHECK IF THE EMAIL AND USERNAME ARE UNIQUE
    if (parseData(check1).length == 0 && parseData(check2).length == 0) {
      // SIGNUP QUERY
      const signup = `INSERT INTO userdetails (userid,name,username,email,password,age) VALUES ('${userid}','${name}','${username}','${email}','${password}','${age}')`;
      // EXECUTE THE SIGNUP QUERY
      const response = await query(signup);
      // CHECK THE NUMBER OF AFFECTED ROWS
      if (response.affectedRows > 0) {
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
app.post("/login", async (req, res) => {
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
      res.json({ response });
    } else {
      //USERNAME LOGIN
      // USERNAME LOGIN QUERY
      const login = `SELECT * FROM userdetails WHERE username='${user}'`;
      const response = await query(login);
      console.log(parseData(response));
      // STORE THE USERDETAILS IN VARIABLE FOR EASY ACCESS
      const userdetails = parseData(response)[0];
      // COMPARE PASSWORD
      if (userdetails.password === password) {
        // STORE USERDETAILS IN PAYLOAD
        const payload = { userdetails };
        // GENERATE TOKEN
        const token = jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: "1m" });
        //STORE TOKEN IN COOKIE
        res.cookie("jwtToken", token, { httpOnly: true }); //maxAge: 60000,
        res.status(200).json({ message: "Login successful" });
      } else {
        throw new Error();
      }
    }
  } catch (e) {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server is running at PORT:5000");
});
