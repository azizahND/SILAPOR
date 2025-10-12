const { Laporan, User } = require("../models");

exports.getLandingPage = async (req, res) => {
  try {
    const laporanPenemuan = await Laporan.findAll({
      where: { jenis_laporan: "Penemuan" },
      include: [{ model: User, attributes: ["nama"] }],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    const laporanKehilangan = await Laporan.findAll({
      where: { jenis_laporan: "Kehilangan" },
      include: [{ model: User, attributes: ["nama"] }],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    res.render("landing", {
      title: "Beranda | Sistem Laporan Barang",
      laporanPenemuan,
      laporanKehilangan,
    });
  } catch (error) {
    console.error("Error saat memuat landing page:", error);
    res.status(500).send("Terjadi kesalahan pada server");
  }
};
