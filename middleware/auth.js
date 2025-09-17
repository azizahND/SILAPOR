const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const authenticateToken = (req, res, next) => {
  const secret = process.env.SECRET_TOKEN;

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.log("Invalid token", err);
      return res.status(403).json({ success: false, message: "Forbidden: Invalid token" });
    }

    req.user = user.user; // isi payload token (misalnya email, id, dll.)
    next();
  });
};

module.exports = { authenticateToken };
