const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const authenticateToken = (req, res, next) => {
  const secret = process.env.SECRET_TOKEN;

  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token provided");
    return res.sendStatus(401); 
  }

  // Verifikasi token
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.log("Invalid token", err); 
      return res.sendStatus(403); 
    }

    req.user = user.user; 
    next(); 
  });
};

module.exports = { authenticateToken };
