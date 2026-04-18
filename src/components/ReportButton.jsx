import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const ReportButton = () => {
  const [loading, setLoading] = useState(false);

  const downloadReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/financial`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al generar el reporte");

      // Convertimos la respuesta en un archivo (Blob)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Creamos un link invisible para forzar la descarga
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_404_${new Date().toLocaleDateString()}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Limpieza
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar con el servidor 404.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={downloadReport}
      disabled={loading}
      className={`
        px-6 py-3 rounded-lg font-bold uppercase tracking-widest transition-all duration-300
        ${
          loading
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-transparent border-2 border-[#F941A9] text-[#F941A9] hover:bg-[#F941A9] hover:text-white hover:shadow-[0_0_20px_#F941A9]"
        }
      `}
    >
      {loading ? "Generando..." : "Descargar Reporte Operativo"}
    </button>
  );
};

export default ReportButton;
