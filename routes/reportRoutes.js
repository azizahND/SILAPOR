const express = require('express');
const router = express.Router();
const path = require('path');
const reportController = require('../controllers/reportController');
const upload = require('../middleware/upload');

// Routes
router.get('/report', reportController.showReportForm);
router.post('/report', upload.single('foto_barang'), reportController.submitReport);

module.exports = router;
