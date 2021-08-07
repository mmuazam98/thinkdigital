const jwt = require("jsonwebtoken");
// auth middleware function
const auth = (req, res, next) => {
  const token = req.cookies.jwtToken;
  if (!token) {
    return res.redirect("/");
    // return res.status(404).json({ msg: "No auth token! Please authorise." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.payload.userdetails;
    delete req.user.password;
    // console.log(req.user);
    next();
  } catch (e) {
    return res.redirect("/");
    // return res.status(400).json({ msg: "Token expired" });
  }
};
module.exports = auth;
