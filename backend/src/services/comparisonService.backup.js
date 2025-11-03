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
