import React from 'react';

function HighContrastToggle({ isHighContrast, setIsHighContrast }) {
  return (
    <button
      onClick={() => setIsHighContrast(!isHighContrast)}
      className="mt-2 px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
      aria-label={isHighContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
    >
      {isHighContrast ? 'Normal Mode' : 'High Contrast Mode'}
    </button>
  );
}

export default HighContrastToggle;