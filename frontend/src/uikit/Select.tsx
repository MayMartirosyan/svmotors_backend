import React, { forwardRef } from "react";

interface Option {
  value: number | string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
  disabled?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, disabled, ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <select
          ref={ref}
          {...props}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md shadow-sm ${
            error ? "border-red-500" : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

// Select.displayName = "Select";

export default Select;
