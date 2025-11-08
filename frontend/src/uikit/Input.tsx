import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          {...props}
          ref={ref}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none  text-[#1E293B] bg-white ${
            error
              ? "border-red-500"
              : "border-gray-300 hover:border-gray-400"
          }`}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

// Input.displayName = "Input";

export default Input;
