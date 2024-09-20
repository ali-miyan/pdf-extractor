import React, { useState } from "react";
import { FiZoomIn, FiCheck, FiX } from "react-icons/fi";
import { ListPagesProps } from "../schema/interfaces";
import { CgClose } from "react-icons/cg";
import { notifyError, notifySuccess } from "../pages/Toast";
import axiosInstance from "../services/axiosInstance";
import { Download, Loader2 } from "lucide-react";

const ListPages: React.FC<ListPagesProps> = ({ pages, fileName }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [Images, setImages] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePageSelection = (pageNumber: number, imageUrl: string) => {
    setSelectedPages((prev) => {
      if (prev.includes(pageNumber)) {
        return prev.filter((num) => num !== pageNumber);
      } else {
        return [...prev, pageNumber];
      }
    });
    setImages((prev: any) => {
      if (prev.includes(imageUrl)) {
        return prev.filter((num: string) => num !== imageUrl);
      } else {
        return [...prev, imageUrl];
      }
    });
  };

  const handleRemoveSelection = (pageNumber: number) => {
    setSelectedPages((prev) => prev.filter((num) => num !== pageNumber));
  };

  const handleExtractPdf = async () => {
    if (selectedPages.length === 0) {
      notifyError("Please select at least one page to extract.");
      return;
    }
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/extract-pdf", {
        Images,
      });

      if (!response) {
        throw new Error("Failed to extract PDF");
      }

      console.log(response);
      notifySuccess(`PDF extraction successful`);
      setDownloadLink(response.data.downloadLink);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error extracting PDF:", error);
      notifyError("Failed to extract PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pb-8 flex flex-col min-h-screen">
      <div className="mb-12 text-center">
        <h1 className="text-4xl mb-6 text-gray-800 uppercase font-serif md:text-5xl">
          {fileName}
        </h1>

        <button
          onClick={handleExtractPdf}
          className="bg-red-800 hover:bg-red-700 text-white uppercase font-mono py-3 px-4 rounded shadow-lg transition-colors duration-300 md:text-sm"
        >
          {isLoading ? (
            <Loader2 className="animate-spin mr-2 inline-block" />
          ) : null}
          {isLoading ? "Extracting..." : "Extract Selected Pages"}
        </button>
      </div>
      {isModalOpen && downloadLink && (
        <div className="fixed inset-0 font-mono bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full m-4 relative">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Your PDF is ready!
              </h3>
              <p className="text-gray-600 mb-6">
                This link will expire in two minutes
              </p>
              <a
                href={downloadLink}
                download
                className="inline-flex items-center justify-center w-full px-6 py-3 text-lg font-semibold text-white bg-red-900 rounded shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2" size={24} />
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}

      {selectedPages.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold lowercase font-mono mb-3 text-black">
            Selected Pages:
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedPages.map((pageNum) => (
              <div key={pageNum} className="relative group">
                <img
                  src={pages.find((p) => p.pageNumber === pageNum)?.imageUrl}
                  alt={`Selected Page ${pageNum}`}
                  className="w-20 h-20 object-cover rounded-md border border-red-800"
                />
                <span className="absolute top-0 left-0 text-sm bg-red-800 text-white rounded-tl-md px-1">
                  {pageNum}
                </span>
                <button
                  onClick={() => handleRemoveSelection(pageNum)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pages.map((page) => (
            <div
              key={page.pageNumber}
              className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl bg-gray-200 transition-shadow duration-300"
            >
              <img
                src={page.imageUrl}
                alt={`Page ${page.pageNumber}`}
                className="w-full h-auto object-cover"
              />
              <div className="absolute top-2 left-2 right-2 flex justify-between">
                <button
                  onClick={() => {
                    handlePageSelection(page.pageNumber, page.imageUrl);
                  }}
                  className={`p-2 rounded-full  transition-colors duration-300 ${
                    selectedPages.includes(page.pageNumber)
                      ? "bg-red-800 text-white hover:bg-red-600"
                      : "bg-gray-200 text-black hover:bg-red-100"
                  }`}
                >
                  {selectedPages.includes(page.pageNumber) ? (
                    <FiCheck size={20} />
                  ) : (
                    <FiCheck size={20} />
                  )}
                </button>
                <button
                  onClick={() => setSelectedImage(page.imageUrl)}
                  className="bg-gray-200 hover:bg-gray-100 text-black p-2 rounded-full shadow-lg transition-colors duration-300"
                >
                  <FiZoomIn size={22} />
                </button>
              </div>
              <p className="my-2 text-center font-mono text-gray-700">
                Page {page.pageNumber}
              </p>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-full overflow-auto bg-white p-4 rounded-lg relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-300"
            >
              <CgClose size={20} />
            </button>
            <img
              src={selectedImage}
              alt="Zoomed page"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPages;
