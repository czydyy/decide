/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        warm: {
          start: "#ec5930",
          mid: "#dea749",
          end: "#f6bc4f",
        },
        clean: {
          bg: "#faf8f3",
          card: "#ffffff",
          border: "#ebe5d8",
        },
        ink: {
          DEFAULT: "#1a1410",
          sec: "#6b6058",
          dim: "#a09888",
        },
        gold: {
          DEFAULT: "#d4a030",
          soft: "rgba(212,160,48,0.15)",
          text: "#b8891e",
        },
        accent: {
          DEFAULT: "#ec5930",
          hover: "#d1441e",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "20px",
        full: "9999px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        popup: "0 4px 12px rgba(0,0,0,0.10)",
        elevated: "0 8px 24px rgba(0,0,0,0.12)",
        cta: "0 4px 16px rgba(236,89,48,0.4)",
      },
    },
  },
  plugins: [],
}
