const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken= require ('../middleware/validTokenMiddleware');
const role = require("../middleware/checkRoleMiddleware");
const upload = require('../middleware/upload');

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/", (req, res) => {
  res.render("login", { title: "SILAPOR - Beranda" });
});
router.get("/register", (req, res) => {
  res.render("register", { title: "SILAPOR - Register" });
});
router.get("/login", (req, res) => {
  res.render("login", { title: "SILAPOR - Login" });
});

// Profile routes
router.get("/profile", verifyToken, role("user"), authController.showProfile);
router.get("/update-profile", verifyToken, role("user"), authController.showEditProfile);
router.post("/update-profile", verifyToken, role("user"), upload.single("foto"), authController.updateProfile);

router.get("/verify-email", authController.verifyEmail);
router.post("/logout", authController.logout);

module.exports = router;
