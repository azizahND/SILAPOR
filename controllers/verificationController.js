const { Laporan, User } = require("../models");

module.exports = {
  getPendingReports: async (req, res) => {
    try {
      const reports = await Laporan.findAll({
        where: { status: "Waiting for upload verification" },
        include: [{ model: User }],
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/verifikasi", { reports });
    } catch (err) {
      console.error(err);
      res.status(500).send("Terjadi kesalahan server");
    }
  },

  verifyReport: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, alasan } = req.body;

      const laporan = await Laporan.findByPk(id);
      if (!laporan) {
        return res.status(404).send("Laporan tidak ditemukan");
      }

      if (action === "approve") {
        laporan.status = "On progress";
        laporan.verifikasi_action = "approve";
        laporan.alasan = null;
      } else {
        laporan.status = "Upload verification rejected";
        laporan.verifikasi_action = "denied";
        laporan.alasan = alasan;
      }

      await laporan.save();

      res.redirect("/admin/verifikasi");
    } catch (err) {
      console.error(err);
      res.status(500).send("Terjadi kesalahan server");
    }
  },
};
