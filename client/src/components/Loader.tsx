import { Loader2 } from "lucide-react";

const FullScreenLoader = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Extracting PDF...
        </p>
      </div>
    </div>
  );
};

export default FullScreenLoader;
