const mysql = require("mysql");

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: "",
    database: process.env.DB_NAME,
  });
con.connect();

module.exports = con;