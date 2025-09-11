import React from "react";

export const Button = ({ children, onClick, type = "button", className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-white text-green-900 hover:bg-orange-600 hover:text-white focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 transition-colors duration-200 ${className}`}
    >
      {children}
    </button>
  );
};
