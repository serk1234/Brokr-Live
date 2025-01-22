"use client";

import React from "react";

function ModernButton({ text, icon, onClick, variant = "primary", className, disabled, children }) {
  const baseClasses =
    "px-4 py-2.5 rounded-xl font-medium inline-flex items-center justify-center gap-2 transition-all duration-200 text-center";
  const variants = {
    primary:
      "bg-[#A3E636] text-black hover:bg-[#93d626] shadow-[0_2px_8px_rgba(163,230,54,0.25)] hover:shadow-[0_4px_12px_rgba(163,230,54,0.35)]",
    secondary: "bg-black/5 text-black hover:bg-black/10",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={disabled}
      style={{
        height: "40px", // Consistent height
        lineHeight: "1", // Prevent misalignment
      }}
    >
      {icon && <i className={`fas ${icon} text-lg`}></i>}
      {children || <span className={!icon ? "w-full text-center" : ""}>{text}</span>}
    </button>
  );
}

export default ModernButton;

