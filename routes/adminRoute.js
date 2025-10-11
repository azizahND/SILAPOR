const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const reportController = require("../controllers/reportController");
const verifyToken = require("../middleware/validTokenMiddleware");
const role = require("../middleware/checkRoleMiddleware");
const userController = require("../controllers/userController");
const verificationController = require("../controllers/verificationController");
const historyController = require("../controllers/historyController");
const claimController = require("../controllers/claimController");

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

router.post('/my-reports/reapply-report/:id_laporan', verifyToken, role('admin'),reportController.reapplyReportAdmin);

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



router.get("/history", verifyToken, role('admin'), historyController.getDoneReportsAdmin);
router.get("/history/:id", verifyToken, role('admin'), historyController.getReportHistoryByIdAdmin);
router.get("/history/download/:id", verifyToken, role('admin'), historyController.downloadReportPdfAdmin);

router.post('/claim', verifyToken, role('admin'), reportController.claimReport);
router.get("/my-claim", verifyToken, role('admin'), claimController.getMyClaimsAdmin);
router.post("/my-claim/cancel/:id_laporan", verifyToken, role('admin'), claimController.cancelClaimAdmin);

module.exports = router;
