console.log("test database.js")
const mysql = require("mysql");

require("dotenv").config();

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWD,
    database: process.env.DB_NAME,
  });
//   const con = mysql.createConnection({
//     host: process.env.DB_HOST_LOCAL,
//     user: process.env.DB_USER_LOCAL,
//     password: "",
//     database: process.env.DB_NAME_LOCAL,
//   });
// con.connect();

module.exports = con;