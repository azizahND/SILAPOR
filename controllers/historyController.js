const { Laporan, User } = require("../models");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

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

    // Ambil laporan berdasarkan id_laporan
    const laporan = await Laporan.findOne({
      where: { id_laporan: id },
      include: [
        {
          model: User,
          attributes: ["nama", "email", "no_telepon", "alamat"],
        },
      ],
    });

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan",
      });
    }

    // Buat dokumen PDF baru
    const doc = new PDFDocument();
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=laporan-${id}.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfBuffer);
    });

    // Isi konten PDF
    doc.fillColor("black").fontSize(18).text("Detail Laporan", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`ID Laporan   : ${laporan.id_laporan}`);
    doc.text(`Nama Barang  : ${laporan.nama_barang}`);
    doc.text(`Jenis Laporan: ${laporan.jenis_laporan}`);
    doc.text(`Tanggal      : ${laporan.tanggal_kejadian}`);
    doc.text(`Lokasi       : ${laporan.lokasi}`);
    doc.text(`Deskripsi    : ${laporan.deskripsi || "-"}`);
    doc.text(`Status       : ${laporan.status}`);

    // data user
    if (laporan.User) {
      doc.moveDown();
      doc.fontSize(14).text("Pelapor:", { underline: true });
      doc.fontSize(12).text(`Nama   : ${laporan.User.nama}`);
      doc.text(`Email  : ${laporan.User.email}`);
      doc.text(`Telp   : ${laporan.User.no_telepon || "-"}`);
      doc.text(`Alamat : ${laporan.User.alamat || "-"}`);
    }

    // Selesai
    doc.end();
  } catch (err) {
    console.error("PDF error:", err);
    res.status(500).json({ message: "Gagal generate PDF" });
  }
};



