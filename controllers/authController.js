const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { nama, email, no_telepon, alamat, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email sudah terdaftar." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      nama,
      email,
      no_telepon,
      alamat,
      role: "user",
      password: hashedPassword,
    });
    const payload = {
      user: {
        email: newUser.email,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.render("login", { msg: "Registrasi berhasil. Silakan login." });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("User Not Found!");
      return res.status(404).render("login",{ title:"Express", error: "Email atau Passward salah! Silahkan coba lagi" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).render("login", { title: "Express",layout:false, error: "Email atau Passward salah! Silahkan coba lagi" });
    }

    const token = jwt.sign(
      { email: user.email, role : user.role},
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: 86400 }
    );


    res.cookie("token", token, { httpOnly: true });


    if (user.role === "user") {
      return res.redirect("/mahasiswa/home");
    } else if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }


    res.status(200).send({ auth: true, token: token });

  } catch (err) {
    console.error("Error during login: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
