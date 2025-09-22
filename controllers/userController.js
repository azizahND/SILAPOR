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

