const path = require('path');

exports.showReportForm = (req, res) => {
    res.render('report-form', {
        title: 'Form Laporan'
    });
};

exports.submitReport = (req, res) => {
    const reportData = {
        jenis_laporan: req.body.jenis_laporan,
        nama_barang: req.body.nama_barang,
        lokasi_kejadian: req.body.lokasi_kejadian,
        tanggal_kejadian: req.body.tanggal_kejadian,
        deskripsi: req.body.deskripsi,
        foto_barang: req.file ? req.file.filename : null
    };

    // Simpan ke database di sini
    console.log('Report data:', reportData);

    res.redirect('/report/success');
};
