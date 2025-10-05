const { User } = require('../models');
const path = require('path');
const fs = require('fs');
const bcrypt = require("bcryptjs");

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'ASC']],
    });
    res.render('admin/user', { title: 'Manajemen User', users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).render('error', {
        message: 'Terjadi kesalahan saat memuat daftar user',
    });
    }
};
exports.deleteUser = async (req, res) => {
  try {
    const userEmail = req.params.email;   
    await User.destroy({ where: { email: userEmail } });
    res.redirect('/admin/userList');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).render('error', {
        message: 'Terjadi kesalahan saat menghapus user',
    });
  }
};
exports.showEditForm = async (req, res) => {
    try {
        const userEmail = req.params.email;
        const user = await User.findByPk(userEmail, {
            attributes: { exclude: ['password'] } 
        });
        if (!user) {
            return res.status(404).render('error', { message: 'User tidak ditemukan' });
        }
        res.render('admin/editUser', { title: 'Edit User', user });
    } catch (error) {
        console.error('Error fetching user for edit:', error);
        res.status(500).render('error', {
            message: 'Terjadi kesalahan saat memuat data user',
        });
    }   
};

exports.updateUser = async (req, res) => {
    try {
        const userEmail = req.params.email;
        const { nama, email, no_telepon, alamat, role } = req.body;
        await User.update(
            { nama, email, no_telepon, alamat, role },
            { where: { email: userEmail } }
        );
        res.redirect('/admin/userList');
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).render('error', {
            message: 'Terjadi kesalahan saat memperbarui data user',
        });
    }
};

exports.createUser = async (req, res) => {  
    try {
        const { nama, email, no_telepon, alamat, password, role } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.create({ nama, email, no_telepon, alamat, password: hashedPassword, role, isVerified: 1 });
        res.redirect('/admin/userList');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).render('error', {  
            message: 'Terjadi kesalahan saat membuat user baru',
        });
    }
};

// Admin profile methods
exports.showAdminProfile = async (req, res) => {
    try {
        const userEmail = req.user.email; 
        const user = await User.findOne({ where: { email: userEmail } });

        if (!user) {
            return res.status(404).send("User tidak ditemukan");
        }

        res.render("admin/profile", { user });
    } catch (err) {
        console.error("Error showAdminProfile:", err);
        res.status(500).send("Gagal mengambil data profil");
    }
};

exports.showAdminEditProfile = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const user = await User.findOne({ where: { email: userEmail } });

        if (!user) {
            return res.status(404).send("User tidak ditemukan");
        }

        res.render("admin/edit-profile", { user });
    } catch (err) {
        console.error("Error showAdminEditProfile:", err);
        res.status(500).send("Gagal memuat form edit");
    }
};

exports.updateAdminProfile = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { nama, email, alamat, no_telepon } = req.body;

        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).send("User tidak ditemukan");
        }

        // Upload foto baru
        if (req.file) {
            if (user.foto && user.foto !== "default.jpg") {
                const oldPath = path.join(__dirname, "../public/uploads", user.foto);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            user.foto = req.file.filename;
        }

        // Update field
        user.nama = nama || user.nama;
        user.alamat = alamat || user.alamat;
        user.no_telepon = no_telepon || user.no_telepon; 

        await user.save();
        
        // Redirect ke halaman profile setelah berhasil update
        return res.redirect("/admin/profile");
    } catch (error) {
        console.error("Error updateAdminProfile:", error);
        return res.status(500).send("Terjadi kesalahan saat update profile");
    }
};

