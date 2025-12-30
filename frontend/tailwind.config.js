/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores padrão SEI
        'sei-blue': '#0066cc',
        'sei-blue-dark': '#004d99',
        'sei-blue-light': '#3385d6',
        'sei-gray': '#f5f5f5',
        'sei-gray-dark': '#333333',
        'sei-border': '#cccccc',
        'sei-header': '#003d82',
        'sei-menu': '#f0f0f0',
      },
    },
  },
  plugins: [],
}
