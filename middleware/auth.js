// ============================================
// MIDDLEWARE/AUTH.JS - Guard JWT & Role
// Dibuat oleh: Riando Muhamad Subakti
// Universitas Dian Nusantara
// ============================================

const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Akses ditolak! Token tidak ditemukan. Silakan login terlebih dahulu.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token kadaluarsa! Silakan login ulang.",
      });
    }
    return res.status(403).json({
      status: "error",
      message: "Token tidak valid!",
    });
  }
};

const isPemilik = (req, res, next) => {
  if (req.user.role !== "pemilik") {
    return res.status(403).json({
      status: "error",
      message: "Akses ditolak! Fitur ini hanya untuk pemilik barang.",
    });
  }
  next();
};

const isPenyewa = (req, res, next) => {
  if (req.user.role !== "penyewa") {
    return res.status(403).json({
      status: "error",
      message: "Akses ditolak! Fitur ini hanya untuk penyewa.",
    });
  }
  next();
};

module.exports = { verifyToken, isPemilik, isPenyewa };