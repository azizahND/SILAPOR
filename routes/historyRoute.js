const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");
const { verifyUser } = require("../middleware/authMiddleware");

router.get("/history", verifyUser, historyController.getDoneReports);

module.exports = router;