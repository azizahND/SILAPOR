const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const reportController = require('../controllers/reportController');
const verifyToken= require ('../middleware/validTokenMiddleware');
const role = require("../middleware/checkRoleMiddleware");

router.get('/home', verifyToken, role('user'), reportController.getAllReportsUser);
router.get('/reports', verifyToken, role('user'), reportController.showReportForm);
router.post('/reports', verifyToken, role('user'), upload.single('foto_barang'), reportController.createReport);

router.get('/my-reports', verifyToken,role('user'), reportController.getUserReports);


module.exports = router;