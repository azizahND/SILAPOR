const jwt = require ('jsonwebtoken')

function isLogin(req, res, next) {
  const token = req.cookies.token;


  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_TOKEN, function (err, decoded) {
      if (err) {
        return res
          .status(500)
          .send({
            auth: false,
            message: "Gagal untuk melakukan verifikasi token.",
          });
      }

    });
    console.log(token)
    if (req.userRole == "user") {
      return res.redirect("/mahasiswa/home");
    } else if (req.userRole == "admin") {
      return res.redirect("/admin/dashboard");
    }
  }

  next();
}

module.exports = isLogin;