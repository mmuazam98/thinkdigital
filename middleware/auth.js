const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.cookies.jwtToken;
  if (!token) return res.redirect("/");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.payload.userdetails;
    delete req.user.password;
    return next();
  } catch (e) {
    return res.redirect("/");
  }
};
module.exports = auth;
