// ============================================
// ROUTES/RENTROUTES.JS
// Dibuat oleh: Riando Muhamad Subakti
// Universitas Dian Nusantara
// ============================================

const express = require("express");
const router = express.Router();
const {
  createRental,
  getRiwayat,
  selesaikanRental,
  batalkanRental,
  getAllRentals,
} = require("../controllers/rentController");
const { verifyToken, isPenyewa, isPemilik } = require("../middleware/auth");

router.post("/", verifyToken, isPenyewa, createRental);
router.get("/riwayat", verifyToken, isPenyewa, getRiwayat);
router.get("/semua", verifyToken, isPemilik, getAllRentals);
router.put("/:id/selesai", verifyToken, isPenyewa, selesaikanRental);
router.put("/:id/batalkan", verifyToken, isPenyewa, batalkanRental);

module.exports = router;