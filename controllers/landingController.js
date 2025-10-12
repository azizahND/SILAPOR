const { Laporan, User } = require("../models");

exports.getLandingPage = async (req, res) => {
  try {
    // Ambil 5 laporan terakhir penemuan & kehilangan
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

    // ===== Statistik utama =====
    const jumlahLaporanSelesai = await Laporan.count({
      where: { status: "Done" },
    });

    const jumlahMahasiswa = await User.count({
      where: { role: "mahasiswa" },
    });

    // kalau belum ada tabel unit, sementara bisa isi manual
    const jumlahUnitTerhubung = 25;

    res.render("landing", {
      title: "Beranda | Sistem Laporan Barang",
      laporanPenemuan,
      laporanKehilangan,
      jumlahLaporanSelesai,
      jumlahMahasiswa,
      jumlahUnitTerhubung,
    });
  } catch (error) {
    console.error("Error saat memuat landing page:", error);
    res.status(500).send("Terjadi kesalahan pada server");
  }
};
