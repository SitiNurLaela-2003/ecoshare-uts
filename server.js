// ============================================
// SERVER.JS - Entry Point Eco-Share
// Dibuat oleh: Riando Muhamad Subakti
// Universitas Dian Nusantara
// ============================================

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const rentRoutes = require("./routes/rentRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`📥 [${new Date().toLocaleTimeString("id-ID")}] ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/rentals", rentRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "🌿 Eco-Share API berjalan normal!",
    timestamp: new Date().toISOString(),
    author: "Riando Muhamad Subakti - Universitas Dian Nusantara",
  });
});

app.use(express.static(path.join(__dirname, "dist")));

// PERBAIKAN: ganti app.get("*") dengan cara yang kompatibel Node v24
app.use((req, res, next) => {
  if (req.url.startsWith("/api")) return next();
  const indexPath = path.join(__dirname, "dist", "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("================================================");
  console.log("  🌿 ECO-SHARE API SERVER");
  console.log(`  🚀 Berjalan di: http://localhost:${PORT}`);
  console.log(`  📋 Health: http://localhost:${PORT}/api/health`);
  console.log("  👤 Riando Muhamad Subakti - UNDIRA");
  console.log("================================================");
});

module.exports = app;