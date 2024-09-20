import express from "express";
import multer from "multer";

import { extractPdf, uploadPdf } from "../controllers/userController";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/upload-pdf", upload.single("pdf"), uploadPdf);
router.post("/extract-pdf", extractPdf);

export default router;
