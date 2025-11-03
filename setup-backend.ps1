# ============================================================================
# Script de Configuracion del Backend - Node.js + Express
# Para Windows PowerShell
# ============================================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Configurando Backend (Node.js + Express)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "backend")) {
    Write-Host "[ERROR] No se encuentra el directorio 'backend'" -ForegroundColor Red
    Write-Host "   Ejecuta primero setup-proyecto-v2.ps1" -ForegroundColor Yellow
    exit 1
}

Set-Location "backend"

# ============================================================================
# Verificar Node.js
# ============================================================================
Write-Host "[*] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  [OK] Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Node.js no esta instalado" -ForegroundColor Red
    Write-Host "  Descargalo de: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "  [OK] npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] npm no esta instalado" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ============================================================================
# Inicializar proyecto Node.js
# ============================================================================
Write-Host "[*] Inicializando proyecto Node.js..." -ForegroundColor Yellow

$packageJson = @"
{
  "name": "similitudes-backend",
  "version": "1.0.0",
  "description": "Backend para sistema de busqueda de similitudes entre textos",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "keywords": ["text-comparison", "wasm", "algorithms"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
"@

Set-Content -Path "package.json" -Value $packageJson
Write-Host "  [OK] package.json creado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Instalar dependencias
# ============================================================================
Write-Host "[*] Instalando dependencias..." -ForegroundColor Yellow
Write-Host "   (Esto puede tomar unos minutos...)" -ForegroundColor Gray
Write-Host ""

npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  [OK] Dependencias instaladas exitosamente!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  [ERROR] Error al instalar dependencias" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ============================================================================
# Crear archivo .env
# ============================================================================
Write-Host "[*] Creando archivo de configuracion..." -ForegroundColor Yellow

$envContent = @"
# Puerto del servidor
PORT=3001

# Entorno
NODE_ENV=development

# Configuracion de archivos
MAX_FILE_SIZE=50000000
UPLOAD_DIR=./uploads
RESULTS_DIR=./results

# CORS
CORS_ORIGIN=http://localhost:5173
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "  [OK] .env creado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Crear servidor Express
# ============================================================================
Write-Host "[*] Creando servidor Express..." -ForegroundColor Yellow

$serverContent = @"
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import comparisonRoutes from './routes/comparison.js';
import { errorHandler } from './middleware/errorHandler.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: 'API de Comparacion de Textos',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      upload: '/api/upload',
      preprocess: '/api/preprocess',
      compare: '/api/compare'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rutas de la API
app.use('/api', comparisonRoutes);

// Manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log('');
  console.log('[*] Servidor corriendo en http://localhost:' + PORT);
  console.log('[*] Ambiente: ' + process.env.NODE_ENV);
  console.log('[*] CORS habilitado para: ' + process.env.CORS_ORIGIN);
  console.log('');
});

export default app;
"@

Set-Content -Path "src\server.js" -Value $serverContent -Encoding UTF8
Write-Host "  [OK] src/server.js creado" -ForegroundColor Green

# ============================================================================
# Crear rutas
# ============================================================================
$routesContent = @"
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
"@

Set-Content -Path "src\routes\comparison.js" -Value $routesContent -Encoding UTF8
Write-Host "  [OK] src/routes/comparison.js creado" -ForegroundColor Green

# ============================================================================
# Crear servicios
# ============================================================================
$serviceContent = @"
import fs from 'fs/promises';
import path from 'path';

/**
 * Servicio de comparacion de textos
 * Aqui se integraran las funciones WebAssembly
 */

// TODO: Cargar modulo WebAssembly cuando este compilado
// import wasmModule from '../wasm/text_algorithms.js';

/**
 * Sube y procesa archivos de texto
 */
export async function uploadTexts(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se recibieron archivos' });
    }

    const filesInfo = await Promise.all(
      req.files.map(async (file) => {
        const content = await fs.readFile(file.path, 'utf-8');
        return {
          filename: file.originalname,
          size: file.size,
          path: file.path,
          length: content.length,
          preview: content.substring(0, 500)
        };
      })
    );

    res.json({
      success: true,
      message: 'Archivos subidos exitosamente',
      files: filesInfo
    });
  } catch (error) {
    console.error('Error en uploadTexts:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Preprocesa un texto (implementacion temporal en JavaScript)
 * TODO: Reemplazar con llamada a funcion WASM
 */
export async function preprocessText(req, res) {
  try {
    const { text, options = {} } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No se proporciono texto' });
    }

    // Implementacion temporal en JavaScript
    let processed = text;

    // Convertir a minusculas
    if (options.lowercase !== false) {
      processed = processed.toLowerCase();
    }

    // Eliminar puntuacion
    if (options.removePunctuation !== false) {
      processed = processed.replace(/[^\w\s]/g, ' ');
    }

    // Eliminar espacios multiples
    processed = processed.replace(/\s+/g, ' ').trim();

    // Estadisticas
    const originalLength = text.length;
    const processedLength = processed.length;
    const wordCount = processed.split(' ').filter(w => w.length > 0).length;

    res.json({
      success: true,
      original: text.substring(0, 200) + '...',
      processed: processed.substring(0, 200) + '...',
      stats: {
        originalLength,
        processedLength,
        wordCount,
        reduction: ((1 - processedLength / originalLength) * 100).toFixed(2) + '%'
      }
    });
  } catch (error) {
    console.error('Error en preprocessText:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Compara textos usando Longest Common Substring
 * TODO: Integrar con WebAssembly
 */
export async function compareLCSstr(req, res) {
  try {
    const { text1, text2 } = req.body;

    if (!text1 || !text2) {
      return res.status(400).json({ error: 'Se requieren dos textos' });
    }

    // Implementacion temporal (dummy)
    const startTime = Date.now();
    
    // TODO: Llamar a funcion WASM
    const result = {
      algorithm: 'Longest Common Substring',
      substring: 'Ejemplo de substring comun',
      length: 100,
      text1Length: text1.length,
      text2Length: text2.length,
      similarity: 15.5,
      executionTime: (Date.now() - startTime) / 1000
    };

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error en compareLCSstr:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Compara textos usando Longest Common Subsequence
 * TODO: Integrar con WebAssembly
 */
export async function compareLCS(req, res) {
  try {
    const { text1, text2 } = req.body;

    if (!text1 || !text2) {
      return res.status(400).json({ error: 'Se requieren dos textos' });
    }

    const startTime = Date.now();
    
    // TODO: Llamar a funcion WASM
    const result = {
      algorithm: 'Longest Common Subsequence',
      subsequence: 'Ejemplo de subsecuencia comun',
      length: 150,
      text1Length: text1.length,
      text2Length: text2.length,
      similarity: 22.3,
      executionTime: (Date.now() - startTime) / 1000
    };

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error en compareLCS:', error);
    res.status(500).json({ error: error.message });
  }
}
"@

Set-Content -Path "src\services\comparisonService.js" -Value $serviceContent -Encoding UTF8
Write-Host "  [OK] src/services/comparisonService.js creado" -ForegroundColor Green

# ============================================================================
# Crear middleware de manejo de errores
# ============================================================================
$errorHandlerContent = @"
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
"@

Set-Content -Path "src\middleware\errorHandler.js" -Value $errorHandlerContent -Encoding UTF8
Write-Host "  [OK] src/middleware/errorHandler.js creado" -ForegroundColor Green

# ============================================================================
# Crear archivos .gitkeep
# ============================================================================
New-Item -ItemType File -Path "uploads\.gitkeep" -Force | Out-Null
New-Item -ItemType File -Path "results\.gitkeep" -Force | Out-Null
New-Item -ItemType File -Path "wasm\.gitkeep" -Force | Out-Null
Write-Host "  [OK] Archivos .gitkeep creados" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Resumen final
# ============================================================================
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  [OK] Backend configurado exitosamente!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[*] Paquetes instalados:" -ForegroundColor Yellow
Write-Host "  - Express (servidor web)" -ForegroundColor White
Write-Host "  - CORS (peticiones cross-origin)" -ForegroundColor White
Write-Host "  - Multer (subida de archivos)" -ForegroundColor White
Write-Host "  - dotenv (variables de entorno)" -ForegroundColor White
Write-Host "  - nodemon (auto-reload en desarrollo)" -ForegroundColor White
Write-Host ""
Write-Host "[*] Para iniciar el servidor:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "[*] El servidor estara en:" -ForegroundColor Yellow
Write-Host "   http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "[*] Proximo paso:" -ForegroundColor Yellow
Write-Host "   Ejecuta setup-frontend-v2.ps1 para configurar React" -ForegroundColor White
Write-Host ""

Set-Location ..