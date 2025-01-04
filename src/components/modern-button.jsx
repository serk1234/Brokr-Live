"use client";

import React from "react";

function ModernButton({ text, icon, onClick, variant = "primary" }) {
  const baseClasses =
    "px-4 py-2.5 rounded-xl font-medium inline-flex items-center gap-2 transition-all duration-200";
  const variants = {
    primary:
      "bg-[#A3E636] hover:bg-[#93d626] text-black shadow-[0_2px_8px_rgba(163,230,54,0.25)] hover:shadow-[0_4px_12px_rgba(163,230,54,0.35)]",
    secondary: "bg-black/5 hover:bg-black/10 text-black",
    danger: "bg-red-50 hover:bg-red-100 text-red-600",
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
      <i className={`fas ${icon} text-lg`}></i>
      <span>{text}</span>
    </button>
  );
}

export default ModernButton;
