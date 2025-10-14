const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const reportController = require("../controllers/reportController");
const verifyToken = require("../middleware/validTokenMiddleware");
const role = require("../middleware/checkRoleMiddleware");
const historyController = require("../controllers/historyController");
const claimController = require("../controllers/claimController");

router.get(
  "/home",
  verifyToken,
  role("user"),
  reportController.getAllReportsUser
);
router.get(
  "/reports",
  verifyToken,
  role("user"),
  reportController.showReportForm
);
router.post(
  "/reports",
  verifyToken,
  role("user"),
  upload.single("foto_barang"),
  reportController.createReport
);

router.get(
  "/my-reports",
  verifyToken,
  role("user"),
  reportController.getUserReports
);
router.post(
  "/my-reports/accept-claim/:id_laporan",
  verifyToken,
  role("user"),
  upload.single("bukti"),
  reportController.acceptClaim
);
router.post(
  "/my-reports/reapply-report/:id_laporan",
  verifyToken,
  role("user"),
  reportController.reapplyReport
);
router.get("/my-claim", verifyToken, role("user"), claimController.getMyClaims);
router.post(
  "/cancel/:id_laporan",
  verifyToken,
  role("user"),
  claimController.cancelClaim 
);
router.post("/claim", verifyToken, role("user"), reportController.claimReport);
router.delete(
  "/reports/delete/:id",
  verifyToken,
  role("user"),
  reportController.deleteReport
);
router.get(
  "/history",
  verifyToken,
  role("user"),
  historyController.getDoneReports
);
router.get(
  "/history/:id",
  verifyToken,
  role("user"),
  historyController.getReportHistoryById
);
router.get(
  "/history/download/:id",
  verifyToken,
  role("user"),
  historyController.downloadReportPdf
);
router.post(
  "/my-reports/reject-claim/:id_laporan",
  verifyToken,
  role("user"),
  reportController.rejectClaim
);


router.post(
  "/reports/update/:id",
  verifyToken,
  role("user"),
  upload.single("foto_barang"),
  reportController.updateReport
);

module.exports = router;
