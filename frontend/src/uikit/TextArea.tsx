import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          {...props}
          ref={ref}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none text-[#1E293B] bg-white resize-none ${
            error ? "border-red-500" : "border-gray-300 hover:border-gray-400"
          }`}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

export default Textarea;
