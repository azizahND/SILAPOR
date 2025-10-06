const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");
const { verifyUser } = require("../middleware/authMiddleware");



module.exports = router;