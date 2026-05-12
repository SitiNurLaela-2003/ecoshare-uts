// ============================================
// ROUTES/ITEMROUTES.JS
// Dibuat oleh: Riando Muhamad Subakti
// Universitas Dian Nusantara
// ============================================

const express = require("express");
const router = express.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyItems,
} = require("../controllers/itemController");
const { verifyToken, isPemilik } = require("../middleware/auth");

router.get("/", getAllItems);
router.get("/milik-saya", verifyToken, isPemilik, getMyItems);
router.get("/:id", getItemById);
router.post("/", verifyToken, isPemilik, createItem);
router.put("/:id", verifyToken, isPemilik, updateItem);
router.delete("/:id", verifyToken, isPemilik, deleteItem);

module.exports = router;