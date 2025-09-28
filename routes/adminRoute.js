const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const reportController = require("../controllers/reportController");
const verifyToken = require("../middleware/validTokenMiddleware");
const role = require("../middleware/checkRoleMiddleware");
const userController = require("../controllers/userController");
const verificationController = require("../controllers/verificationController");

router.get(
  "/dashboard",
  verifyToken,
  role("admin"),
  reportController.getDashboard
);
router.get(
  "/reports",
  verifyToken,
  role("admin"),
  reportController.showReportForm
);
router.post(
  "/reports",
  verifyToken,
  role("admin"),
  upload.single("foto_barang"),
  reportController.createReport
);

router.get(
  "/verifikasi",
  verifyToken,
  role("admin"),
  verificationController.getPendingReports
);

router.post(
  "/verifikasi/:id",
  verifyToken,
  role("admin"),
  verificationController.verifyReport
);

router.get("/userList", verifyToken, role("admin"), userController.listUsers);
router.post(
  "/userList/delete/:email",
  verifyToken,
  role("admin"),
  userController.deleteUser
);
router.post(
  "/userList/create",
  verifyToken,
  role("admin"),
  userController.createUser
);
router.post(
  "/userList/update/:email",
  verifyToken,
  role("admin"),
  userController.updateUser
);

router.get(
  "/pengajuan",
  verifyToken,
  role("admin"),
  reportController.getAllReportsAdmin
);

module.exports = router;
