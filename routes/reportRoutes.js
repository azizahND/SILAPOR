const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// GET - Show report form
router.get('/report', (req, res) => {
    res.render('report-form', {
        title: 'Form Laporan'
    });
});

// POST - Handle form submission
router.post('/report', upload.single('foto_barang'), (req, res) => {
    const reportData = {
        jenis_laporan: req.body.jenis_laporan,
        nama_barang: req.body.nama_barang,
        lokasi_kejadian: req.body.lokasi_kejadian,
        tanggal_kejadian: req.body.tanggal_kejadian,
        deskripsi: req.body.deskripsi,
        foto_barang: req.file ? req.file.filename : null
    };
    
    // Save to database here
    console.log('Report data:', reportData);
    
    res.redirect('/report/success');
});

module.exports = router;