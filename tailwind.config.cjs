/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        '3xl': '0 0px 1000px 300px #3EF994',
      },
      colors: {
        g: "#3EF994",
        lb: "#1E2A44",
        b: "#162137",
      },
    },
  },
  plugins: [],
};
