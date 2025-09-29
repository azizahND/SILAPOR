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


    // generate token verifikasi (berlaku 15 menit, unik per user)
    const crypto = require('crypto');
    const rawToken = crypto.randomBytes(32).toString('hex');
    const token = jwt.sign(
      { email: email, rawToken },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: "15m" }
    );

    // simpan token ke user
    const newUser = await User.create({
      nama,
      email,
      no_telepon,
      alamat,
      role: "user",
      password: hashedPassword,
      isVerified: false,
      emailVerifyToken: rawToken,
      emailVerifyTokenUsed: false,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    // link verifikasi
    const verifyLink = `http://localhost:3000/verify-email?token=${token}`;

    // Render email template
    const ejs = require('ejs');
    const path = require('path');
    const emailTemplatePath = path.join(__dirname, '../email/emailRegis.ejs');
    const emailHtml = await ejs.renderFile(emailTemplatePath, {
      nama: newUser.nama,
      verifyLink
    });

    // kirim email
    await transporter.sendMail({
      from: `"SILAPOR" <${process.env.EMAIL_USER}>`,
      to: newUser.email,
      subject: "Verifikasi Email Anda",
      html: emailHtml,
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
    // cek token cocok dan belum dipakai
    if (user.isVerified) {
      return res.render("login", { msg: "Akun sudah diverifikasi, silakan login." });
    }
    if (user.emailVerifyTokenUsed || user.emailVerifyToken !== decoded.rawToken) {
      return res.status(400).send("Token sudah dipakai atau tidak valid.");
    }
    // verifikasi sukses, tandai token sudah dipakai
    user.isVerified = true;
    user.emailVerifyTokenUsed = true;
    user.emailVerifyToken = null;
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

// Forget Password
exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render("forgetPassword", { error: "Email tidak terdaftar." });
    }

    // generate token reset password (berlaku 15 menit, unik per user)
    const crypto = require('crypto');
    const rawToken = crypto.randomBytes(32).toString('hex');
    const token = jwt.sign(
      { email: user.email, rawToken },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: "15m" }
    );
    // simpan token ke user
    user.resetPasswordToken = rawToken;
    user.resetPasswordTokenUsed = false;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // link reset password
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    // kirim email
    await transporter.sendMail({
      from: `"SILAPOR" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Password SILAPOR",
      html: `<h3>Halo ${user.nama}</h3>
             <p>Klik link berikut untuk reset password akun Anda:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    return res.render("forgetPassword", { success: "Link reset password sudah dikirim ke email Anda." });
  } catch (err) {
    console.error("Forget Password Error:", err);
    res.status(500).send("Server Error");
  }
};

// Show Reset Password Form
exports.showResetPasswordForm = async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) return res.status(404).send("User tidak ditemukan");
    // cek token cocok dan belum dipakai
    if (user.resetPasswordTokenUsed || user.resetPasswordToken !== decoded.rawToken) {
      return res.status(400).send("Token sudah dipakai atau tidak valid.");
    }
    // Token valid, render form
    return res.render("resetPassword", { token });
  } catch (err) {
    console.error("Reset Password Token Error:", err);
    return res.status(400).send("Token tidak valid atau sudah kadaluarsa");
  }
};

// Handle Reset Password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) {
      return res.status(404).send("User tidak ditemukan");
    }
    // cek token cocok dan belum dipakai
    if (user.resetPasswordTokenUsed || user.resetPasswordToken !== decoded.rawToken) {
      return res.status(400).send("Token sudah dipakai atau tidak valid.");
    }
    // Validasi password kuat
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPassword.test(password)) {
      return res.render("resetPassword", { token, error: "Password harus minimal 8 karakter dan kombinasi huruf, angka, simbol." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    user.resetPasswordTokenUsed = true;
    user.resetPasswordToken = null;
    await user.save();
    return res.render("resetPasswordDone", { msg: "Password berhasil direset. Silakan login." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(400).send("Token tidak valid atau sudah kadaluarsa");
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
    const { nama, email, alamat, no_telepon, password, password_confirm } = req.body;

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
    user.no_telepon = no_telepon || user.no_telepon; 

    
    await user.save();
    
    // Redirect ke halaman profile setelah berhasil update
    return res.redirect("/profile");
  } catch (error) {
    console.error("Error update profile:", error);
    return res.status(500).send("Terjadi kesalahan saat update profile");
  }
};
