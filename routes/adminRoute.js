const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const reportController = require('../controllers/reportController');
const verifyToken= require ('../middleware/validTokenMiddleware');
const role = require("../middleware/checkRoleMiddleware");
const userController = require('../controllers/userController');

router.get('/dashboard', verifyToken, role('admin'), reportController.getAllReportsAdmin);
router.get('/reports', verifyToken, role('admin'), reportController.showReportForm);
router.post('/reports', verifyToken, role('admin'), upload.single('foto_barang'), reportController.createReport);

router.get('/userList', verifyToken, role('admin'), userController.listUsers);
router.post('/userList/delete/:email', verifyToken, role('admin'), userController.deleteUser);
router.post('/userList/create', verifyToken, role('admin'), userController.createUser);
router.post('/userList/update/:email', verifyToken, role('admin'), userController.updateUser);

module.exports = router;