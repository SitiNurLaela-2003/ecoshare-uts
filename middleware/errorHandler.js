// ============================================
// MIDDLEWARE/ERRORHANDLER.JS - Global Error
// Dibuat oleh: Riando Muhamad Subakti
// Universitas Dian Nusantara
// ============================================

const notFound = (req, res, next) => {
  const error = new Error(`Rute tidak ditemukan: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  console.error(`❌ ERROR [${new Date().toISOString()}]:`, err.message);

  const statusCode = err.status || err.statusCode || 500;

  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Terjadi kesalahan pada server."
      : err.message;

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      status: "error",
      message: "Data sudah ada! Email mungkin sudah terdaftar.",
    });
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      status: "error",
      message: "Data referensi tidak ditemukan di database.",
    });
  }

  res.status(statusCode).json({
    status: "error",
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };