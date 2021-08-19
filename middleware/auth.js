const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.cookies.jwtToken;
  if (!token) return res.status(404).json({ msg: "No auth token! Please authorise." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.payload.userdetails;
    delete req.user.password;
    next();
  } catch (e) {
    return res.status(400).json({ msg: "Token expired" });
  }
};
module.exports = auth;
