const { Laporan, User } = require("../models");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const pdf = require('html-pdf');
const { Op } = require("sequelize");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const libre = require("libreoffice-convert");


exports.getDoneReports = async (req, res) => {
  try {
    const { filterJenis, searchNama } = req.query;


    const whereClause = { status: "Done" };
    if (filterJenis) whereClause.jenis_laporan = filterJenis;
    if (searchNama) whereClause.nama_barang = { [Op.like]: `%${searchNama}%` };


    const reports = await Laporan.findAll({
      where: whereClause,
      include: [{ model: User }],
    });


    res.render("user/history", { reports, filterJenis, searchNama });
  } catch (err) {
    console.error("Error getDoneReports:", err);
    res.status(500).send("Terjadi kesalahan saat mengambil laporan");
  }
};








exports.getReportHistoryById = async (req, res) => {
  try {
    const { id } = req.params;


    const report = await Laporan.findOne({
      where: {
        id: id,
        status: "Done",
      },
      include: [
        {
          model: User,
          attributes: ["nama", "email", "no_telepon", "alamat"],
        },
      ],
    });


    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Riwayat laporan dengan status Done tidak ditemukan",
      });
    }


    res.render("user/history", {
      title: "Riwayat Laporan",
      report,
    });
  } catch (error) {
    console.error("Error getting report history:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil riwayat laporan",
    });
  }
};












exports.downloadReportPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email;
 const laporan = await Laporan.findOne({
      where: { id_laporan: id, status: "Done" },
      include: [
        {
          model: User,
          attributes: ["nama", "email", "no_telepon", "alamat"],
          where: userEmail ? { email: userEmail } : undefined,
          required: false,
        },
      ],
    });


    if (!laporan) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }


    // 2. Load template docx
    const templatePath = path.join(__dirname, ".../templates/templateya_fixed.docx");
    if (!fs.existsSync(templatePath)) {
      console.error("Template file not found:", templatePath);
      return res.status(500).json({ message: "Template file tidak ditemukan" });
    }


    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);


    // 3. Init docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => "",
    });


    // 4. Data untuk template
    const templateData = {
      id_laporan: laporan.id_laporan || "",
      nama_barang: laporan.nama_barang || "",
      jenis_laporan: laporan.jenis_laporan || "",
      status: laporan.status || "",
      tanggal_kejadian: laporan.tanggal_kejadian
        ? new Date(laporan.tanggal_kejadian).toLocaleDateString("id-ID")
        : "",
      lokasi: laporan.lokasi || "",
      tanggal_laporan: laporan.tanggal_laporan
        ? new Date(laporan.tanggal_laporan).toLocaleDateString("id-ID")
        : "",
      deskripsi: laporan.deskripsi || "",
      tanggal_penyerahan: laporan.tanggal_penyerahan
        ? new Date(laporan.tanggal_penyerahan).toLocaleDateString("id-ID")
        : "",
      lokasi_penyerahan: laporan.lokasi_penyerahan || "",
      pengklaim: laporan.pengklaim || "",
      no_hp_pengklaim: laporan.no_hp_pengklaim || "",
      user_nama: laporan.User?.nama || "",
      user_email: laporan.User?.email || "",
      user_alamat: laporan.User?.alamat || "",
      user_telp: laporan.User?.no_telepon || "",
    };


    console.log("Template data:", templateData);


    // 5. Render docx
    try {
      doc.render(templateData);
    } catch (err) {
      console.error("Docxtemplater render error:", err);
      return res.status(500).json({
        message: "Template bermasalah, cek tag {{ }} di file docx",
        details: err.message,
      });
    }


    // 6. Generate DOCX buffer
    let buf;
    try {
      buf = doc.getZip().generate({ type: "nodebuffer" });
    } catch (err) {
      console.error("Document generation error:", err);
 return res.status(500).json({ message: "Gagal generate dokumen" });
    }


    // 7. Convert DOCX → PDF pakai LibreOffice
    let pdfBuf;
    try {
      pdfBuf = await new Promise((resolve, reject) => {
        libre.convert(buf, ".pdf", undefined, (err, done) => {
          if (err) reject(err);
          else resolve(done);
        });
      });
    } catch (err) {
      console.error("LibreOffice conversion error:", err);
      return res.status(500).json({
        message: "Gagal convert ke PDF. Pastikan LibreOffice terinstall dan dapat diakses",
      });
    }


    // 8. Kirim PDF ke client
    const filename = `laporan-${laporan.id_laporan}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuf.length);
    res.end(pdfBuf);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({
      message: "Error generating PDF",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};




















// exports.getDoneReportsAdmin = async (req, res) => {
//   try {
//     const { filterJenis, searchNama } = req.query;


//     const whereClause = { status: "Done" };
//     if (filterJenis) whereClause.jenis_laporan = filterJenis;
//     if (searchNama) whereClause.nama_barang = { [Op.like]: `%${searchNama}%` };


//     const reports = await Laporan.findAll({
//       where: whereClause,
//       include: [{ model: User }],
//     });


//     res.render("user/history", { reports, filterJenis, searchNama });
//   } catch (err) {
//     console.error("Error getDoneReports:", err);
//     res.status(500).send("Terjadi kesalahan saat mengambil laporan");
//   }
// };




exports.getDoneReportsAdmin = async (req, res) => {
  try {
    const { filterJenis, searchNama } = req.query;


    const whereClause = { status: "Done" };
    if (filterJenis) whereClause.jenis_laporan = filterJenis;
    if (searchNama) whereClause.nama_barang = { [Op.like]: `%${searchNama}%` };


    const reports = await Laporan.findAll({
      where: whereClause,
      include: [{ model: User }],
    });


    res.render("admin/history", { reports, filterJenis, searchNama });
  } catch (err) {
    console.error("Error getDoneReports:", err);
    res.status(500).send("Terjadi kesalahan saat mengambil laporan");
  }
};

exports.getReportHistoryByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;


    const report = await Laporan.findOne({
      where: {
        id: id,
        status: "Done",
      },
      include: [
        {
          model: User,
          attributes: ["nama", "email", "no_telepon", "alamat"],
        },
      ],
    });


    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Riwayat laporan dengan status Done tidak ditemukan",
      });
    }


    res.render("user/history", {
      title: "Riwayat Laporan",
      report,
    });
  } catch (error) {
    console.error("Error getting report history:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil riwayat laporan",
    });
  }
};


exports.downloadReportPdfAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email;
 const laporan = await Laporan.findOne({
      where: { id_laporan: id, status: "Done" },
      include: [
        {
          model: User,
          attributes: ["nama", "email", "no_telepon", "alamat"],
          where: userEmail ? { email: userEmail } : undefined,
          required: false,
        },
      ],
    });


    if (!laporan) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }


    // 2. Load template docx
    const templatePath = path.join(__dirname, "../templates/templateya_fixed.docx");
    if (!fs.existsSync(templatePath)) {
      console.error("Template file not found:", templatePath);
      return res.status(500).json({ message: "Template file tidak ditemukan" });
    }


    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);


    // 3. Init docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => "",
    });


    // 4. Data untuk template
    const templateData = {
      id_laporan: laporan.id_laporan || "",
      nama_barang: laporan.nama_barang || "",
      jenis_laporan: laporan.jenis_laporan || "",
      status: laporan.status || "",
      tanggal_kejadian: laporan.tanggal_kejadian
        ? new Date(laporan.tanggal_kejadian).toLocaleDateString("id-ID")
        : "",
      lokasi: laporan.lokasi || "",
      tanggal_laporan: laporan.tanggal_laporan
        ? new Date(laporan.tanggal_laporan).toLocaleDateString("id-ID")
        : "",
      deskripsi: laporan.deskripsi || "",
      tanggal_penyerahan: laporan.tanggal_penyerahan
        ? new Date(laporan.tanggal_penyerahan).toLocaleDateString("id-ID")
        : "",
      lokasi_penyerahan: laporan.lokasi_penyerahan || "",
      pengklaim: laporan.pengklaim || "",
      no_hp_pengklaim: laporan.no_hp_pengklaim || "",
      user_nama: laporan.User?.nama || "",
      user_email: laporan.User?.email || "",
      user_alamat: laporan.User?.alamat || "",
      user_telp: laporan.User?.no_telepon || "",
    };


    console.log("Template data:", templateData);


    // 5. Render docx
    try {
      doc.render(templateData);
    } catch (err) {
      console.error("Docxtemplater render error:", err);
      return res.status(500).json({
        message: "Template bermasalah, cek tag {{ }} di file docx",
        details: err.message,
      });
    }


    // 6. Generate DOCX buffer
    let buf;
    try {
      buf = doc.getZip().generate({ type: "nodebuffer" });
    } catch (err) {
      console.error("Document generation error:", err);
 return res.status(500).json({ message: "Gagal generate dokumen" });
    }


    // 7. Convert DOCX → PDF pakai LibreOffice
    let pdfBuf;
    try {
      pdfBuf = await new Promise((resolve, reject) => {
        libre.convert(buf, ".pdf", undefined, (err, done) => {
          if (err) reject(err);
          else resolve(done);
        });
      });
    } catch (err) {
      console.error("LibreOffice conversion error:", err);
      return res.status(500).json({
        message: "Gagal convert ke PDF. Pastikan LibreOffice terinstall dan dapat diakses",
      });
    }


    // 8. Kirim PDF ke client
    const filename = `laporan-${laporan.id_laporan}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuf.length);
    res.end(pdfBuf);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({
      message: "Error generating PDF",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};