/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // AQUÍ ESTÁN TUS COLORES PERSONALIZADOS
        neon: {
          bg: "#050510", // Fondo oscuro
          surface: "#0F0F25", // Fondo tarjetas
          pink: "#F941A9", // Rosa
          cyan: "#00E5FF", // Cian
          purple: "#7B2CBF", // Morado
          text: "#E0E0FF", // Texto claro
        },
      },
      boxShadow: {
        "glow-pink": "0 0 20px -5px rgba(249, 65, 169, 0.5)",
        "glow-cyan": "0 0 20px -5px rgba(0, 229, 255, 0.5)",
      },
    },
  },
  plugins: [],
};
