const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

const routes = require("./routes/routes");
const posts = require("./routes/posts");
app.use("/", routes);
app.use("/", posts);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
