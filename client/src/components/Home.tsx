import React, { useState, useRef, ChangeEvent } from "react";
import { FiFileText, FiX } from "react-icons/fi";
import { IoIosCloudUpload } from "react-icons/io";
import { notifyError } from "../pages/Toast";
import axiosInstance from "../services/axiosInstance";
import ListPages from "./ListPages";

interface PDFFile extends File {
  type: "application/pdf";
}

const PDFExtractor: React.FC = () => {
  const [file, setFile] = useState<PDFFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [extractedPages, setExtractedPages] = useState([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      notifyError("Please select a PDF file first");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await axiosInstance.post("/upload-pdf", formData);
      setExtractedPages(res.data.imagePaths);
      console.log(res, "ress");
    } catch (err) {
      notifyError(err as string);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile as PDFFile);
    } else {
      notifyError("Only PDF files are supported");
    }
  };

  return (
    <>
      {extractedPages.length > 0 ? (
        <ListPages
          pages={extractedPages}
          fileName={file?.name || "Unnamed PDF"}
        />
      ) : (
        <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
            PDF Page Extractor
          </h1> 

          <div className="mb-8">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-300 ease-in-out"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <IoIosCloudUpload className="w-12 h-12 mb-4 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf"
                  ref={fileInputRef}
                />
              </label>
            </div>
            {file && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  <FiFileText className="w-6 h-6 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-700">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-red-500 hover:text-red-700 transition duration-300 ease-in-out"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className={`w-full py-3 px-4 flex justify-center items-center text-white font-semibold rounded transition duration-300 ease-in-out ${
              file && !loading
                ? "bg-red-900 hover:bg-red-950"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Extracting PDF...
              </>
            ) : (
              "Extract PDF"
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default PDFExtractor;
