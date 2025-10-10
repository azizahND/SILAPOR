require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const mahasiswaRoutes = require("./routes/mahasiswaRoutes");
const adminRoutes = require("./routes/adminRoute");

const app = express();
const server = http.createServer(app); // http server
const io = new Server(server); // socket.io server

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("io", io);
// Socket.IO event
io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  // contoh kirim pesan ke client setelah konek
  socket.emit("notif", {
    title: "Welcome!",
    message: "Kamu berhasil terhubung ke server.",
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
  

});


// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", authRoutes);
app.use("/mahasiswa", mahasiswaRoutes);
app.use("/admin", adminRoutes);

// Jalankan server (pakai server.listen, bukan app.listen)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`SILAPOR running at http://localhost:${PORT}`)
);
