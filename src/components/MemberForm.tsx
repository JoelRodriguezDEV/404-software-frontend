import { useState } from "react";

// 👇 1. Declaramos la variable de entorno
const API_BASE = (import.meta as any).env.VITE_API_BASE || "http://localhost:3000/api";

export default function MemberForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "ACTIVE",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 👇 2. Usamos la variable de entorno aquí
      const response = await fetch(`${API_BASE}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Miembro creado: ${result.name}`);
        setFormData({ name: "", email: "", status: "ACTIVE" }); // Limpiar formulario
      } else {
        alert("Error al crear el miembro");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white shadow-md rounded-lg max-w-md"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Registrar Miembro
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        Guardar Miembro
      </button>
    </form>
  );
}