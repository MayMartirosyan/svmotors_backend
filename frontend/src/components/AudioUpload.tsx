import React, { useState, useEffect, useRef, useCallback } from "react";

interface AudioUploadProps {
  onChange: (file: File | null) => void;
  onRemove?: () => void;
  initialPreview?: string | null;
  label?: string;
}

const AudioUpload: React.FC<AudioUploadProps> = ({
  onChange,
  onRemove,
  initialPreview,
  label,
}) => {
  const [preview, setPreview] = useState<string | null>(initialPreview ?? null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setPreview(URL.createObjectURL(file));
        onChange(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [onChange]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    onRemove && onRemove();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onChange, onRemove]);

  useEffect(() => {
    return () => {
      if (preview && !preview.startsWith("http")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="space-y-3 w-full max-w-sm">
      <label className="block text-sm font-medium text-[#1E293B]">
        {label}
      </label>
      {preview && (
        <div className="relative h-12 rounded-lg overflow-hidden shadow bg-gray-200">
          <audio controls src={preview} className="w-full h-full" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            aria-label="Remove audio"
          >
            ✕
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/mp4,audio/mpeg,audio/wav"
        onChange={handleFileChange}
        className="w-full text-sm border border-gray-300 rounded bg-white p-2"
      />
    </div>
  );
};

export default AudioUpload;
