import React, { forwardRef } from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  disabled?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, disabled, ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span>{label}</span>
          <input
            type="checkbox"
            ref={ref} 
            {...props}
            disabled={disabled}
            className={`h-5 w-5 text-indigo-600 border-gray-300 rounded ${
              error ? "border-red-500" : "hover:border-gray-400"
            } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />
        </label>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;