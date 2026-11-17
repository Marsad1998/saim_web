/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "ots-yellow": "#FFCC00",
        "ots-yellow-dark": "#E6B800",
        ots: {
          yellow: "#FFCC00",
          yellowHover: "#FFC001",
          dark: "#141720",
          black: "#000000",
          cardDark: "#1B1F2A",
          border: "#E9E9E9",
          grayText: "#7B8091",
          mutedText: "#A6ABBB",
          lightBg: "#F8F8F8",
          green: "#35A85D",
          greenDark: "#298D4C",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(13, 17, 25, 0.06)",
        header: "0 2px 10px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};
