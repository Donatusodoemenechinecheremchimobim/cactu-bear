import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { 
        brand: { 
          black: '#000000', 
          dark: '#050505', 
          card: '#0a0a0a',
          neon: '#ccff00', 
          white: '#ffffff',
          gray: '#333333'
        } 
      },
      fontFamily: { 
        sans: ['var(--font-oswald)', 'sans-serif'], 
        mono: ['var(--font-courier)', 'monospace'] 
      },
      animation: { 
        marquee: 'marquee 25s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
      },
      keyframes: { 
        marquee: { '0%': { transform: 'translateX(0%)' }, '100%': { transform: 'translateX(-100%)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } }
      }
    },
  },
  plugins: [],
};
export default config;