import React, { useState, useEffect, useRef } from "react";

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  onRemove?: (isInitial: boolean, preview?: string | null) => void; 
  initialPreview?: string | null;
  label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageChange,
  onRemove,
  initialPreview,
  label,
}) => {
  const [preview, setPreview] = useState<string | null>(initialPreview ?? null);
  const [isInitial, setIsInitial] = useState(!!initialPreview);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setIsInitial(false);
    onImageChange(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    if (onRemove) onRemove(isInitial, initialPreview); 
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (preview && !preview.startsWith("http")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="space-y-3 w-full max-w-sm">
      <label className="block text-sm font-medium text-[#1E293B]">{label}</label>
      {preview && (
        <div className="relative h-40 rounded-lg overflow-hidden shadow bg-gray-200">
          <img
            src={preview}
            alt="Preview"
            className="object-contain w-full h-full"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            aria-label="Remove image"
          >
            ✕
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full text-sm border border-gray-300 rounded bg-white p-2"
        disabled={!!preview}
      />
    </div>
  );
};

export default ImageUpload;