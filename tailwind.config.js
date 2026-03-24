/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#111118',
        surface2: '#1a1a24',
        surface3: '#22223a',
        border: '#2a2a3a',
        primary: '#6366f1',
        'primary-hover': '#4f52d6',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        text: '#e2e8f0',
        'text-muted': '#64748b',
        'text-secondary': '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-success': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      },
    },
  },
  plugins: [],
};
