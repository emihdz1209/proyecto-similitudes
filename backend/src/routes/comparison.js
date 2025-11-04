import express from "express";
import {
  uploadTexts,
  preprocessText,
  compareLCSstr,
  compareLCS,
  compareLCSstrChunks,
  compareLCSChunks,
  compareLevenshtein,
  compareJaccard,
} from "../services/comparisonService.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/upload", upload.array("files"), uploadTexts);
router.post("/preprocess", preprocessText);

router.post("/compare/lcstr-chunks", compareLCSstrChunks);
router.post("/compare/lcs-chunks", compareLCSChunks);

router.post("/compare/levenshtein", compareLevenshtein);
router.post("/compare/jaccard", compareJaccard);

export default router;