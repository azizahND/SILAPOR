const jwt = require("jsonwebtoken");

exports.verifyUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Invalid token:", err);
    res.clearCookie("token");
    return res.redirect("/login");
  }
};
