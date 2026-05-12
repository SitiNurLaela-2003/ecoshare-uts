// ============================================
// CONFIG/DB.JS - Koneksi Database MySQL
// Dibuat oleh: Riando Muhamad Subakti
// Universitas Dian Nusantara
// ============================================

const mysql2 = require("mysql2/promise");
require("dotenv").config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecoshare_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00",
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database MySQL terhubung!");
    connection.release();
  } catch (error) {
    console.error("❌ Gagal terhubung ke database:", error.message);
    process.exit(1);
  }
};

testConnection();

module.exports = pool;