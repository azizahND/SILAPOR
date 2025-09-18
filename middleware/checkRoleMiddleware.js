function checkRole(role) {
  return function(req, res, next) {
    if (!req.user || !req.user.role) {
      // Handles cases where user data isn't available
      return res.status(403).json({ success: false, message: "Akses ditolak: Tidak ada peran pengguna." });
    }
    
    if (req.user.role === role) {
      next(); // Correct: User has the right role, continue to the next middleware
    } else {
      // The user does not have the required role.
      // Send a proper 403 Forbidden response and stop the chain.
      res.status(403).json({ success: false, message: "Akses ditolak: Anda tidak memiliki izin." });
    }
  };
}

module.exports = checkRole;