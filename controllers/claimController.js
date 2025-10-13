const { Claim, Laporan, User } = require("../models");

exports.getMyClaims = async (req, res) => {
  try {
    const emailUser = req.user.email;

    const claims = await Claim.findAll({
      where: { email: emailUser },
      include: [
        {
          model: Laporan,
          include: [{ model: User }],
        },
      ],
    });

    const reports = claims.map((claim) => {
      const laporan = claim.Laporan.toJSON();
      laporan.Claim = claim;
      return laporan;
    });

     const user = await User.findOne({ where: { email: req.user.email } });

    res.render("my-claim", { reports, user: user });
  } catch (err) {
    console.error("Error getMyClaims:", err);
    res.status(500).send("Terjadi kesalahan");
  }
};

exports.getMyClaimsAdmin = async (req, res) => {
  try {
    const emailUser = req.user.email;

    const claims = await Claim.findAll({
      where: { email: emailUser },
      include: [
        {
          model: Laporan,
          include: [{ model: User }],
        },
      ],
    });

    const reports = claims.map((claim) => {
      const laporan = claim.Laporan.toJSON();
      laporan.Claim = claim;
      return laporan;
    });
    const pengguna = await User.findOne({ where: { email: req.user.email } });

    res.render("admin/my-claim", { reports, user: pengguna });
  } catch (err) {
    console.error("Error getMyClaims:", err);
    res.status(500).send("Terjadi kesalahan");
  }
};

exports.cancelClaim = async (req, res) => {
  try {
    const idLaporan = req.params.id_laporan;
    const emailUser = req.user.email;

    await Claim.destroy({
      where: { id_laporan: idLaporan, email: emailUser },
    });

    await Laporan.update(
      { status: "On progress", pengklaim: null, no_hp_pengklaim: null },
      { where: { id_laporan: idLaporan } }
    );

    res.redirect("/mahasiswa/my-claim");
  } catch (err) {
    console.error("Error cancelClaim:", err);
    res.status(500).send("Gagal batal klaim");
  }
};

exports.cancelClaimAdmin = async (req, res) => {
  try {
    const idLaporan = req.params.id_laporan;
    const emailUser = req.user.email;

    await Claim.destroy({
      where: { id_laporan: idLaporan, email: emailUser },
    });

    await Laporan.update(
      { status: "On progress", pengklaim: null, no_hp_pengklaim: null },
      { where: { id_laporan: idLaporan } }
    );

    res.redirect("/admin/my-claim");
  } catch (err) {
    console.error("Error cancelClaim:", err);
    res.status(500).send("Gagal batal klaim");
  }
};
