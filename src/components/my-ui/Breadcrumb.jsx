import React from "react";

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="text-sm text-gray-500 mb-4">
      {items.map((item, index) => (
        <span key={index}>
          {item}
          {index < items.length - 1 && " / "}
        </span>
      ))}
    </nav>
  );
};
