// src/utils/animationOptions.js

export const rainOptions = {
  particles: {
    number: { value: 100, density: { enable: true, value_area: 800 } },
    color: { value: "#a0aec0" }, // Warna hujan (abu-abu kebiruan)
    shape: { type: "line" },
    opacity: { value: 0.5, random: true },
    size: { value: 15, random: { enable: true, minimumValue: 5 } },
    move: {
      enable: true,
      speed: 10,
      direction: "bottom_left",
      straight: true,
      out_mode: "out",
    },
  },
  interactivity: { events: { onhover: { enable: false }, onclick: { enable: false } } },
};

export const snowOptions = {
  particles: {
    number: { value: 50, density: { enable: true, value_area: 800 } },
    color: { value: "#ffffff" },
    shape: { type: "circle" },
    opacity: { value: 0.7, random: true },
    size: { value: 3, random: true },
    move: {
      enable: true,
      speed: 2,
      direction: "bottom",
      straight: false,
      out_mode: "out",
    },
  },
  interactivity: { events: { onhover: { enable: false }, onclick: { enable: false } } },
};