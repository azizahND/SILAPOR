const { Laporan, User, Claim } = require("../models");
const path = require("path");
const fs = require("fs");

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

    res.json({
      success: true,
      message: "Laporan berhasil dikirim",
    });
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
        },
      ],
      where: { email: userEmail },
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
          atrributes: ["nama", "email"],
        },
      ],
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
