import express from "express";
import {
  uploadTexts,
  preprocessText,
  compareLCSstr,
  compareLCS,
  compareLCSstrChunks,
  compareLCSChunks,
} from "../services/comparisonService.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/upload", upload.array("files"), uploadTexts);
router.post("/preprocess", preprocessText);
router.post("/compare/lcstr", compareLCSstr);              // Agregado /compare
router.post("/compare/lcs", compareLCS);                    // Agregado /compare
router.post("/compare/lcstr-chunks", compareLCSstrChunks);  // Agregado /compare
router.post("/compare/lcs-chunks", compareLCSChunks);       // Agregado /compare

export default router;