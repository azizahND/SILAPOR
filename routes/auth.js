const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken= require ('../middleware/validTokenMiddleware');
const role = require("../middleware/checkRoleMiddleware");
const upload = require('../middleware/upload');

const landingController = require("../controllers/landingController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/", landingController.getLandingPage);


router.get("/", (req, res) => {
  res.render("landing", { title: "SILAPOR - Beranda" });
});
router.get("/register", (req, res) => {
  res.render("register", { title: "SILAPOR - Register" });
});
router.get("/login", (req, res) => {
  res.render("login", { title: "SILAPOR - Login" });
});
// Forget password routes
router.get("/forget-password", (req, res) => {
  res.render("forgetPassword");
});

router.post("/forget-password", authController.forgetPassword);

router.post("/reset-password", authController.resetPassword);
// Reset password routes
router.get("/reset-password", authController.showResetPasswordForm);
router.get("/changePassword", verifyToken, role("user"), authController.showChangePasswordForm);
router.post("/changePassword", verifyToken, role("user"), authController.changePassword);

// Profile routes
router.get("/profile", verifyToken, role("user"), authController.showProfile);
router.get("/update-profile", verifyToken, role("user"), authController.showEditProfile);
router.post("/update-profile", verifyToken, role("user"), upload.single("foto"), authController.updateProfile);

router.get("/verify-email", authController.verifyEmail);
router.post("/logout", authController.logout);

module.exports = router;
