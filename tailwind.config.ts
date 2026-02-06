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
        rust: {
          50: "#fdf6f0",
          100: "#f9e8d6",
          200: "#f2ceab",
          300: "#e9ac76",
          400: "#df8543",
          500: "#d4692a",
          600: "#c04f1f",
          700: "#9f3b1c",
          800: "#80311d",
          900: "#692a1a",
          950: "#38130b",
        },
        wood: {
          light: "#c9a86c",
          DEFAULT: "#8b6914",
          dark: "#5c4a1e",
        },
        ocean: {
          light: "#5b9ea6",
          DEFAULT: "#2d6a6f",
          dark: "#1a3c40",
        },
        npc: {
          bg: "#2a2a1e",
          text: "#e8d5a3",
          accent: "#f0c040",
        },
      },
      fontFamily: {
        mono: ["'Courier New'", "Courier", "monospace"],
        game: ["'Press Start 2P'", "monospace"],
      },
      backgroundImage: {
        "rust-gradient":
          "linear-gradient(135deg, #1a1a12 0%, #2a2a1e 50%, #1a3c40 100%)",
        "card-gradient":
          "linear-gradient(180deg, #2a2a1e 0%, #1f1f16 100%)",
      },
      boxShadow: {
        npc: "0 0 20px rgba(240, 192, 64, 0.15)",
        glow: "0 0 30px rgba(212, 105, 42, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
