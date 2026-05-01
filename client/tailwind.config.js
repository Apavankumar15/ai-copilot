export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0f1f",
        panel: "#101827",
        line: "#273248",
        mint: "#49d6a7",
        amber: "#f5b85b"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(73, 214, 167, 0.18), 0 24px 80px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};
