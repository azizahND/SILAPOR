const express = require('express');
const router = express.Router();
const path = require('path');
const reportController = require('../controllers/reportController');
const upload = require('../middleware/upload');

// Routes
router.get('/', reportController.showReportForm);
router.post('/', upload.single('foto_barang'), reportController.submitReport);

module.exports = router;
