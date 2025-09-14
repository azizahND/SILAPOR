const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); 
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      return cb(new Error("Format file tidak valid"));
    }
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});

console.log(this.fields);

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/*"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Hanya format JPEG, PNG, dan JPG yang diizinkan"),
        false
      );
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      return cb(new Error("Format file tidak valid"), false);
    }

    cb(null, true);
  },
});

module.exports = upload;
