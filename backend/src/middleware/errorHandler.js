/**
 * Middleware para manejo centralizado de errores
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Error de Multer (subida de archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'El archivo es demasiado grande',
      maxSize: process.env.MAX_FILE_SIZE
    });
  }

  if (err.message === 'Solo se permiten archivos .txt') {
    return res.status(400).json({
      error: err.message
    });
  }

  // Error generico
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}
