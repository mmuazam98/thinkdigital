const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

const routes = require("./routes/routes");
app.use("/", routes);



const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
