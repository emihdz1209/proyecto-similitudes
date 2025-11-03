import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar módulo WebAssembly
let wasmModule = null;
let wasmLoading = false;

async function loadWasmModule() {
  if (wasmModule) return wasmModule;
  if (wasmLoading) {
    // Esperar a que termine de cargar
    while (wasmLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return wasmModule;
  }
  
  wasmLoading = true;
  
  try {
    const wasmPath = path.join(__dirname, '../../wasm/text_comparison.mjs');
    const wasmUrl = pathToFileURL(wasmPath).href;
    console.log('[*] Cargando módulo WASM ES6 desde:', wasmUrl);
    
    // Importar el módulo ES6
    const { default: createModule } = await import(wasmUrl);
    console.log('[*] Función createModule importada:', typeof createModule);
    
    // Inicializar el módulo WASM
    wasmModule = await createModule();
    
    console.log('[OK] Módulo WebAssembly inicializado correctamente');
    const functions = Object.keys(wasmModule).filter(k => typeof wasmModule[k] === 'function');
    console.log('[*] Funciones disponibles:', functions.slice(0, 20));
    
    wasmLoading = false;
    return wasmModule;
    
    console.log('[OK] Módulo WebAssembly cargado exitosamente');
    console.log('[OK] Funciones disponibles:', Object.keys(wasmModule).filter(k => typeof wasmModule[k] === 'function').slice(0, 10));
    
    wasmLoading = false;
    return wasmModule;
  } catch (error) {
    wasmLoading = false;
    console.error('[ERROR] No se pudo cargar WASM:', error.message);
    console.error('[ERROR] Stack:', error.stack);
    return null;
  }
}

// Inicializar al arrancar
loadWasmModule();

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
 * Preprocesa un texto usando WASM
 */
export async function preprocessText(req, res) {
  try {
    const { text, options = {} } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No se proporcionó texto' });
    }

    const wasm = await loadWasmModule();
    
    if (!wasm || !wasm.PreprocesarTexto) {
      console.error('[ERROR] WASM no disponible o función PreprocesarTexto no encontrada');
      // Fallback a JavaScript si WASM no carga
      let processed = text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
      
      return res.json({
        success: true,
        original: text.substring(0, 200) + '...',
        processed: processed.substring(0, 200) + '...',
        stats: {
          originalLength: text.length,
          processedLength: processed.length,
          fallback: true
        }
      });
    }

    const startTime = Date.now();
    const processed = wasm.PreprocesarTexto(text);
    const executionTime = (Date.now() - startTime) / 1000;

    res.json({
      success: true,
      original: text.substring(0, 200) + '...',
      processed: processed.substring(0, 200) + '...',
      stats: {
        originalLength: text.length,
        processedLength: processed.length,
        executionTime
      }
    });
  } catch (error) {
    console.error('Error en preprocessText:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Compara textos usando Longest Common Substring (WASM)
 */
export async function compareLCSstr(req, res) {
  try {
    const { text1, text2 } = req.body;

    if (!text1 || !text2) {
      return res.status(400).json({ error: 'Se requieren dos textos' });
    }

    console.log('[*] Comparando con LCSstr, longitudes:', text1.length, text2.length);

    const wasm = await loadWasmModule();
    
    if (!wasm || !wasm.CompararLCSstr) {
      console.error('[ERROR] WASM no disponible o función CompararLCSstr no encontrada');
      return res.status(500).json({ 
        error: 'Módulo WASM no disponible',
        details: 'El módulo WebAssembly no se cargó correctamente'
      });
    }

    const startTime = Date.now();
    
    try {
      const result = wasm.CompararLCSstr(text1, text2);
      const executionTime = (Date.now() - startTime) / 1000;
      
      console.log('[OK] LCSstr completado en', executionTime, 'segundos');
      
      // Convertir resultado de WASM a objeto JavaScript
      const jsResult = {
        algorithm: result.algorithm || 'Longest Common Substring',
        substring: result.substring || '',
        length: result.length || 0,
        text1Length: result.text1Length || text1.length,
        text2Length: result.text2Length || text2.length,
        similarity: result.similarity || 0,
        executionTime
      };

      res.json({
        success: true,
        result: jsResult
      });
    } catch (wasmError) {
      console.error('[ERROR] Error ejecutando CompararLCSstr:', wasmError);
      throw wasmError;
    }
  } catch (error) {
    console.error('Error en compareLCSstr:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Compara textos usando Longest Common Subsequence (WASM)
 */
export async function compareLCS(req, res) {
  try {
    const { text1, text2 } = req.body;

    if (!text1 || !text2) {
      return res.status(400).json({ error: 'Se requieren dos textos' });
    }

    console.log('[*] Comparando con LCS, longitudes:', text1.length, text2.length);

    const wasm = await loadWasmModule();
    
    if (!wasm || !wasm.CompararLCS) {
      console.error('[ERROR] WASM no disponible o función CompararLCS no encontrada');
      return res.status(500).json({ 
        error: 'Módulo WASM no disponible',
        details: 'El módulo WebAssembly no se cargó correctamente'
      });
    }

    const startTime = Date.now();
    
    try {
      const result = wasm.CompararLCS(text1, text2);
      const executionTime = (Date.now() - startTime) / 1000;
      
      console.log('[OK] LCS completado en', executionTime, 'segundos');
      
      // Convertir resultado de WASM a objeto JavaScript
      const jsResult = {
        algorithm: result.algorithm || 'Longest Common Subsequence',
        subsequence: result.subsequence || '',
        length: result.length || 0,
        text1Length: result.text1Length || text1.length,
        text2Length: result.text2Length || text2.length,
        similarity: result.similarity || 0,
        executionTime
      };

      res.json({
        success: true,
        result: jsResult
      });
    } catch (wasmError) {
      console.error('[ERROR] Error ejecutando CompararLCS:', wasmError);
      throw wasmError;
    }
  } catch (error) {
    console.error('Error en compareLCS:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Compara textos usando Longest Common Substring con procesamiento por chunks (WASM)
 */
export async function compareLCSstrChunks(req, res) {
  try {
    const { text1, text2, chunkSize = 5000 } = req.body;

    if (!text1 || !text2) {
      return res.status(400).json({ error: 'Se requieren dos textos' });
    }

    console.log('[*] Comparando con LCSstr (chunks), longitudes:', text1.length, text2.length, 'chunk:', chunkSize);

    const wasm = await loadWasmModule();
    
    if (!wasm || !wasm.CompararLCSstrPorChunks) {
      console.error('[ERROR] WASM no disponible o función CompararLCSstrPorChunks no encontrada');
      return res.status(500).json({ 
        error: 'Módulo WASM no disponible',
        details: 'La función de chunks no está disponible'
      });
    }

    const startTime = Date.now();
    
    try {
      const result = wasm.CompararLCSstrPorChunks(text1, text2, chunkSize);
      const executionTime = (Date.now() - startTime) / 1000;
      
      console.log('[OK] LCSstr (chunks) completado en', executionTime, 'segundos');
      console.log('[*] Chunks procesados:', result.chunksProcessed);
      
      // Convertir resultado de WASM a objeto JavaScript
      const jsResult = {
        algorithm: result.algorithm || 'Longest Common Substring (Chunks)',
        substring: result.substring || '',
        length: result.length || 0,
        text1Length: result.text1Length || text1.length,
        text2Length: result.text2Length || text2.length,
        similarity: result.similarity || 0,
        chunksProcessed: result.chunksProcessed || 0,
        executionTime
      };

      res.json({
        success: true,
        result: jsResult
      });
    } catch (wasmError) {
      console.error('[ERROR] Error ejecutando CompararLCSstrPorChunks:', wasmError);
      throw wasmError;
    }
  } catch (error) {
    console.error('Error en compareLCSstrChunks:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Compara textos usando Longest Common Subsequence con procesamiento por chunks (WASM)
 */
export async function compareLCSChunks(req, res) {
  try {
    const { text1, text2, chunkSize = 5000 } = req.body;

    if (!text1 || !text2) {
      return res.status(400).json({ error: 'Se requieren dos textos' });
    }

    console.log('[*] Comparando con LCS (chunks), longitudes:', text1.length, text2.length, 'chunk:', chunkSize);

    const wasm = await loadWasmModule();
    
    if (!wasm || !wasm.CompararLCSPorChunks) {
      console.error('[ERROR] WASM no disponible o función CompararLCSPorChunks no encontrada');
      return res.status(500).json({ 
        error: 'Módulo WASM no disponible',
        details: 'La función de chunks no está disponible'
      });
    }

    const startTime = Date.now();
    
    try {
      const result = wasm.CompararLCSPorChunks(text1, text2, chunkSize);
      const executionTime = (Date.now() - startTime) / 1000;
      
      console.log('[OK] LCS (chunks) completado en', executionTime, 'segundos');
      console.log('[*] Chunks procesados:', result.chunksProcessed);
      
      // Convertir resultado de WASM a objeto JavaScript
      const jsResult = {
        algorithm: result.algorithm || 'Longest Common Subsequence (Chunks)',
        subsequence: result.subsequence || '',
        length: result.length || 0,
        text1Length: result.text1Length || text1.length,
        text2Length: result.text2Length || text2.length,
        similarity: result.similarity || 0,
        chunksProcessed: result.chunksProcessed || 0,
        executionTime
      };

      res.json({
        success: true,
        result: jsResult
      });
    } catch (wasmError) {
      console.error('[ERROR] Error ejecutando CompararLCSPorChunks:', wasmError);
      throw wasmError;
    }
  } catch (error) {
    console.error('Error en compareLCSChunks:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}