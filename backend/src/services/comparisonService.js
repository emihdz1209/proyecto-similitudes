import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WebAssembly
let wasmModule = null;
let wasmLoading = false;

async function loadWasmModule() {
  if (wasmModule) return wasmModule;
  if (wasmLoading) {
    while (wasmLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return wasmModule;
  }

  wasmLoading = true;

  try {
    const wasmPath = path.join(__dirname, "../../wasm/text_comparison.mjs");
    const wasmUrl = pathToFileURL(wasmPath).href;
    console.log("[*] Cargando módulo WASM ES6 desde:", wasmUrl);

    const { default: createModule } = await import(wasmUrl);
    console.log("[*] Función createModule importada:", typeof createModule);

    wasmModule = await createModule();

    console.log("[OK] Módulo WebAssembly inicializado correctamente");
    const functions = Object.keys(wasmModule).filter(
      (k) => typeof wasmModule[k] === "function"
    );
    console.log("[*] Funciones disponibles:", functions);

    wasmLoading = false;
    return wasmModule;
  } catch (error) {
    wasmLoading = false;
    console.error("[ERROR] No se pudo cargar WASM:", error.message);
    return null;
  }
}

loadWasmModule();

export async function uploadTexts(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No se recibieron archivos" });
    }

    const filesInfo = await Promise.all(
      req.files.map(async (file) => {
        const content = await fs.readFile(file.path, "utf-8");
        return {
          filename: file.originalname,
          size: file.size,
          path: file.path,
          length: content.length,
          preview: content.substring(0, 500),
        };
      })
    );

    res.json({
      success: true,
      message: "Archivos subidos exitosamente",
      files: filesInfo,
    });
  } catch (error) {
    console.error("Error en uploadTexts:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function preprocessText(req, res) {
  try {
    const { text, options = {} } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No se proporcionó texto" });
    }

    const wasm = await loadWasmModule();

    if (!wasm || !wasm.PreprocesarTexto) {
      let processed = text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return res.json({
        success: true,
        original: text.substring(0, 200) + "...",
        processed: processed.substring(0, 200) + "...",
        stats: {
          originalLength: text.length,
          processedLength: processed.length,
          fallback: true,
        },
      });
    }

    const startTime = Date.now();
    const processed = wasm.PreprocesarTexto(text);
    const executionTime = (Date.now() - startTime) / 1000;

    res.json({
      success: true,
      original: text.substring(0, 200) + "...",
      processed: processed.substring(0, 200) + "...",
      stats: {
        originalLength: text.length,
        processedLength: processed.length,
        executionTime,
      },
    });
  } catch (error) {
    console.error("Error en preprocessText:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function compareLCSstrChunks(req, res) {
  try {
    const { text1, text2, chunkSize = 5000 } = req.body;

    if (!text1 || !text2) {
      return res.status(400).json({ error: "Se requieren dos textos" });
    }

    console.log(
      "[*] Comparando con LCSstr (chunks), longitudes:",
      text1.length,
      text2.length
    );

    const wasm = await loadWasmModule();

    if (!wasm || !wasm.CompararLCSstrPorChunks) {
      return res.status(500).json({ error: "Función de chunks no disponible" });
    }

    const startTime = Date.now();
    const result = wasm.CompararLCSstrPorChunks(text1, text2, chunkSize);
    const executionTime = (Date.now() - startTime) / 1000;

    console.log(
      "[OK] LCSstr (chunks) completado en",
      executionTime,
      "segundos"
    );

    const jsResult = {
      algorithm: result.algorithm || "Longest Common Substring (Chunks)",
      substring: result.substring || "",
      length: result.length || 0,
      text1Length: result.text1Length || text1.length,
      text2Length: result.text2Length || text2.length,
      similarity: result.similarity || 0,
      chunksProcessed: result.chunksProcessed || 0,
      executionTime,
    };

    res.json({ success: true, result: jsResult });
  } catch (error) {
    console.error("Error en compareLCSstrChunks:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function compareLCSChunks(req, res) {
  try {
    const { text1, text2, chunkSize = 5000 } = req.body;

    if (!text1 || !text2) {
      return res.status(400).json({ error: "Se requieren dos textos" });
    }

    console.log(
      "[*] Comparando con LCS (chunks), longitudes:",
      text1.length,
      text2.length
    );

    const wasm = await loadWasmModule();

    if (!wasm || !wasm.CompararLCSPorChunks) {
      return res.status(500).json({ error: "Función de chunks no disponible" });
    }

    const startTime = Date.now();
    const result = wasm.CompararLCSPorChunks(text1, text2, chunkSize);
    const executionTime = (Date.now() - startTime) / 1000;

    console.log("[OK] LCS (chunks) completado en", executionTime, "segundos");

    const jsResult = {
      algorithm: result.algorithm || "Longest Common Subsequence (Chunks)",
      subsequence: result.subsequence || "",
      length: result.length || 0,
      text1Length: result.text1Length || text1.length,
      text2Length: result.text2Length || text2.length,
      similarity: result.similarity || 0,
      chunksProcessed: result.chunksProcessed || 0,
      executionTime,
    };

    res.json({ success: true, result: jsResult });
  } catch (error) {
    console.error("Error en compareLCSChunks:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function compareLevenshtein(req, res) {
  try {
    const { text1, text2, maxLength = 10000 } = req.body;

    if (!text1 || !text2) {
      return res.status(400).json({ error: "Se requieren dos textos" });
    }

    console.log(
      "[*] Comparando con Levenshtein, longitudes:",
      text1.length,
      text2.length
    );

    const wasm = await loadWasmModule();

    if (!wasm || !wasm.CompararLevenshtein) {
      return res
        .status(500)
        .json({ error: "Función Levenshtein no disponible" });
    }

    const startTime = Date.now();
    const result = wasm.CompararLevenshtein(text1, text2, maxLength);
    const executionTime = (Date.now() - startTime) / 1000;

    console.log("[OK] Levenshtein completado en", executionTime, "segundos");

    const jsResult = {
      algorithm: result.algorithm || "Levenshtein Distance",
      distance: result.distance || 0,
      similarity: result.similarity || 0,
      text1Length: result.text1Length || text1.length,
      text2Length: result.text2Length || text2.length,
      processedLength1: result.processedLength1 || 0,
      processedLength2: result.processedLength2 || 0,
      maxLengthUsed: result.maxLengthUsed || maxLength,
      executionTime,
    };

    res.json({ success: true, result: jsResult });
  } catch (error) {
    console.error("Error en compareLevenshtein:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function compareJaccard(req, res) {
  try {
    const { text1, text2, nGramaSize = 5 } = req.body;

    if (!text1 || !text2) {
      return res.status(400).json({ error: "Se requieren dos textos" });
    }

    console.log("[*] Comparando con Jaccard, n-grama:", nGramaSize);

    const wasm = await loadWasmModule();

    if (!wasm || !wasm.CompararJaccard) {
      return res.status(500).json({ error: "Función Jaccard no disponible" });
    }

    const startTime = Date.now();
    const result = wasm.CompararJaccard(text1, text2, nGramaSize);
    const executionTime = (Date.now() - startTime) / 1000;

    console.log("[OK] Jaccard completado en", executionTime, "segundos");

    const jsResult = {
      algorithm: result.algorithm || "Jaccard Similarity (N-Grams)",
      similarity: result.similarity || 0,
      nGramaSize: result.nGramaSize || nGramaSize,
      nGramas1Count: result.nGramas1Count || 0,
      nGramas2Count: result.nGramas2Count || 0,
      commonNGramas: result.commonNGramas || 0,
      unionSize: result.unionSize || 0,
      sampleCommonNGramas: result.sampleCommonNGramas || "",
      text1Length: result.text1Length || text1.length,
      text2Length: result.text2Length || text2.length,
      executionTime,
    };

    res.json({ success: true, result: jsResult });
  } catch (error) {
    console.error("Error en compareJaccard:", error);
    res.status(500).json({ error: error.message });
  }
}
