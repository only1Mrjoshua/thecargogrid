/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cargo-purple': '#2B0071',
        'cargo-orange': '#FF5500',
        'cargo-ink': '#1A1A2E',
        'cargo-ice': '#F8F9FD',
        'cargo-white': '#FFFFFF',
        'cargo-muted': '#E2E5F0',
        'cargo-success': '#10B981',
        'cargo-error': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'card': '0 8px 30px rgba(26, 26, 46, 0.06)',
      },
    },
  },
  plugins: [],
}