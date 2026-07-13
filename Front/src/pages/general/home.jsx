import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import UserLayout from "../../components/layouts/UserLayout";

function Home() {
  const [showMenu, setShowMenu] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    if (showUser) {
      setShowUser(false); // Cierra el menú de usuario si el menú principal se abre
    }
  };
  
  const toggleUser = () => setShowUser(!showUser);
  
  const closeUser = () => setShowUser(false);

  const goToLogin = () => {
    navigate('/login');
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <UserLayout>
        {/* Contenido principal */}
        <div
          className={`p-4 bg-[#1F1D2B] text-white rounded-lg shadow-lg h-full hover:shadow-xl
            ${showUser ? "lg:col-span-6" : "lg:col-span-8"}
            ${showUser ? "opacity-90" : "opacity-100"}`}
        >
          <div className="flex-1 min-h-full">
            <h1 className="text-3xl font-bold mb-6">Bienvenido al Súper Gestor</h1>
            <p className="text-gray-300 mb-8">Sistema de gestión para metahumanos y burócratas.</p>
            
            {/* Botones de acceso principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={goToLogin}
                className="bg-[#ec7c6a] hover:bg-[#d66b59] text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-3"
              >
                <FaSignInAlt className="text-xl" />
                <span>Iniciar Sesión</span>
              </button>
              
              <button
                onClick={goToRegister}
                className="bg-[#0891b2] hover:bg-[#0ea5e9] text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-3"
              >
                <FaUserPlus className="text-xl" />
                <span>Registrarse</span>
              </button>
            </div>

            {/* Información de la aplicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#262837] p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-[#ec7c6a]">Para Metahumanos</h3>
                <p className="text-gray-300">
                  Registra y gestiona tus poderes especiales. Mantén un seguimiento oficial 
                  de tus habilidades y certificaciones.
                </p>
              </div>
              
              <div className="bg-[#262837] p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-[#0891b2]">Para Burócratas</h3>
                <p className="text-gray-300">
                  Administra trámites y documentación oficial. Supervisa y aprueba 
                  registros de metahumanos de manera eficiente.
                </p>
              </div>
            </div>
          </div>
        </div>
    </UserLayout>
  );
}

export default Home;