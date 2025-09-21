const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


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
      isVerified: false,
    });

    // generate token verifikasi (berlaku 1 hari)
    const token = jwt.sign(
      { email: newUser.email },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: "1d" }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    // link verifikasi
    const verifyLink = `http://localhost:3000/verify-email?token=${token}`;

    // kirim email
    await transporter.sendMail({
      from: `"SILAPOR" <${process.env.EMAIL_USER}>`,
      to: newUser.email,
      subject: "Verifikasi Email Anda",
      html: `<h3>Halo ${newUser.nama}</h3>
             <p>Terima kasih sudah mendaftar. Klik link berikut untuk verifikasi akun:</p>
             <a href="${verifyLink}">${verifyLink}</a>`,
    });

    return res.render("checkEmail", { msg: "Registrasi berhasil, silakan cek email untuk verifikasi." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);

    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) return res.status(404).send("User tidak ditemukan");

    if (user.isVerified) {
      return res.render("login", { msg: "Akun sudah diverifikasi, silakan login." });
    }

    user.isVerified = true;
    await user.save();

    return res.render("registerDone", { msg: "Email berhasil diverifikasi, silakan login." });
  } catch (err) {
    console.error("Verify Email Error:", err);
    return res.status(400).send("Token tidak valid atau sudah kadaluarsa");
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).render("login",{ error: "Email atau Password salah!" });
    }

    if (!user.isVerified) {
      return res.status(401).render("login",{ error: "Email belum diverifikasi. Silakan cek email Anda." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).render("login", { error: "Email atau Password salah!" });
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
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


exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.redirect("/"); 
  } catch (err) {
    console.error("Error during logout: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// Tampilkan profil user
exports.showProfile = async (req, res) => {
  try {
    const userEmail = req.user.email; 
    const user = await User.findOne({ where: { email: userEmail } });

    if (!user) {
      return res.status(404).send("User tidak ditemukan");
    }

    res.render("profile", { user });
  } catch (err) {
    console.error("Error showProfile:", err);
    res.status(500).send("Gagal mengambil data profil");
  }
};

// Tampilkan form edit
exports.showEditProfile = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await User.findOne({ where: { email: userEmail } });

    if (!user) {
      return res.status(404).send("User tidak ditemukan");
    }

    res.render("editProfile", { user });
  } catch (err) {
    console.error("Error showEditProfile:", err);
    res.status(500).send("Gagal memuat form edit");
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { nama, email, alamat, no_hp, password, password_confirm } = req.body;

    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).send("User tidak ditemukan");
    }

    // Upload foto baru
    if (req.file) {
      if (user.foto && user.foto !== "default.jpg") {
        const oldPath = path.join(__dirname, "../public/uploads", user.foto);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      user.foto = req.file.filename;
    }

    // Update field
    user.nama = nama || user.nama;
    user.alamat = alamat || user.alamat;
    user.no_telepon = no_hp || user.no_telepon; 

    
    await user.save();
    
    // Redirect ke halaman profile setelah berhasil update
    return res.redirect("/profile");
  } catch (error) {
    console.error("Error update profile:", error);
    return res.status(500).send("Terjadi kesalahan saat update profile");
  }
};
