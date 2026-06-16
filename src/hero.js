const { heroui } = require("@heroui/theme");

module.exports = heroui({
  themes: {
    light: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5",
          foreground: "#ffffff",
        },
      },
    },
    dark: {
      colors: {
        primary: {
          DEFAULT: "#6366f1",
          foreground: "#ffffff",
        },
      },
    },
  },
  layout: {
    radius: {
      small: "0.25rem",
      medium: "0.375rem",
      large: "0.5rem",
    },
  },
});
