require('dotenv').config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const session = require("express-session");

// tambahan untuk livereload
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/auth'); 
const mahasiswaRoutes = require('./routes/mahasiswaRoutes');

const app = express();

// ====== LiveReload Setup ======
const liveReloadServer = livereload.createServer({ port: 35730 });

liveReloadServer.watch(path.join(__dirname, "public"));
liveReloadServer.watch(path.join(__dirname, "views"));

app.use(connectLivereload());

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});
// ====== End LiveReload Setup ======

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: "silapor-secret",
    resave: false,
    saveUninitialized: true
}));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use('/', authRoutes); 
app.use('/reports', reportRoutes); 
app.use('/mahasiswa', mahasiswaRoutes ); 

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SILAPOR running at http://localhost:${PORT}`));
