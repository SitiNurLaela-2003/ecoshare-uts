// ============================================
// CONTROLLERS/AUTHCONTROLLER.JS
// Dibuat oleh: Riando Muhamad Subakti
// Universitas Dian Nusantara
// ============================================

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const register = async (req, res, next) => {
  try {
    const { nama, email, password, role, no_hp, alamat } = req.body;

    if (!nama || !email || !password || !role) {
      return res.status(400).json({
        status: "error",
        message: "Nama, email, password, dan role wajib diisi!",
      });
    }

    if (!["penyewa", "pemilik"].includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Role harus 'penyewa' atau 'pemilik'!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password minimal 6 karakter!",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Email sudah terdaftar! Gunakan email lain.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (nama, email, password, role, no_hp, alamat)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nama, email, hashedPassword, role, no_hp || null, alamat || null]
    );

    res.status(201).json({
      status: "success",
      message: "Registrasi berhasil! Silakan login.",
      data: { id: result.insertId, nama, email, role },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email dan password wajib diisi!",
      });
    }

    const [users] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Email atau password salah!",
      });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Email atau password salah!",
      });
    }

    const token = jwt.sign(
      { id: user.id, nama: user.nama, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.status(200).json({
      status: "success",
      message: `Selamat datang, ${user.nama}!`,
      data: {
        token,
        user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, nama, email, role, no_hp, alamat, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan!",
      });
    }

    res.status(200).json({ status: "success", data: users[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };