require("dotenv").config();
const mysql = require("mysql");
// CONNECT TO YOUR SQL
const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: "",
  database: process.env.DB_NAME,
});

module.exports = con;
