const express = require("express");
const path = require("path");
const morgan = require("morgan");
const session = require("express-session");
const bodyParser = require("body-parser");

// const laporanRoutes = require("./routes/laporan");
// const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: "silapor-secret",
  resave: false,
  saveUninitialized: true
}));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
// app.use("/laporan", laporanRoutes);
// app.use("/auth", authRoutes);

// Home
app.get("/", (req, res) => {
  res.render("home", { title: "SILAPOR - Sistem Pelaporan Barang Hilang" });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`SILAPOR running at http://localhost:${PORT}`));
