// 1. Install Tailwind CSS and its dependencies
// Run this in your terminal:
// npm install -D tailwindcss postcss autoprefixer
// npx tailwindcss init -p

// 2. Configure your tailwind.config.js file:

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class', // or 'media' to respect system settings
    theme: {
      extend: {
        animation: {
          'fade-in': 'fadeIn 0.3s ease-out forwards',
          'slide-up': 'slideUp 0.3s ease-out forwards',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' }
          },
          slideUp: {
            '0%': { transform: 'translateY(20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' }
          }
        }
      },
    },
    plugins: [],
  }
  
  // 3. Add Tailwind directives to your main CSS file (src/index.css)
  /*
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  
  @layer base {
    :focus-visible {
      @apply outline-2 outline-offset-2 outline-blue-500;
    }
    
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  }
  */