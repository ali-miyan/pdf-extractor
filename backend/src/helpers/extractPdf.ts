import { PDFDocument } from "pdf-lib";
import path from "path";
import fs from "fs/promises";
import cloudinary from "cloudinary";
import { Poppler } from "node-poppler";

interface Page {
  pageNumber: number;
  imageUrl: string;
}

async function convertPDFBufferToImages(buffer: Buffer , originalname: string): Promise<Page[]> {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    const totalPages = pdfDoc.getPageCount();
    const outputDir = path.join(__dirname, "output");
    await fs.mkdir(outputDir, { recursive: true });
    const imageUrls: Page[] = [];
    const tempPdfPath = path.join(outputDir, "temp.pdf");
    await fs.writeFile(tempPdfPath, buffer);

    const poppler = new Poppler();

    for (let i = 0; i < totalPages; i++) {
      const outputPath = path.join(outputDir, `page-${i + 1}`);

      try {
        await poppler.pdfToCairo(tempPdfPath, outputPath, {
          pngFile: true,
          singleFile: true,
          firstPageToConvert: i + 1,
          lastPageToConvert: i + 1,
        });

        const uploadResult = await cloudinary.v2.uploader.upload(
          outputPath + ".png",
          {
            folder: "pdf-images",
            public_id: `${originalname}/page-${(i + 1).toString()}`
          }
        );

        console.log(uploadResult, "ress");

        imageUrls.push({ pageNumber: i + 1, imageUrl: uploadResult.secure_url });
        console.log(outputPath);

        setTimeout(async () => {
          try {
            await cloudinary.v2.uploader.destroy(uploadResult.public_id);
            console.log(`Deleted image: ${uploadResult.public_id}`);
          } catch (deletionError) {
            console.error(`Error deleting image: ${uploadResult.public_id}`, deletionError);
          }
        }, 300000);

        await fs.unlink(outputPath + ".png");
      } catch (pageError) {
        console.error(`Error processing page ${i + 1}:`, pageError);
      }
    }

    await fs.unlink(tempPdfPath);
    console.log(imageUrls, "urls");

    return imageUrls;
  } catch (error) {
    console.error("Error converting PDF buffer to images:", error);
    throw error;
  }
}

export { convertPDFBufferToImages };
