import { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        foreground: 'rgba(var(--foreground))',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          hover: 'var(--color-danger-hover)',
        }
      },
      keyframes: {
        shine: {
          '0%': { 'background-position': '100%' },
          '100%': { 'background-position': '-100%' },
        },
      },
      animation: {
        shine: 'shine 5s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;