import React, { useState, useEffect, useRef, useCallback } from "react";

interface ImageItem {
  file?: File;
  preview: string;
  isInitial?: boolean;
}

interface MultiImageUploadProps {
  onImageChange: (files: File[]) => void;
  onRemoveImage?: (index: number, preview: string, isInitial: boolean) => void;
  initialPreviews?: string[];
  label?: string;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  onImageChange,
  onRemoveImage,
  initialPreviews = [],
  label,
}) => {
  const [previews, setPreviews] = useState<ImageItem[]>(
    initialPreviews.map((preview) => ({
      file: undefined,
      preview,
      isInitial: true,
    }))
  );
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const newPreviews = selectedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        isInitial: false,
      }));
      const updatedPreviews = [...previews, ...newPreviews];
      const updatedFiles = [...files, ...selectedFiles];
      setPreviews(updatedPreviews);
      setFiles(updatedFiles);
      onImageChange(updatedFiles);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [previews, files, onImageChange]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const removedPreview = previews[index];
      const updatedPreviews = previews.filter((_, i) => i !== index);
      const updatedFiles = files.filter((_, i) => i !== index);
      setPreviews(updatedPreviews);
      setFiles(updatedFiles);
      onImageChange(updatedFiles);
      if (removedPreview && onRemoveImage) {
        onRemoveImage(
          index,
          removedPreview.preview,
          !!removedPreview.isInitial
        );
      }
      if (removedPreview.file) {
        URL.revokeObjectURL(removedPreview.preview);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [previews, files, onImageChange, onRemoveImage]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.file && !preview.preview.startsWith("http")) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
  }, [previews]);

  return (
    <div className="space-y-3 w-full">
      <label className="block text-sm font-medium text-[#1E293B]">
        {label}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {previews.map((previewItem, index) => (
          <div
            key={index}
            className="relative h-40 rounded-lg overflow-hidden shadow bg-gray-200"
          >
            <img
              src={previewItem.preview}
              alt="Preview"
              className="object-contain w-full h-full"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="w-full text-sm border border-gray-300 rounded bg-white p-2"
      />
    </div>
  );
};

export default MultiImageUpload;
