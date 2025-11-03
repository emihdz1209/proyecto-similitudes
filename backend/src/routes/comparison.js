import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  uploadTexts, 
  preprocessText, 
  compareLCSstr,
  compareLCS 
} from '../services/comparisonService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar Multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.text'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .txt'));
    }
  }
});

// Rutas

/**
 * POST /api/upload
 * Sube archivos de texto
 */
router.post('/upload', upload.array('files', 10), uploadTexts);

/**
 * POST /api/preprocess
 * Preprocesa un texto
 */
router.post('/preprocess', preprocessText);

/**
 * POST /api/compare/lcstr
 * Compara textos usando Longest Common Substring
 */
router.post('/compare/lcstr', compareLCSstr);

/**
 * POST /api/compare/lcs
 * Compara textos usando Longest Common Subsequence
 */
router.post('/compare/lcs', compareLCS);

export default router;
