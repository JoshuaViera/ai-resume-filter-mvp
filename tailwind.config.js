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
        fog: '#F5F5F7',
        graphite: '#1C1C1E',
        silver: '#E5E5EA',
        sky: '#007AFF',
        mint: '#30D158',
        coral: '#FF3B30',
        amber: '#FFCC00',
        ink: '#3A3A3C',
      },
    },
  },
  plugins: [],
}
