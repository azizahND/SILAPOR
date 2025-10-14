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
const ImageModule = require("docxtemplater-image-module-free");
const sizeOf = require("image-size")

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
     const user = await User.findOne({ where: { email: req.user.email } });


    res.render("user/history", { reports, user,filterJenis, searchNama });
  } catch (err) {
    console.error("Error getDoneReports:", err);
    res.status(500).send("Terjadi kesalahan saat mengambil laporan");
  }
};


exports.getReportHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

     const user = await User.findOne({ where: { email: req.user.email } });
    const report = await Laporan.findOne({
      where: {
        id: id,
        email: req.user.email,
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
      user,
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

    const laporan = await Laporan.findOne({
      where: { id_laporan: id, status: "Done" },
      include: [{ model: User, attributes: ["nama", "email", "no_telepon", "alamat"] }],
    });

    if (!laporan) return res.status(404).send("Data laporan tidak ditemukan.");

    const templatePath = path.join(__dirname, "../src/templates/LaporanKehilangan.docx");
    if (!fs.existsSync(templatePath)) return res.status(500).send("Template file tidak ditemukan.");

    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const outputDocx = path.join(tempDir, `laporan_${id}.docx`);
    const outputPdf = path.join(tempDir, `laporan_${id}.pdf`);

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

    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "{{", end: "}}" },
      nullGetter: () => "-",
    });
    doc.render(data);

    const buf = doc.getZip().generate({ type: "nodebuffer" });
    fs.writeFileSync(outputDocx, buf);

    const command = `soffice --headless --convert-to pdf --outdir "${tempDir}" "${outputDocx}"`;
    exec(command, async (err) => {
      if (err) {
        console.error("❌ Gagal konversi PDF:", err);
        return res.status(500).send("Gagal mengonversi file ke PDF.");
      }

      const waitForFile = async (filePath, retries = 10, delay = 500) => {
        for (let i = 0; i < retries; i++) {
          if (fs.existsSync(filePath)) return true;
          await new Promise((r) => setTimeout(r, delay));
        }
        return false;
      };

      const ready = await waitForFile(outputPdf);
      if (!ready) {
        console.error("❌ File PDF belum muncul setelah menunggu.");
        return res.status(500).send("File PDF gagal dibuat.");
      }

      res.download(outputPdf, `laporan_${id}.pdf`, (downloadErr) => {
        if (downloadErr) console.error("⚠️ Gagal kirim file:", downloadErr);

        try {
          if (fs.existsSync(outputDocx)) fs.unlinkSync(outputDocx);
          if (fs.existsSync(outputPdf)) fs.unlinkSync(outputPdf);
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

const user = await User.findOne({ where: { email: req.user.email } });
    res.render("admin/history", { reports, filterJenis, searchNama, user});
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

    const laporan = await Laporan.findOne({
      where: { id_laporan: id, status: "Done" },
      include: [{ model: User, attributes: ["nama", "email", "no_telepon", "alamat"] }],
    });

    if (!laporan) return res.status(404).send("Data laporan tidak ditemukan.");

    const templatePath = path.join(__dirname, "../src/templates/LaporanKehilangan.docx");
    if (!fs.existsSync(templatePath)) {
      console.error("❌ Template tidak ditemukan:", templatePath);
      return res.status(500).send("Template file tidak ditemukan.");
    }

    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const outputDocx = path.join(tempDir, `laporan_${id}.docx`);
    const outputPdf = path.join(tempDir, `laporan_${id}.pdf`);

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

      foto_bukti: laporan.foto_bukti
        ? path.join(process.cwd(), "uploads", laporan.foto_bukti)
        : null,
    };

    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);

    const imageModule = new ImageModule({
      centered: true,
      getImage: (tagValue) => {
        try {
          if (!tagValue) {
            return fs.readFileSync(path.join(__dirname, "../src/templates/noimage.png"));
          }
          if (fs.existsSync(tagValue)) {
            return fs.readFileSync(tagValue);
          }
          if (tagValue.startsWith("data:image")) {
            const base64Data = tagValue.split(",")[1];
            return Buffer.from(base64Data, "base64");
          }
        } catch (err) {
          console.error("⚠️ Gagal ambil gambar:", err);
          return fs.readFileSync(path.join(__dirname, "../src/templates/noimage.png"));
        }
      },
      getSize: () => [150, 150], 
    });

    const doc = new Docxtemplater(zip, {
      modules: [imageModule],
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "{{", end: "}}" },
      nullGetter: () => "-",
    });

    doc.render(data);
    const buf = doc.getZip().generate({ type: "nodebuffer" });
    fs.writeFileSync(outputDocx, buf);

    const command = `soffice --headless --convert-to pdf --outdir "${tempDir}" "${outputDocx}"`;
    exec(command, async (err) => {
      if (err) {
        console.error("❌ Gagal konversi PDF:", err);
        return res.status(500).send("Gagal mengonversi file ke PDF.");
      }

      const waitForFile = async (filePath, retries = 10, delay = 500) => {
        for (let i = 0; i < retries; i++) {
          if (fs.existsSync(filePath)) return true;
          await new Promise((r) => setTimeout(r, delay));
        }
        return false;
      };

      const ready = await waitForFile(outputPdf);
      if (!ready) {
        console.error("❌ File PDF belum muncul setelah menunggu.");
        return res.status(500).send("File PDF gagal dibuat.");
      }

      res.download(outputPdf, `laporan_${id}.pdf`, (downloadErr) => {
        if (downloadErr) console.error("⚠️ Gagal kirim file:", downloadErr);

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