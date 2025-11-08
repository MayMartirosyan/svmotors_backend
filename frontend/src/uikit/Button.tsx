import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  type = "button",
  children,
  className = "",
  ...props
}) => {
  const baseStyles = "w-full p-2 rounded transition-colors";
  const variantStyles = {
    primary: "bg-[#6366F1] text-white hover:bg-[#4F46E5]",
    danger: "bg-[#EF4444] text-white hover:bg-[#DC2626]",
  };

  const isDsabled = props.disabled ? 'opacity-50 cursor-text' : ''

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${isDsabled}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
