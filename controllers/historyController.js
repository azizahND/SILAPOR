const { Laporan, User } = require("../models");

exports.getDoneReports = async (req, res) => {
  try {
    const reports = await Laporan.findAll({
      where: { status: "Done" },
      include: [{ model: User }],
    });

    res.render("history", { reports }); 
  } catch (err) {
    console.error("Error getDoneReports:", err);
    res.status(500).send("Terjadi kesalahan saat mengambil laporan");
  }
};
