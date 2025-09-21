const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");
const { verifyUser } = require("../middleware/authMiddleware");

router.get("/", verifyUser, historyController.getDoneReports);
router.get("/:id", verifyUser, historyController.getReportHistoryById);
router.get("/download/:id", verifyUser, historyController.downloadReportPdf);


module.exports = router;