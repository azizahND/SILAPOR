const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const reportController = require('../controllers/reportController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(
            null,
            Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
        );
    }
});

const upload = multer({ storage: storage });

// Routes
router.get('/report', reportController.showReportForm);
router.post('/report', upload.single('foto_barang'), reportController.submitReport);

module.exports = router;
