import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          50: "#eef2f7",
          100: "#d5e1ec",
          200: "#adc3d9",
          300: "#85a5c6",
          400: "#5d87b3",
          500: "#356999",
          600: "#1a5276",
          700: "#14405c",
          800: "#0e2e43",
          900: "#08202e",
          DEFAULT: "#1a5276",
        },
        gold: {
          50: "#fef8ec",
          100: "#fdedc6",
          200: "#fbd98e",
          300: "#f9c556",
          400: "#f6b124",
          500: "#f4a900",
          600: "#d49200",
          700: "#b57b00",
          800: "#966500",
          900: "#774f00",
          DEFAULT: "#f4a900",
        },
      },
    },
  },
  plugins: [],
};
export default config;
