const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

const routes = require("./routes/routes");
const posts = require("./routes/posts");
const comments = require("./routes/comments");
const follow = require("./routes/follow");
const user = require("./routes/user");
const likes = require("./routes/likes");
app.use("/", routes);
app.use("/", posts);
app.use("/", comments);
app.use("/", follow);
app.use("/", user);
app.use("/", likes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
