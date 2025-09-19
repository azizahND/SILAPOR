const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.cookies.token;
  
  if (!token) {
    return res.redirect("/");
  }
  
  jwt.verify(token, process.env.JWT_SECRET_TOKEN, function(err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Gagal untuk melakukan verifikasi token.' });
    }
    
    req.user = decoded; 
    next();
  });
}

module.exports = verifyToken;