import React from 'react';

export const Button = ({ children, onClick, className, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};