import React from "react";

/*eslint-disable*/
const StatCard = ({ title, value, icon: Icon, color = "cyan" }) => {
  // Determinamos el color del borde y la sombra según la propiedad "color"
  const isPink = color === "pink";
  const borderColor = isPink ? "border-neon-pink" : "border-neon-cyan";
  const shadowClass = isPink ? "shadow-glow-pink" : "shadow-glow-cyan";
  const textColor = isPink ? "text-neon-pink" : "text-neon-cyan";

  return (
    <div
      className={`
      relative overflow-hidden
      bg-neon-surface 
      border ${borderColor} 
      ${shadowClass}
      rounded-xl p-6 
      transition-transform hover:scale-105 duration-300
    `}
    >
      {/* Efecto de fondo sutil */}
      <div
        className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-10 ${isPink ? "bg-neon-pink" : "bg-neon-cyan"} blur-xl`}
      ></div>

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-neon-text text-sm uppercase tracking-wider opacity-70 mb-1">
            {title}
          </p>
          <h3 className={`text-3xl font-bold ${textColor}`}>{value}</h3>
        </div>

        <div
          className={`p-3 rounded-lg bg-opacity-10 ${isPink ? "bg-neon-pink" : "bg-neon-cyan"}`}
        >
          <Icon className={`w-8 h-8 ${textColor}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
