/*eslint-disable*/
import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Inventory from "./pages/Inventory";
import Rooms from "./pages/Rooms";
import Login from "./pages/Login";
import Profile from "./pages/Profile"; // 👈 Importamos la página de Perfil

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard"); //

  // Al cargar la app, revisamos si ya hay un "gafete" (Token) guardado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // 👇 ACTUALIZADO: Función para cerrar sesión con reseteo de vista
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setCurrentPage("dashboard"); // 👈 1. Reinicia la brújula al Dashboard al salir
  };

  // ⛔ EL GUARDIÁN: Si no estás autenticado, te bloquea y muestra el Login
  if (!isAuthenticated) {
    return (
      <Login
        onLogin={() => {
          setIsAuthenticated(true);
          setCurrentPage("dashboard"); // 👈 2. Fuerza ir al Dashboard al entrar con éxito
        }}
      />
    );
  }

  // ✅ SI PASASTE, TE MUESTRA EL SISTEMA
  return (
    <div>
      {currentPage === "dashboard" && (
        <Dashboard
          onGoToInventory={() => setCurrentPage("inventory")}
          onGoToRooms={() => setCurrentPage("rooms")}
          onGoToProfile={() => setCurrentPage("profile")}
          onLogout={handleLogout}
        />
      )}

      {currentPage === "inventory" && (
        <Inventory
          onBack={() => setCurrentPage("dashboard")}
          onLogout={handleLogout}
        />
      )}

      {currentPage === "rooms" && (
        <Rooms
          onBack={() => setCurrentPage("dashboard")}
          onLogout={handleLogout}
        />
      )}

      {/* RENDERIZADO DEL PERFIL */}
      {currentPage === "profile" && (
        <Profile
          onBack={() => setCurrentPage("dashboard")}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
