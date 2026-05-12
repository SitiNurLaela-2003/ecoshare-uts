// ============================================
// CONTROLLERS/ITEMCONTROLLER.JS
// Dibuat oleh: Riando Muhamad Subakti
// Universitas Dian Nusantara
// ============================================

const pool = require("../config/db");

const getAllItems = async (req, res, next) => {
  try {
    const { status, kondisi, search } = req.query;

    let query = `
      SELECT i.id, i.nama_barang, i.deskripsi, i.harga_per_hari,
             i.stok, i.kondisi, i.status, i.gambar_url, i.created_at,
             u.nama AS nama_pemilik, u.no_hp AS kontak_pemilik
      FROM items i
      JOIN users u ON i.pemilik_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) { query += " AND i.status = ?"; params.push(status); }
    if (kondisi) { query += " AND i.kondisi = ?"; params.push(kondisi); }
    if (search) {
      query += " AND (i.nama_barang LIKE ? OR i.deskripsi LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY i.created_at DESC";

    const [items] = await pool.execute(query, params);

    res.status(200).json({
      status: "success",
      total: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [items] = await pool.execute(
      `SELECT i.*, u.nama AS nama_pemilik,
              u.no_hp AS kontak_pemilik,
              u.email AS email_pemilik
       FROM items i
       JOIN users u ON i.pemilik_id = u.id
       WHERE i.id = ?`,
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Barang tidak ditemukan!",
      });
    }

    res.status(200).json({ status: "success", data: items[0] });
  } catch (error) {
    next(error);
  }
};

const createItem = async (req, res, next) => {
  try {
    const { nama_barang, deskripsi, harga_per_hari, stok, kondisi, gambar_url } = req.body;

    if (!nama_barang || !harga_per_hari) {
      return res.status(400).json({
        status: "error",
        message: "Nama barang dan harga per hari wajib diisi!",
      });
    }

    if (harga_per_hari <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Harga per hari harus lebih dari 0!",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO items
        (pemilik_id, nama_barang, deskripsi, harga_per_hari,
         stok, kondisi, gambar_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'tersedia')`,
      [
        req.user.id,
        nama_barang,
        deskripsi || null,
        harga_per_hari,
        stok || 1,
        kondisi || "baik",
        gambar_url || null,
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Barang berhasil ditambahkan!",
      data: { id: result.insertId, nama_barang, harga_per_hari, stok: stok || 1 },
    });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_barang, deskripsi, harga_per_hari, stok, kondisi, status, gambar_url } = req.body;

    const [items] = await pool.execute(
      "SELECT * FROM items WHERE id = ? AND pemilik_id = ?",
      [id, req.user.id]
    );

    if (items.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Barang tidak ditemukan atau bukan milik Anda!",
      });
    }

    await pool.execute(
      `UPDATE items SET
         nama_barang   = COALESCE(?, nama_barang),
         deskripsi     = COALESCE(?, deskripsi),
         harga_per_hari= COALESCE(?, harga_per_hari),
         stok          = COALESCE(?, stok),
         kondisi       = COALESCE(?, kondisi),
         status        = COALESCE(?, status),
         gambar_url    = COALESCE(?, gambar_url)
       WHERE id = ?`,
      [nama_barang, deskripsi, harga_per_hari, stok, kondisi, status, gambar_url, id]
    );

    res.status(200).json({ status: "success", message: "Barang berhasil diperbarui!" });
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [items] = await pool.execute(
      "SELECT * FROM items WHERE id = ? AND pemilik_id = ?",
      [id, req.user.id]
    );

    if (items.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Barang tidak ditemukan atau bukan milik Anda!",
      });
    }

    await pool.execute("DELETE FROM items WHERE id = ?", [id]);

    res.status(200).json({ status: "success", message: "Barang berhasil dihapus!" });
  } catch (error) {
    next(error);
  }
};

const getMyItems = async (req, res, next) => {
  try {
    const [items] = await pool.execute(
      "SELECT * FROM items WHERE pemilik_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    res.status(200).json({ status: "success", total: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyItems,
};