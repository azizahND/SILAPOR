const { Laporan, User } = require("../models");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const pdf = require('html-pdf');
const { Op } = require("sequelize");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const libre = require("libreoffice-convert");
const { exec } = require("child_process");


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
    const id = req.params.id;

    // 🔍 Ambil data laporan
    const laporan = await Laporan.findOne({
      where: { id_laporan: id, status: "Done" },
      include: [{ model: User, attributes: ["nama", "email", "no_telepon", "alamat"] }],
    });

    if (!laporan) return res.status(404).send("Data laporan tidak ditemukan.");

    // 📄 Path template
    const templatePath = path.join(__dirname, "../src/templates/LaporanKehilangan.docx");
    if (!fs.existsSync(templatePath)) {
      console.error("❌ Template tidak ditemukan:", templatePath);
      return res.status(500).send("Template file tidak ditemukan.");
    }

    console.log("✅ Template ditemukan:", templatePath);

    // 📂 Siapkan folder temp
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const outputDocx = path.join(tempDir, `laporan_${id}.docx`);
    const outputPdf = path.join(tempDir, `laporan_${id}.pdf`);

    // 🧾 Data untuk diisi ke template
    const data = {
      id_laporan: laporan.id_laporan || "-",
      jenis_laporan: laporan.jenis_laporan || "-",
      nama_barang: laporan.nama_barang || "-",
      status: laporan.status || "-",
      tanggal_kejadian: laporan.tanggal_kejadian 
        ? new Date(laporan.tanggal_kejadian).toLocaleDateString("id-ID") 
        : "-",
      lokasi: laporan.lokasi || "-",
      tanggal_laporan: laporan.tanggal_laporan 
        ? new Date(laporan.tanggal_laporan).toLocaleDateString("id-ID") 
        : "-",
      deskripsi: laporan.deskripsi || "-",
      tanggal_penyerahan: laporan.tanggal_penyerahan 
        ? new Date(laporan.tanggal_penyerahan).toLocaleDateString("id-ID") 
        : "-",
      lokasi_penyerahan: laporan.lokasi_penyerahan || "-",
      pengklaim: laporan.pengklaim || "-",
      no_hp_pengklaim: laporan.no_hp_pengklaim || "-",
      user_nama: laporan.User?.nama || "-",
      user_email: laporan.User?.email || "-",
      user_alamat: laporan.User?.alamat || "-",
      user_telp: laporan.User?.no_telepon || "-",
    };

    console.log("🧾 Data untuk template:", data);

    // 🧠 Isi template DOCX pakai Docxtemplater
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    
    // 🔥 KUNCI PENTING: Ubah delimiter jadi double braces
    const doc = new Docxtemplater(zip, { 
      paragraphLoop: true, 
      linebreaks: true,
      delimiters: {
        start: '{{',  // Pakai double curly braces
        end: '}}'
      },
      nullGetter: () => "-"
    });

    try {
      doc.render(data);
    } catch (renderError) {
      console.error("❌ Error saat render template:", renderError);
      
      if (renderError.properties && renderError.properties.errors) {
        console.error("Detail errors:", renderError.properties.errors);
      }
      
      return res.status(500).send("Gagal mengisi template. Periksa placeholder di template Word.");
    }

    const buf = doc.getZip().generate({ type: "nodebuffer" });
    fs.writeFileSync(outputDocx, buf);

    console.log("✅ File DOCX selesai diisi:", outputDocx);

    // 🔄 Konversi DOCX ke PDF pakai LibreOffice
    const command = `soffice --headless --convert-to pdf --outdir "${tempDir}" "${outputDocx}"`;
    console.log("⚙️ Menjalankan perintah:", command);

    exec(command, (err, stdout, stderr) => {
      console.log("📤 LibreOffice stdout:", stdout);
      console.log("📥 LibreOffice stderr:", stderr);

      if (err) {
        console.error("❌ Gagal konversi PDF:", err);
        return res.status(500).send("Gagal mengonversi file ke PDF.");
      }

      if (!fs.existsSync(outputPdf)) {
        console.error("❌ File PDF tidak ditemukan:", outputPdf);
        return res.status(500).send("File PDF gagal dibuat.");
      }

      console.log("✅ File PDF berhasil dibuat:", outputPdf);

      // 📎 Kirim file PDF ke client
      res.download(outputPdf, `laporan_${id}.pdf`, (downloadErr) => {
        if (downloadErr) {
          console.error("⚠️ Gagal kirim file:", downloadErr);
        }

        // 🧹 Bersihkan file sementara
        try {
          if (fs.existsSync(outputDocx)) fs.unlinkSync(outputDocx);
          if (fs.existsSync(outputPdf)) fs.unlinkSync(outputPdf);
          console.log("🧹 File sementara dihapus.");
        } catch (cleanupErr) {
          console.warn("⚠️ Tidak bisa hapus file temp:", cleanupErr.message);
        }
      });
    });
  } catch (error) {
    console.error("❌ Terjadi kesalahan:", error);
    res.status(500).send("Terjadi kesalahan internal server.");
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
    const id = req.params.id;

    // 🔍 Ambil data laporan
    const laporan = await Laporan.findOne({
      where: { id_laporan: id, status: "Done" },
      include: [{ model: User, attributes: ["nama", "email", "no_telepon", "alamat"] }],
    });

    if (!laporan) return res.status(404).send("Data laporan tidak ditemukan.");

    // 📄 Path template
    const templatePath = path.join(__dirname, "../src/templates/LaporanKehilangan.docx");
    if (!fs.existsSync(templatePath)) {
      console.error("❌ Template tidak ditemukan:", templatePath);
      return res.status(500).send("Template file tidak ditemukan.");
    }

    console.log("✅ Template ditemukan:", templatePath);

    // 📂 Siapkan folder temp
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const outputDocx = path.join(tempDir, `laporan_${id}.docx`);
    const outputPdf = path.join(tempDir, `laporan_${id}.pdf`);

    // 🧾 Data untuk diisi ke template
    const data = {
      id_laporan: laporan.id_laporan || "-",
      jenis_laporan: laporan.jenis_laporan || "-",
      nama_barang: laporan.nama_barang || "-",
      status: laporan.status || "-",
      tanggal_kejadian: laporan.tanggal_kejadian 
        ? new Date(laporan.tanggal_kejadian).toLocaleDateString("id-ID") 
        : "-",
      lokasi: laporan.lokasi || "-",
      tanggal_laporan: laporan.tanggal_laporan 
        ? new Date(laporan.tanggal_laporan).toLocaleDateString("id-ID") 
        : "-",
      deskripsi: laporan.deskripsi || "-",
      tanggal_penyerahan: laporan.tanggal_penyerahan 
        ? new Date(laporan.tanggal_penyerahan).toLocaleDateString("id-ID") 
        : "-",
      lokasi_penyerahan: laporan.lokasi_penyerahan || "-",
      pengklaim: laporan.pengklaim || "-",
      no_hp_pengklaim: laporan.no_hp_pengklaim || "-",
      user_nama: laporan.User?.nama || "-",
      user_email: laporan.User?.email || "-",
      user_alamat: laporan.User?.alamat || "-",
      user_telp: laporan.User?.no_telepon || "-",
    };

    console.log("🧾 Data untuk template:", data);

    // 🧠 Isi template DOCX pakai Docxtemplater
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    
    // 🔥 KUNCI PENTING: Ubah delimiter jadi double braces
    const doc = new Docxtemplater(zip, { 
      paragraphLoop: true, 
      linebreaks: true,
      delimiters: {
        start: '{{',  // Pakai double curly braces
        end: '}}'
      },
      nullGetter: () => "-"
    });

    try {
      doc.render(data);
    } catch (renderError) {
      console.error("❌ Error saat render template:", renderError);
      
      if (renderError.properties && renderError.properties.errors) {
        console.error("Detail errors:", renderError.properties.errors);
      }
      
      return res.status(500).send("Gagal mengisi template. Periksa placeholder di template Word.");
    }

    const buf = doc.getZip().generate({ type: "nodebuffer" });
    fs.writeFileSync(outputDocx, buf);

    console.log("✅ File DOCX selesai diisi:", outputDocx);

    // 🔄 Konversi DOCX ke PDF pakai LibreOffice
    const command = `soffice --headless --convert-to pdf --outdir "${tempDir}" "${outputDocx}"`;
    console.log("⚙️ Menjalankan perintah:", command);

    exec(command, (err, stdout, stderr) => {
      console.log("📤 LibreOffice stdout:", stdout);
      console.log("📥 LibreOffice stderr:", stderr);

      if (err) {
        console.error("❌ Gagal konversi PDF:", err);
        return res.status(500).send("Gagal mengonversi file ke PDF.");
      }

      if (!fs.existsSync(outputPdf)) {
        console.error("❌ File PDF tidak ditemukan:", outputPdf);
        return res.status(500).send("File PDF gagal dibuat.");
      }

      console.log("✅ File PDF berhasil dibuat:", outputPdf);

      // 📎 Kirim file PDF ke client
      res.download(outputPdf, `laporan_${id}.pdf`, (downloadErr) => {
        if (downloadErr) {
          console.error("⚠️ Gagal kirim file:", downloadErr);
        }

        // 🧹 Bersihkan file sementara
        try {
          if (fs.existsSync(outputDocx)) fs.unlinkSync(outputDocx);
          if (fs.existsSync(outputPdf)) fs.unlinkSync(outputPdf);
          console.log("🧹 File sementara dihapus.");
        } catch (cleanupErr) {
          console.warn("⚠️ Tidak bisa hapus file temp:", cleanupErr.message);
        }
      });
    });
  } catch (error) {
    console.error("❌ Terjadi kesalahan:", error);
    res.status(500).send("Terjadi kesalahan internal server.");
  }
};