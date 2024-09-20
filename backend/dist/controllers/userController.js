"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPdf = exports.uploadPdf = void 0;
const extractPdf_1 = require("../helpers/extractPdf");
const pdf_lib_1 = require("pdf-lib");
const axios_1 = __importDefault(require("axios"));
const cloudinary_1 = __importDefault(require("cloudinary"));
require('dotenv').config();
cloudinary_1.default.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadPdf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    console.log(req.file);
    const { buffer, originalname } = req.file;
    const imagePaths = yield (0, extractPdf_1.convertPDFBufferToImages)(buffer, originalname);
    return res.json({ success: true, imagePaths });
});
exports.uploadPdf = uploadPdf;
const extractPdf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body || !req.body.Images) {
        res.status(400).send("Invalid request body.");
        return;
    }
    const { Images } = req.body;
    try {
        const imageBuffers = yield Promise.all(Images.map((imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield axios_1.default.get(imageUrl, {
                responseType: "arraybuffer",
            });
            return response.data;
        })));
        const pdfDoc = yield pdf_lib_1.PDFDocument.create();
        for (const imageBuffer of imageBuffers) {
            const image = yield pdfDoc.embedPng(imageBuffer);
            const page = pdfDoc.addPage();
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: page.getWidth(),
                height: page.getHeight(),
            });
        }
        const pdfBytes = yield pdfDoc.save();
        const uploadResponse = yield new Promise((resolve, reject) => {
            cloudinary_1.default.v2.uploader
                .upload_stream({ resource_type: "raw", format: "pdf", folder: "pdf-images" }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            })
                .end(pdfBytes);
        });
        const publicId = uploadResponse.asset_id;
        const downloadLink = `https://res-console.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/media_explorer_thumbnails/${publicId}/download`;
        res.json({ downloadLink });
    }
    catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).send("Error processing PDF");
    }
});
exports.extractPdf = extractPdf;
