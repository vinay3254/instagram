/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#121212",
        panel: "#1a1a1a",
        elevated: "#262626",
        border: "#262626",
        accent: "#0095f6",
        accentSoft: "#1877f2",
        muted: "#a8a8a8",
        soft: "#737373",
      },
      boxShadow: {
        panel: "0 24px 48px -24px rgba(0, 0, 0, 0.5)",
        lifted: "0 0 0 1px rgba(38, 38, 38, 1), 0 24px 60px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};
