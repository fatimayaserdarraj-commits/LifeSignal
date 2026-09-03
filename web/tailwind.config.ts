import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F14",
        surface: "#131A22",
        surface2: "#1B242F",
        border: "#26313D",
        coral: {
          DEFAULT: "#FF6B57",
          dim: "#7A3A32",
        },
        signal: {
          DEFAULT: "#34D1BF",
          dim: "#1F6E66",
        },
        amber: {
          DEFAULT: "#F5B942",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
