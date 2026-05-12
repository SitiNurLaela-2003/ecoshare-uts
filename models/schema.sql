-- ============================================
-- ECO-SHARE DATABASE SCHEMA
-- Dibuat oleh: Riando Muhamad Subakti
-- Universitas Dian Nusantara
-- ============================================

CREATE DATABASE IF NOT EXISTS ecoshare_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecoshare_db;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('penyewa','pemilik') NOT NULL DEFAULT 'penyewa',
  no_hp VARCHAR(20),
  alamat TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pemilik_id INT NOT NULL,
  nama_barang VARCHAR(150) NOT NULL,
  deskripsi TEXT,
  harga_per_hari DECIMAL(10,2) NOT NULL,
  stok INT NOT NULL DEFAULT 1,
  kondisi ENUM('baik','cukup','perlu_perbaikan') DEFAULT 'baik',
  status ENUM('tersedia','disewa','tidak_tersedia') DEFAULT 'tersedia',
  gambar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pemilik_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rentals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  penyewa_id INT NOT NULL,
  item_id INT NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  jumlah_hari INT NOT NULL,
  total_biaya DECIMAL(10,2) NOT NULL,
  status ENUM('pending','aktif','selesai','dibatalkan') DEFAULT 'pending',
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (penyewa_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Data awal untuk testing
-- Password semua akun: password123
INSERT INTO users (nama, email, password, role, no_hp, alamat) VALUES
('Budi Pemilik', 'pemilik@ecoshare.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPZHb6CReZe',
 'pemilik', '081234567890', 'Jakarta Selatan'),
('Rina Penyewa', 'penyewa@ecoshare.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPZHb6CReZe',
 'penyewa', '089876543210', 'Tangerang');

INSERT INTO items
  (pemilik_id, nama_barang, deskripsi, harga_per_hari, stok, kondisi, status)
VALUES
(1,'Laptop ASUS VivoBook','Laptop 14 inch RAM 8GB SSD 256GB',75000,2,'baik','tersedia'),
(1,'Kamera DSLR Canon 200D','Kamera DSLR dengan lensa 18-55mm',150000,1,'baik','tersedia'),
(1,'Drone DJI Mini 2','Drone ringan fotografi udara baterai 3 unit',200000,1,'baik','tersedia'),
(1,'Proyektor Epson','Proyektor Full HD 3000 lumens',100000,1,'baik','tersedia');