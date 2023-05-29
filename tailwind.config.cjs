/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "3xl": "0 0px 4000px 50px rgba(62, 249, 148 ,.65)",
        'sm': "0 0px 40000px .05px var(--textc)"
       
      },
      colors: {
        g: "#3EF994",
        textc: "var(--textc)",
        bg: "var(--bg)",
      },
    },
  },
  plugins: [],
};
