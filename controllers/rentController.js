// ============================================
// CONTROLLERS/RENTCONTROLLER.JS
// Dibuat oleh: Riando Muhamad Subakti
// Universitas Dian Nusantara
// ============================================

const rentService = require("../services/rentService");
const pool = require("../config/db");

const createRental = async (req, res, next) => {
  try {
    const { item_id, tanggal_mulai, tanggal_selesai, catatan } = req.body;

    if (!item_id || !tanggal_mulai || !tanggal_selesai) {
      return res.status(400).json({
        status: "error",
        message: "Item ID, tanggal mulai, dan tanggal selesai wajib diisi!",
      });
    }

    const tglMulai = new Date(tanggal_mulai);
    const tglSelesai = new Date(tanggal_selesai);
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    if (isNaN(tglMulai) || isNaN(tglSelesai)) {
      return res.status(400).json({
        status: "error",
        message: "Format tanggal tidak valid! Gunakan format YYYY-MM-DD.",
      });
    }

    if (tglMulai < hariIni) {
      return res.status(400).json({
        status: "error",
        message: "Tanggal mulai tidak boleh sebelum hari ini!",
      });
    }

    if (tglSelesai <= tglMulai) {
      return res.status(400).json({
        status: "error",
        message: "Tanggal selesai harus setelah tanggal mulai!",
      });
    }

    const result = await rentService.buatRental(
      req.user.id,
      item_id,
      tanggal_mulai,
      tanggal_selesai,
      catatan
    );

    res.status(201).json({
      status: "success",
      message: "Peminjaman berhasil dibuat!",
      data: result,
    });
  } catch (error) {
    if (
      error.message.includes("tidak tersedia") ||
      error.message.includes("stok habis") ||
      error.message.includes("Tanggal")
    ) {
      return res.status(400).json({ status: "error", message: error.message });
    }
    next(error);
  }
};

const getRiwayat = async (req, res, next) => {
  try {
    const riwayat = await rentService.getRiwayatRental(req.user.id);
    res.status(200).json({
      status: "success",
      total: riwayat.length,
      data: riwayat,
    });
  } catch (error) {
    next(error);
  }
};

const selesaikanRental = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await rentService.selesaikanRental(id, req.user.id);
    res.status(200).json({
      status: "success",
      message: result.message,
      data: result,
    });
  } catch (error) {
    if (
      error.message.includes("tidak ditemukan") ||
      error.message.includes("sudah selesai")
    ) {
      return res.status(404).json({ status: "error", message: error.message });
    }
    next(error);
  }
};

const batalkanRental = async (req, res, next) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [rentals] = await connection.execute(
        `SELECT * FROM rentals
         WHERE id = ? AND penyewa_id = ? AND status = 'aktif'
         FOR UPDATE`,
        [id, req.user.id]
      );

      if (rentals.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          status: "error",
          message: "Rental tidak ditemukan atau tidak bisa dibatalkan!",
        });
      }

      await connection.execute(
        "UPDATE rentals SET status = 'dibatalkan' WHERE id = ?",
        [id]
      );

      await connection.execute(
        "UPDATE items SET stok = stok + 1, status = 'tersedia' WHERE id = ?",
        [rentals[0].item_id]
      );

      await connection.commit();

      res.status(200).json({
        status: "success",
        message: "Peminjaman berhasil dibatalkan!",
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

const getAllRentals = async (req, res, next) => {
  try {
    const [rentals] = await pool.execute(
      `SELECT r.id, r.tanggal_mulai, r.tanggal_selesai,
              r.jumlah_hari, r.total_biaya, r.status, r.created_at,
              i.nama_barang,
              u.nama AS nama_penyewa,
              u.email AS email_penyewa
       FROM rentals r
       JOIN items i ON r.item_id = i.id
       JOIN users u ON r.penyewa_id = u.id
       WHERE i.pemilik_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({
      status: "success",
      total: rentals.length,
      data: rentals,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRental,
  getRiwayat,
  selesaikanRental,
  batalkanRental,
  getAllRentals,
};