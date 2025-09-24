import React from "react";
import { PlusOutlined } from "@ant-design/icons";

export const Card = ({ 
  children, 
  title, 
  buttonText, 
  addBouton = false, 
  className = "",
  headerBgColor = "bg-gray-600",
  onClickAddButton
}) => {
  return (
    <div className="w-full mx-4 dark:bg-gray-500">
      <div className={`col-span-full mt-1 xl:col-span-8 bg-white dark:bg-gray-800 shadow-xs h-[95vh] overflow-y-auto mb-4 rounded-md border-t-2 border-x-2 border-b-0  ${className}`}>
        <header className={`px-4 sm:px-6 py-1 dark:bg-gray-800 rounded-t-md border-b border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl md:text-2xl text-gray-900  truncate font-bold">
              {title || "Titre du modal"}
            </h2>
            {addBouton && (
              <button
                type="button"
                className="bg-green-900 text-white hover:bg-green-600 hover:text-white focus:ring-4 focus:ring-green-300 rounded-lg text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 text-center transition-colors duration-200 flex items-center gap-1"
                onClick={onClickAddButton}
              >
                <PlusOutlined className="text-xs sm:text-sm" /> 
                <span className="hidden xs:inline">{buttonText}</span>
              </button>
            )}
          </div>
        </header>
        <div className="p-2 sm:p-3 rounded-b-md">
          {children}
        </div>
      </div>
    </div>
  );
};