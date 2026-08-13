import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MetahumanoLayout from "../../components/layouts/MetahumanoLayout";
import { useAuth } from "../../context/AuthContext";

function Home() {
  const [showMenu, setShowMenu] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const goToTramites = () => {
    navigate('/metahumano/tramites');
  }
  const goToCarpetas = () => {
    navigate('/metahumano/carpetas');
  }
  const goToSoporte = () => {
    navigate('/metahumano/soporte');
  }
  const goToPerfil = () => {
    navigate("/metahumano/perfil");
  }
  const goToVigilar = () => {
    navigate("/metahumano/vigilar-mundo");
  }
  const goToNoticias = () => {
    navigate("/metahumano/noticias");
  }

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    if (showUser) {
      setShowUser(false);
    }
  };
  
  const toggleUser = () => setShowUser(!showUser);
  const closeUser = () => setShowUser(false);

  const containerBg = 'bg-[#296588]';

  return (
    <MetahumanoLayout>
      {/* Contenido principal */}
      <div
        className={`p-4 ${containerBg} text-white rounded-lg shadow-lg h-full hover:shadow-xl transition-all duration-500
          ${showUser ? "lg:col-span-6" : "lg:col-span-8"}
          ${showUser ? "opacity-90" : "opacity-100"}`}
      >
        <div className="text-center text-white mt-8 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">🦸‍♀️ Portal Metahumano</h1>
          <p className="opacity-90 text-base">Bienvenido al panel de control para usuarios Metahumanos.</p>
          <br></br>
          <div className="flex flex-col items-center gap-6">
             {/* Botón Mis Trámites */}
            <button 
              onClick={goToTramites}
              className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-purple-500/30 h-full w-full max-w-md max-h-md"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-left">⚡ Mis Trámites</h2>
                  <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center group-hover:bg-purple-400/50 transition-colors">
                    <span className="text-sm">→</span>
                  </div>
                </div>
                <p className="text-purple-100 text-sm text-left leading-relaxed">
                  Administra tus trámites de roles y poderes de forma rápida y eficiente.
                </p>
              </div>
            </button>

            {/* Botón Mis Carpetas */}
            <button 
              onClick={goToCarpetas}
              className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-purple-500/30 h-full w-full max-w-md max-h-md"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-left">📂 Mis Carpetas</h2>
                  <div className="w-8 h-8 bg-yellow-500/30 rounded-full flex items-center justify-center group-hover:bg-yellow-400/50 transition-colors">
                    <span className="text-sm">→</span>
                  </div>
                </div>
                <p className="text-purple-100 text-sm text-left leading-relaxed">
                  Encontrá carpetas que te pertenezcan y donde abonar sus respectivas multas.
                </p>
              </div>
            </button>

            {/* Vigilar Mundo Metahumano */}
            <div
              onClick={goToVigilar}
              className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 text-white p-6 rounded-xl shadow-lg hover:shadow-orange-500/30 transform hover:scale-105 transition-all duration-300 border border-orange-500/30 h-full w-full max-w-md max-h-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-left">
                  🗺️ Vigilar Mundo
                </h2>
                <div className="w-8 h-8 bg-orange-500/30 rounded-full flex items-center justify-center group-hover:bg-orange-400/50 transition-colors">
                  <span className="text-sm">→</span>
                </div>
              </div>
              <p className="text-orange-100 text-sm text-left leading-relaxed">
                Monitorea bases de operaciones y reportes de destrucción a nivel nacional en tiempo real.
              </p>
            </div>

            {/* Noticias Oficiales */}
            <div
              onClick={goToNoticias}
              className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white p-6 rounded-xl shadow-lg hover:shadow-indigo-500/30 transform hover:scale-105 transition-all duration-300 border border-indigo-500/30 h-full w-full max-w-md max-h-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-left">
                  📰 Noticias Oficiales
                </h2>
                <div className="w-8 h-8 bg-indigo-500/30 rounded-full flex items-center justify-center group-hover:bg-indigo-400/50 transition-colors">
                  <span className="text-sm">→</span>
                </div>
              </div>
              <p className="text-indigo-100 text-sm text-left leading-relaxed">
                Informate sobre los últimos comunicados, alertas y noticias oficiales de la Burocracia.
              </p>
            </div>

            {/* Mi Perfil */}
            <div
              onClick={goToPerfil}
              className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white p-6 rounded-xl shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 transition-all duration-300 border border-emerald-500/30 h-full w-full max-w-md max-h-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-left">
                  👤 Mi Perfil
                </h2>
                <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center group-hover:bg-green-400/50 transition-colors">
                  <span className="text-sm">→</span>
                </div>
              </div>
              <p className="text-emerald-100 text-sm text-left leading-relaxed">
                Consultá y actualizá tu información personal, credenciales y preferencias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MetahumanoLayout>
  );
}

export default Home;