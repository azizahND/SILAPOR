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
      where: { email: userEmail,
        status : [ 
          "Waiting for upload verification",
          "Upload verification rejected",
          "On progress",
          "Claimed",
          "Waiting for end verification",
          "End verification rejected"]
      },
      include: [
        {
          model: User,
          atrributes: ["nama", "email"]
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

exports.getDashboard = async (req, res) => {
  try {
      const reports = await Laporan.findAll({
        where: { status: "Waiting for upload verification" },
        include: [{ model: User }],
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

    const laporan = await Laporan.findByPk(id_laporan);
    if (!laporan) {
      return res
        .status(404)
        .json({ success: false, message: "Laporan tidak ditemukan" });
    }

    if (laporan.email === emailUser) {
      return res
        .status(400)
        .json({ success: false, message: "Kamu tidak bisa klaim laporan milikmu sendiri" });
    }

    await Claim.create({
      id_laporan,
      email: emailUser,
      tanggal_claim: new Date(),
    });

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

exports.getAllReportsAdmin = async (req, res) => {
  try {
    const reports = await Laporan.findAll({
      include: [
        {
          model: User,
          atrributes: ["nama", "email"],
        },  
        {
          model: Claim,
          attributes: ["email", "tanggal_claim"],
          include: [{ model: User, attributes: ["nama", "email", "no_telepon", "alamat"] }]
        }
      ],
      order: [["createdAt", "DESC"]],
    }); 
    res.render("admin/report", {
      reports,
    });
  }
  catch (error) {
    console.error("Error getting all reports:", error);
    res.status(500).send("Terjadi kesalahan pada server");
  }
};

exports.acceptClaim = async (req, res) => {
  try {
    const { id_laporan } = req.params;
    const { lokasi_penyerahan, tanggal_penyerahan, nama_pengklaim, no_telepon_pengklaim} = req.body || {};

    console.log("req.file:", req.file);

    if (!lokasi_penyerahan || !nama_pengklaim || !no_telepon_pengklaim || !tanggal_penyerahan || !req.file) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }
    console.log(id_laporan);

    const laporan = await Laporan.findByPk(id_laporan);
    if (!laporan) {
      return res.status(404).json({ success: false, message: "Laporan tidak ditemukan" });
    }
    if (laporan.email !== req.user.email) {
      return res.status(403).json({ success: false, message: "Kamu tidak berhak menerima claim untuk laporan ini" });
    }
    laporan.status = "Done";
    laporan.lokasi_penyerahan = lokasi_penyerahan;
    laporan.tanggal_penyerahan = new Date(tanggal_penyerahan);  
    laporan.pengklaim = nama_pengklaim;
    laporan.no_hp_pengklaim = no_telepon_pengklaim;
    laporan.foto_bukti = req.file ? req.file.filename : null ;
    await laporan.save();
    
    return res.redirect("/mahasiswa/history")
  } catch (error) {
    console.error("Error accepting claim:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat menerima claim" });
  } 
};
