require('dotenv').config();
const express = require("express");
const http = require('http');
const path = require("path");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');

// const livereload = require("livereload");
// const connectLivereload = require("connect-livereload");

const authRoutes = require('./routes/auth'); 
const mahasiswaRoutes = require('./routes/mahasiswaRoutes');
const adminRoutes = require('./routes/adminRoute');
const claimRoutes = require("./routes/claimRoutes");

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ====== LiveReload Setup ======
// const liveReloadServer = livereload.createServer({ port: 35730 });

// liveReloadServer.watch(path.join(__dirname, "public"));
// liveReloadServer.watch(path.join(__dirname, "views"));

// app.use(connectLivereload());

// liveReloadServer.server.once("connection", () => {
//   setTimeout(() => {
//     liveReloadServer.refresh("/");
//   }, 100);
// });
// ====== End LiveReload Setup ======

// Middleware
app.use(morgan("dev"));
app.use(express.json());    
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "http://localhost:35729"],
//       connectSrc: ["'self'", "http://localhost:3000", "ws://localhost:35729"],
//     },
//   })
// );


// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use('/', authRoutes); 
app.use('/mahasiswa', mahasiswaRoutes ); 
app.use('/admin', adminRoutes );
app.use("/claim", claimRoutes);



// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SILAPOR running at http://localhost:${PORT}`));
