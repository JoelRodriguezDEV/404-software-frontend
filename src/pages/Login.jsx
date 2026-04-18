/*eslint-disable*/
import React, { useState } from "react";
import { Lock, User, Terminal } from "lucide-react";
import logo404 from "../assets/logo.png"; // Asegúrate de que la ruta al logo sea correcta

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- FUNCIÓN DE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Guardamos el token y los datos del usuario en el navegador
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(); // Le avisamos a App.jsx que abra las puertas
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      setError("Error conectando al servidor central.");
    } finally {
      setLoading(false);
    }
  };

  // --- TRUCO: CREAR PRIMER ADMIN (Solo funciona la primera vez) ---
  const handleSetup = async () => {
    const res = await fetch(`${API_BASE}/auth/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "123" }),
    });
    if (res.ok) alert("✅ Admin creado (Usuario: admin | Clave: 123)");
    else alert("❌ El administrador ya existe o hubo un error.");
  };

  return (
    <div className="min-h-screen bg-[#090910] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Efectos de fondo neón */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00E5FF] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F941A9] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>

      <div className="z-10 w-full max-w-md p-8 bg-[#13131F]/80 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          {logo404 ? (
            <img
              src={logo404}
              alt="404 Logo"
              className="h-16 mb-4 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-800 rounded-xl mb-4 flex items-center justify-center">
              <Terminal size={32} className="text-[#00E5FF]" />
            </div>
          )}
          <h2 className="text-2xl font-black text-white tracking-widest uppercase">
            Sistema <span className="text-[#F941A9]">Restringido</span>
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Ingrese credenciales de operador
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center font-bold uppercase tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="USUARIO"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#090910] border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all uppercase"
              required
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="password"
              placeholder="CONTRASEÑA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#090910] border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:border-[#F941A9] focus:ring-1 focus:ring-[#F941A9] outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#00E5FF] to-[#0088ff] hover:from-[#00c2d6] hover:to-[#0066cc] text-black font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] disabled:opacity-50 mt-4"
          >
            {loading ? "VERIFICANDO..." : "ACCEDER AL SISTEMA"}
          </button>
        </form>

        {/* Botón oculto para inicializar la base de datos la primera vez */}
        <button
          onClick={handleSetup}
          className="w-full text-center mt-6 text-[10px] text-gray-700 hover:text-gray-400 transition-colors uppercase tracking-widest"
        >
          [ Inicializar Base de Datos ]
        </button>
      </div>
    </div>
  );
};

export default Login;
