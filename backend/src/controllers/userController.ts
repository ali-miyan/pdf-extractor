import { Request, Response } from "express";
import { convertPDFBufferToImages } from "../helpers/extractPdf";
import { PDFDocument } from "pdf-lib";
import axios from "axios";
import cloudinary from 'cloudinary'; 
require('dotenv').config()


cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const uploadPdf = async (req: Request, res: Response): Promise<any> => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  console.log(req.file);

  const { buffer, originalname } = req.file;

  const imagePaths = await convertPDFBufferToImages(buffer, originalname);

  return res.json({ success: true, imagePaths });
};

export const extractPdf = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.body || !req.body.Images) {
    res.status(400).send("Invalid request body.");
    return;
  }

  const { Images } = req.body;

  try {
    const imageBuffers = await Promise.all(
      Images.map(async (imageUrl: string) => {
        const response = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });
        return response.data;
      })
    );

    const pdfDoc = await PDFDocument.create();
    for (const imageBuffer of imageBuffers) {
      const image = await pdfDoc.embedPng(imageBuffer);
      const page = pdfDoc.addPage();
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: page.getWidth(),
        height: page.getHeight(),
      });
    }
    const pdfBytes = await pdfDoc.save();

    const uploadResponse:any = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          { resource_type: "raw", format: "pdf", folder: "pdf-images" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(pdfBytes);
    });

    const publicId = (uploadResponse as any).asset_id;
    const downloadLink = `https://res-console.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/media_explorer_thumbnails/${publicId}/download`;
    

    res.json({ downloadLink });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).send("Error processing PDF");
  }
};
