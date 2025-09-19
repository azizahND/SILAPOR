function checkRole(role) {
  return function(req, res, next) {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: "Akses ditolak: Tidak ada peran pengguna." });
    }
    
    if (req.user.role === role) {
      next(); 
    } else {
      res.status(403).json({ success: false, message: "Akses ditolak: Anda tidak memiliki izin." });
    }
  };
}

module.exports = checkRole;