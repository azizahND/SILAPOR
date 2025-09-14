require('dotenv').config(); 
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const session = require("express-session");
const multer = require("multer");

const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/auth'); 

const app = express();

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: "silapor-secret",
    resave: false,
    saveUninitialized: true
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use('/', authRoutes); 
app.use('/reports', reportRoutes); 


// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SILAPOR running at http://localhost:${PORT}`));