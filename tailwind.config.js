module.exports = {
  theme: {
    extend: {
      keyframes: {
        fadeDown: {
          "0%": { opacity: 0, transform: "translateY(-20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeDown: "fadeDown 0.3s ease-out",
      },
    },
  },
};
