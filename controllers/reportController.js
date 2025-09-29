const { Laporan, User, Claim } = require("../models");
const path = require("path");
const fs = require("fs");
const { where } = require("sequelize");

exports.showReportForm = (req, res) => {
  try {
    const role = req.user.role;
    res.render("report-form", { title: "Form Laporan", role });
  } catch (error) {
    console.error("Error showing report form:", error);
    res.status(500).render("error", {
      message: "Terjadi kesalahan saat memuat halaman form laporan",
    });
  }
};

exports.createReport = async (req, res) => {
  try {
    const {
      jenis_laporan,
      nama_barang,
      lokasi_kejadian,
      tanggal_kejadian,
      deskripsi,
      foto_barang,
    } = req.body;

    const userEmail = req.user.email;
    if (!userEmail) {
      return res
        .status(401)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    if (
      !jenis_laporan ||
      !nama_barang ||
      !lokasi_kejadian ||
      !tanggal_kejadian ||
      !deskripsi ||
      foto_barang
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }

    const reportData = {
      email: userEmail,
      jenis_laporan,
      nama_barang,
      lokasi: lokasi_kejadian,
      deskripsi,
      foto_barang: req.file ? req.file.filename : null,
      status: "Waiting for upload verification",
      tanggal_kejadian: new Date(tanggal_kejadian),
      tanggal_laporan: new Date(),
    };

    await Laporan.create(reportData);


    return res.redirect("/mahasiswa/my-reports");
  } catch (error) {
    console.error("Error creating report:", error);

    if (req.file) {
      const filePath = path.join(req.file.destination, req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menyimpan laporan",
    });
  }
};

exports.getUserReports = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const reports = await Laporan.findAll({
      include: [
        {
          model: User,
          atrributes: ["nama", "email"],
          where: {email : userEmail}
        },
        {
          model: Claim, 
          attributes: ["email", "tanggal_claim"],
          include: [{ model: User, attributes: ["nama", "email", "no_telepon", "alamat"] }]
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.render("my-reports", {
      title: "Laporan Saya",
      reports,
    });
  } catch (error) {
    console.error("Error getting reports:", error);
    res.status(500).render("error", {
      message: "Terjadi kesalahan saat memuat data laporan",
    });
  }
};

exports.getAllReportsAdmin = async (req, res) => {
  try {
    const reports = await Laporan.findAll({
      include: [
        {
          model: User,
          attributes: ["nama", "email"], 
        },
      ],
      where: { status: "On Progress" }, 
      order: [["createdAt", "DESC"]],   
    });

    res.render("admin/dashboard", {
      reports,
    });
  } catch (error) {
    console.error("Error getting all reports:", error);
    res.status(500).send("Terjadi kesalahan pada server");
  }
};


exports.getAllReportsUser = async (req, res) => {
  try {
    const reports = await Laporan.findAll({
      include: [
        {
          model: User,
          atrributes: ["nama", "email"],
        },
      ],
      where: { status: "On Progress" },
      order: [["createdAt", "DESC"]],
    });
    res.render("home", {
      reports,
    });
  } catch (error) {
    console.error("Error getting all reports:", error);
    res.status(500).send("Terjadi kesalahan pada server");
  }
};


exports.claimReport = async (req, res) => {
  try {
    const { id_laporan } = req.body;
    const emailUser = req.user.email;

    // Simpan ke tabel Claim
    await Claim.create({
      id_laporan,
      email: emailUser,
      tanggal_claim: new Date(),
    });

    // Update status laporan jadi Claimed
    const laporan = await Laporan.findByPk(id_laporan);
    if (!laporan) {
      return res
        .status(404)
        .json({ success: false, message: "Laporan tidak ditemukan" });
    }

    laporan.status = "Claimed";
    await laporan.save();

    // Ambil data kontak pelapor
    const pelapor = await User.findOne({
      where: { email: laporan.email },
      attributes: ["nama", "email", "no_telepon", "alamat"],
    });

    // 🔥 Tambahkan log hasil tarik data ke terminal
    console.log("Data kontak pelapor:", pelapor.toJSON());

    res.json({
      success: true,
      message: "Laporan berhasil diklaim",
      kontakPelapor: pelapor,
    });
  } catch (error) {
    console.error("Error claim report:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat klaim laporan",
    });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_barang,
      lokasi_kejadian,
      deskripsi,
    } = req.body;

    const laporan = await Laporan.findOne({
      where: {
        id_laporan: id,            // ✅ ganti id → id_laporan
        email: req.user.email,
      },
    });

    if (!laporan) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    laporan.nama_barang = nama_barang;
    laporan.lokasi = lokasi_kejadian;
    laporan.deskripsi = deskripsi;

    if (req.file) {
      if (laporan.foto_barang) {
        const oldPath = path.join("uploads", laporan.foto_barang);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      laporan.foto_barang = req.file.filename;
    }

    await laporan.save();

    return res.redirect("/mahasiswa/my-reports");
  } catch (error) {
    console.error("Error update report:", error);
    return res.status(500).json({ message: error.message });
  }
};



exports.deleteReport = async (req, res) => {
  try {
    const laporan = await Laporan.findOne({
      where: { id_laporan: req.params.id },
    });

    if (!laporan) {
      return res.json({ success: false, message: "Laporan tidak ditemukan" });
    }

    await laporan.destroy();
    res.json({ success: true, message: "Laporan berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Terjadi kesalahan saat menghapus laporan" });
  }
};


exports.createReportAdmin = async (req, res) => {
  try {
    const {
      jenis_laporan,
      nama_barang,
      lokasi_kejadian,
      tanggal_kejadian,
      deskripsi,
    } = req.body;

    // Validasi input
    if (
      !jenis_laporan ||
      !nama_barang ||
      !lokasi_kejadian ||
      !tanggal_kejadian ||
      !deskripsi
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }


    // Data laporan untuk admin
    const reportData = {
      email: req.user.email, // Admin yang membuat laporan
      jenis_laporan,
      nama_barang,
      lokasi: lokasi_kejadian,
      deskripsi,
      foto_barang: req.file ? req.file.filename : null,
      status: "Waiting for upload verification", 
      tanggal_kejadian: new Date(tanggal_kejadian),
      tanggal_laporan: new Date(),
    };

    const newReport = await Laporan.create(reportData);

    // Redirect ke halaman my-reports admin dengan pesan sukses
    return res.redirect("/admin/my-reports");
  } catch (error) {
    console.error("Error creating admin report:", error);

    // Hapus file jika ada error
    if (req.file) {
      const filePath = path.join(req.file.destination, req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menyimpan laporan",
    });
  }
};

// Method untuk menampilkan form laporan admin
exports.showAdminReportForm = (req, res) => {
  try {
    res.render("admin/report-form", { 
      title: "Form Laporan Admin",
      role: req.user.role 
    });
  } catch (error) {
    console.error("Error showing admin report form:", error);
    res.status(500).render("error", {
      message: "Terjadi kesalahan saat memuat halaman form laporan",
    });
  }
};

// Method untuk menampilkan laporan admin (my-reports)
exports.getAdminReports = async (req, res) => {
  try {
    const adminEmail = req.user.email;

    const reports = await Laporan.findAll({
      include: [
        {
          model: User,
          attributes: ["nama", "email"],
          where: { email: adminEmail }
        },
        {
          model: Claim, 
          attributes: ["email", "tanggal_claim"],
          include: [{ model: User, attributes: ["nama", "email", "no_telepon", "alamat"] }]
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.render("admin/my-reports", {
      title: "Laporan Saya - Admin",
      reports,
      success: req.query.success, // Ambil parameter success dari URL
    });
  } catch (error) {
    console.error("Error getting admin reports:", error);
    res.status(500).render("error", {
      message: "Terjadi kesalahan saat memuat data laporan",
    });
  }
};


exports.updateReportAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_barang,
      lokasi_kejadian,
      deskripsi,
    } = req.body;

    // Validasi input
    if (!nama_barang || !lokasi_kejadian || !deskripsi) {
      return res.status(400).json({ 
        success: false,
        message: "Semua field wajib diisi" 
      });
    }

    const laporan = await Laporan.findOne({
      where: {
        id_laporan: id,
        email: req.user.email, // Admin yang membuat laporan
      },
    });

    if (!laporan) {
      return res.status(404).json({ 
        success: false,
        message: "Laporan tidak ditemukan" 
      });
    }

    // Update data laporan
    laporan.nama_barang = nama_barang;
    laporan.lokasi = lokasi_kejadian;
    laporan.deskripsi = deskripsi;

    // Handle foto update
    if (req.file) {
      // Hapus foto lama jika ada
      if (laporan.foto_barang) {
        const oldPath = path.join("uploads", laporan.foto_barang);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      laporan.foto_barang = req.file.filename;
    }

    await laporan.save();

    // Redirect ke my-reports admin dengan pesan sukses
    return res.redirect("/admin/my-reports");
  } catch (error) {
    console.error("Error updating admin report:", error);
    
    // Hapus file jika ada error
    if (req.file) {
      const filePath = path.join(req.file.destination, req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan saat memperbarui laporan" 
    });
  }
};

exports.deleteReportAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const laporan = await Laporan.findOne({
      where: { 
        id_laporan: id,
        email: req.user.email // Admin yang membuat laporan
      },
    });

    if (!laporan) {
      return res.json({ 
        success: false, 
        message: "Laporan tidak ditemukan" 
      });
    }

    // Hapus foto jika ada
    if (laporan.foto_barang) {
      const filePath = path.join("uploads", laporan.foto_barang);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await laporan.destroy();
    
    res.json({ 
      success: true, 
      message: "Laporan berhasil dihapus" 
    });
  } catch (error) {
    console.error("Error deleting admin report:", error);
    res.json({ 
      success: false, 
      message: "Terjadi kesalahan saat menghapus laporan" 
    });
  }
};