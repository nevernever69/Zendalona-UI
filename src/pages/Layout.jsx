import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import LoginButton from '../components/LoginButton';
import { Info, X, Moon, Sun } from 'lucide-react';

function Layout() {
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);

  // Initialize preferences
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    const savedFontSize = localStorage.getItem('chatbot-font-size');
    const savedHighContrast = localStorage.getItem('chatbot-high-contrast') === 'true';
    const savedDarkMode = localStorage.getItem('chatbot-dark-mode') === 'true';
    if (savedFontSize) setFontSize(savedFontSize);
    if (savedHighContrast !== null) setHighContrast(savedHighContrast);
    if (savedDarkMode !== null) setDarkMode(savedDarkMode);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('chatbot-font-size', fontSize);
    localStorage.setItem('chatbot-high-contrast', highContrast.toString());
    localStorage.setItem('chatbot-dark-mode', darkMode.toString());
  }, [fontSize, highContrast, darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  const changeFontSize = (size) => {
    setFontSize(size);
  };

  const getThemeClasses = () => {
    if (highContrast) {
      return darkMode ? 'bg-black text-white' : 'bg-white text-black';
    }
    return darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800';
  };

  const getHeaderClasses = () => {
    if (highContrast) {
      return darkMode ? 'bg-blue-900 text-white border-yellow-400 border-b-2' : 'bg-blue-700 text-white border-yellow-400 border-b-2';
    }
    return darkMode ? 'bg-gray-800 text-white' : 'bg-blue-600 text-white';
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'xlarge': return 'text-xl';
      default: return 'text-base';
    }
  };

  return (
    <div className={`w-full h-screen flex flex-col ${getThemeClasses()} transition-colors duration-300 ${getFontSizeClass()}`} id="main-app-container">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white">
        Skip to main content
      </a>
      <div id="announcement" className="sr-only" aria-live="assertive"></div>
      <header className={`px-4 sm:px-6 py-4 ${getHeaderClasses()} shadow-md z-10`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg" aria-hidden="true">Z</span>
            </div>
            <Link to="/" className="text-xl font-bold hover:text-blue-200 transition-colors">
              Zendalona Assistant
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LoginButton />
            <button
              onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
              className={`p-2 rounded-full transition-colors ${
                highContrast
                  ? darkMode ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-blue-800 text-white hover:bg-blue-700'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-400'
              }`}
              aria-label="Accessibility options"
              aria-expanded={showAccessibilityMenu}
              aria-controls="accessibility-menu"
            >
              <Info size={20} />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                highContrast
                  ? darkMode ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-blue-800 text-white hover:bg-blue-700'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-400'
              }`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {showAccessibilityMenu && (
        <div
          id="accessibility-menu"
          className={`border-b ${
            highContrast
              ? darkMode ? 'bg-gray-800 text-white border-yellow-400' : 'bg-white text-black border-blue-700'
              : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } transition-all duration-300`}
          role="region"
          aria-label="Accessibility controls"
        >
          <div className="max-w-7xl mx-auto py-4 px-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Accessibility Options</h2>
              <button
                onClick={() => setShowAccessibilityMenu(false)}
                aria-label="Close accessibility menu"
                className={`p-1 rounded-full ${
                  highContrast
                    ? darkMode ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-blue-700 text-white hover:bg-blue-600'
                    : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label id="font-size-label" className="block font-medium">Font Size</label>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="font-size-label">
                  {['small', 'medium', 'large', 'xlarge'].map((size) => (
                    <button
                      key={size}
                      onClick={() => changeFontSize(size)}
                      aria-pressed={fontSize === size}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        fontSize === size
                          ? highContrast
                            ? darkMode ? 'bg-yellow-600 text-white' : 'bg-blue-700 text-white'
                            : darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                          : highContrast
                            ? darkMode ? 'bg-gray-700 text-white border border-white' : 'bg-white text-black border border-black'
                            : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label id="contrast-label" className="block font-medium">Display Options</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={toggleHighContrast}
                    aria-pressed={highContrast}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      highContrast
                        ? darkMode ? 'bg-yellow-600 text-white' : 'bg-blue-700 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-200 border border-gray-600' : 'bg-gray-200 text-gray-700 border border-gray-300'
                    }`}
                  >
                    High Contrast {highContrast ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <p>This interface follows WCAG 2.1 AA accessibility guidelines.</p>
              <p>Use keyboard navigation (Tab key) to move between elements.</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;