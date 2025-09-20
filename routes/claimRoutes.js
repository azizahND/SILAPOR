const express = require("express");
const router = express.Router();
const claimController = require("../controllers/claimController");
const { verifyUser } = require("../middleware/authMiddleware");

router.get("/my-claim", verifyUser, claimController.getMyClaims);

router.post("/cancel/:id_laporan", verifyUser, claimController.cancelClaim);

module.exports = router;
