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
  reportController.showAdminReportForm
);
router.post(
  "/reports",
  verifyToken,
  role("admin"),
  upload.single("foto_barang"),
  reportController.createReportAdmin
);

router.get(
  "/my-reports",
  verifyToken,
  role("admin"),
  reportController.getAdminReports
);

router.post(
  "/reports/update/:id",
  verifyToken,
  role("admin"),
  upload.single("foto_barang"),
  reportController.updateReportAdmin
);

router.delete(
  "/reports/delete/:id",
  verifyToken,
  role("admin"),
  reportController.deleteReportAdmin
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

// Admin profile routes
router.get("/profile", verifyToken, role("admin"), userController.showAdminProfile);
router.get("/edit-profile", verifyToken, role("admin"), userController.showAdminEditProfile);
router.post("/update-profile", verifyToken, role("admin"), upload.single("foto"), userController.updateAdminProfile);

module.exports = router;
