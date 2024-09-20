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
exports.convertPDFBufferToImages = convertPDFBufferToImages;
const pdf_lib_1 = require("pdf-lib");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const node_poppler_1 = require("node-poppler");
function convertPDFBufferToImages(buffer, originalname) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pdfDoc = yield pdf_lib_1.PDFDocument.load(buffer);
            const totalPages = pdfDoc.getPageCount();
            const outputDir = path_1.default.join(__dirname, "output");
            yield promises_1.default.mkdir(outputDir, { recursive: true });
            const imageUrls = [];
            const tempPdfPath = path_1.default.join(outputDir, "temp.pdf");
            yield promises_1.default.writeFile(tempPdfPath, buffer);
            const poppler = new node_poppler_1.Poppler();
            for (let i = 0; i < totalPages; i++) {
                const outputPath = path_1.default.join(outputDir, `page-${i + 1}`);
                try {
                    yield poppler.pdfToCairo(tempPdfPath, outputPath, {
                        pngFile: true,
                        singleFile: true,
                        firstPageToConvert: i + 1,
                        lastPageToConvert: i + 1,
                    });
                    const uploadResult = yield cloudinary_1.default.v2.uploader.upload(outputPath + ".png", {
                        folder: "pdf-images",
                        public_id: `${originalname}/page-${(i + 1).toString()}`
                    });
                    console.log(uploadResult, "ress");
                    imageUrls.push({ pageNumber: i + 1, imageUrl: uploadResult.secure_url });
                    console.log(outputPath);
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield cloudinary_1.default.v2.uploader.destroy(uploadResult.public_id);
                            console.log(`Deleted image: ${uploadResult.public_id}`);
                        }
                        catch (deletionError) {
                            console.error(`Error deleting image: ${uploadResult.public_id}`, deletionError);
                        }
                    }), 300000);
                    yield promises_1.default.unlink(outputPath + ".png");
                }
                catch (pageError) {
                    console.error(`Error processing page ${i + 1}:`, pageError);
                }
            }
            yield promises_1.default.unlink(tempPdfPath);
            console.log(imageUrls, "urls");
            return imageUrls;
        }
        catch (error) {
            console.error("Error converting PDF buffer to images:", error);
            throw error;
        }
    });
}
