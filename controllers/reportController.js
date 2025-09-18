const { Laporan } = require('../models');
const path = require('path');
const fs = require('fs');

/**
 * Menampilkan form untuk membuat laporan
 */
exports.showReportForm = (req, res) => {
  try {
    const role = req.user.role;
    res.render('report-form', { title: 'Form Laporan', role});
  } catch (error) {
    console.error('Error showing report form:', error);
    res.status(500).render('error', {
      message: 'Terjadi kesalahan saat memuat halaman form laporan',
    });
  }
};

/**
 * Proses pembuatan laporan baru
 */
exports.createReport = async (req, res) => {
  try {
    const { jenis_laporan, nama_barang, lokasi_kejadian, tanggal_kejadian, deskripsi } = req.body;

    // Ambil email user dari JWT
    const userEmail = req.user.email;
    console.log('ini re.user',req.user)
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Validasi input wajib
    if (!jenis_laporan || !nama_barang || !lokasi_kejadian || !tanggal_kejadian || !deskripsi) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi',
      });
    }

    // Menyiapkan data laporan
    const reportData = {
      email: userEmail,
      jenis_laporan,
      nama_barang,
      lokasi: lokasi_kejadian,
      deskripsi,
      foto_barang: req.file ? req.file.filename : null,
      status: 'Waiting for upload verification', // sesuai enum model
      tanggal_kejadian: new Date(tanggal_kejadian),
      tanggal_laporan: new Date(),
    };

    // Simpan ke database
    await Laporan.create(reportData);

    res.json({
      success: true,
      message: 'Laporan berhasil dikirim',
    });
  } catch (error) {
    console.error('Error creating report:', error);

    // Hapus file jika terjadi error saat upload
    if (req.file) {
      const filePath = path.join(req.file.destination, req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menyimpan laporan',
    });
  }
};

/**
 * Mengambil semua laporan pengguna yang login
 */
exports.getUserReports = async (req, res) => {
  try {
    const userEmail = req.user?.email;

    const reports = await Laporan.findAll({
      where: { email: userEmail }, // hanya laporan user login
      order: [['createdAt', 'DESC']],
    });

    res.render('my-reports', {
      title: 'Laporan Saya',
      reports,
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).render('error', {
      message: 'Terjadi kesalahan saat memuat data laporan',
    });
  }
};
