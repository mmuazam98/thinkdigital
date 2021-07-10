const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server has started at http://localhost:" + PORT);
});
