import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        financial: {
          background: "#0b0e14",
          card: "#151922",
          gain: "#00c805",
          "gain-bright": "#00e676",
          loss: "#ff3b30",
          "loss-bright": "#ff5252",
        },
      },
      keyframes: {
        "flash-green": {
          "0%": { backgroundColor: "rgba(0, 230, 118, 0.28)" },
          "100%": { backgroundColor: "transparent" },
        },
        "flash-red": {
          "0%": { backgroundColor: "rgba(255, 82, 82, 0.28)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
      animation: {
        "flash-green": "flash-green 300ms ease-out",
        "flash-red": "flash-red 300ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;