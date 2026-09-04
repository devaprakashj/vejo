import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        surface: "#FFFFFF",
        surfaceBorder: "#E5E5E5",
        textPrimary: "#111111",
        textSecondary: "#666666",
        accent: "#000000",
        badgeDark: "#222222",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
