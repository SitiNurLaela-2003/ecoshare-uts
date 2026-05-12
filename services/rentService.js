// ============================================
// SERVICES/RENTSERVICE.JS - Logika Bisnis
// Dibuat oleh: Riando Muhamad Subakti
// Universitas Dian Nusantara
// ============================================

const pool = require("../config/db");

const hitungBiayaSewa = (hargaPerHari, tanggalMulai, tanggalSelesai) => {
  const mulai = new Date(tanggalMulai);
  const selesai = new Date(tanggalSelesai);

  if (selesai <= mulai) {
    throw new Error("Tanggal selesai harus setelah tanggal mulai!");
  }

  const selisihMs = selesai - mulai;
  const jumlahHari = Math.ceil(selisihMs / (1000 * 60 * 60 * 24));
  const totalBiaya = jumlahHari * hargaPerHari;

  return { jumlahHari, totalBiaya };
};

const buatRental = async (
  penyewaId,
  itemId,
  tanggalMulai,
  tanggalSelesai,
  catatan
) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [items] = await connection.execute(
      "SELECT * FROM items WHERE id = ? AND status = 'tersedia' AND stok > 0 FOR UPDATE",
      [itemId]
    );

    if (items.length === 0) {
      throw new Error("Barang tidak tersedia atau stok habis!");
    }

    const item = items[0];

    const { jumlahHari, totalBiaya } = hitungBiayaSewa(
      item.harga_per_hari,
      tanggalMulai,
      tanggalSelesai
    );

    const [rental] = await connection.execute(
      `INSERT INTO rentals
        (penyewa_id, item_id, tanggal_mulai, tanggal_selesai,
         jumlah_hari, total_biaya, status, catatan)
       VALUES (?, ?, ?, ?, ?, ?, 'aktif', ?)`,
      [
        penyewaId,
        itemId,
        tanggalMulai,
        tanggalSelesai,
        jumlahHari,
        totalBiaya,
        catatan || null,
      ]
    );

    await connection.execute(
      `UPDATE items
       SET stok = stok - 1,
           status = IF(stok - 1 = 0, 'disewa', 'tersedia')
       WHERE id = ?`,
      [itemId]
    );

    await connection.commit();

    return {
      rentalId: rental.insertId,
      namaBarang: item.nama_barang,
      jumlahHari,
      totalBiaya,
      status: "aktif",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const selesaikanRental = async (rentalId, penyewaId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rentals] = await connection.execute(
      `SELECT * FROM rentals
       WHERE id = ? AND penyewa_id = ? AND status = 'aktif'
       FOR UPDATE`,
      [rentalId, penyewaId]
    );

    if (rentals.length === 0) {
      throw new Error("Rental tidak ditemukan atau sudah selesai!");
    }

    const rental = rentals[0];

    await connection.execute(
      "UPDATE rentals SET status = 'selesai' WHERE id = ?",
      [rentalId]
    );

    await connection.execute(
      "UPDATE items SET stok = stok + 1, status = 'tersedia' WHERE id = ?",
      [rental.item_id]
    );

    await connection.commit();

    return { message: "Barang berhasil dikembalikan!", rentalId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getRiwayatRental = async (penyewaId) => {
  const [rows] = await pool.execute(
    `SELECT r.id, i.nama_barang, i.gambar_url,
            r.tanggal_mulai, r.tanggal_selesai,
            r.jumlah_hari, r.total_biaya, r.status,
            r.catatan, r.created_at,
            u.nama AS nama_pemilik
     FROM rentals r
     JOIN items i ON r.item_id = i.id
     JOIN users u ON i.pemilik_id = u.id
     WHERE r.penyewa_id = ?
     ORDER BY r.created_at DESC`,
    [penyewaId]
  );
  return rows;
};

module.exports = {
  buatRental,
  selesaikanRental,
  getRiwayatRental,
  hitungBiayaSewa,
};