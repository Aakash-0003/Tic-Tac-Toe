/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        x: "#ff3d71",
        o: "#00d4ff",
        surface: {
          DEFAULT: "#0e0e1c",
          card: "#13132a",
          border: "#1e1e3a",
          hover: "#1a1a35",
        },
        primary: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
          light: "#818cf8",
        },
      },
      fontFamily: {
        game: ["Orbitron", "monospace"],
        body: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
