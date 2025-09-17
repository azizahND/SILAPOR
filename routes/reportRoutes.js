// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const upload = require('../middleware/upload')
const { authenticateToken } = require('../middleware/auth');

// Routes
router.get('/', reportController.showReportForm);
router.post('/', authenticateToken, upload.single('foto_barang'), reportController.createReport);

// Halaman laporan saya
router.get('/my-reports', reportController.getUserReports);

module.exports = router;
