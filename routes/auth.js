const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/", (req, res) => {
  res.render("login", { title: "SILAPOR - Beranda" });
});
router.get("/register", (req, res) => {
  res.render("register", { title: "SILAPOR - Register" });
});

module.exports = router;
