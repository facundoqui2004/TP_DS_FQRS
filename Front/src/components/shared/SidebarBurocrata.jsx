import React from "react";
import { RiHome6Line } from "react-icons/ri";
import { FaRegFolder, FaRegUserCircle } from "react-icons/fa";
import { MdContactSupport } from "react-icons/md";
import { CiLogout } from "react-icons/ci";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar = (props) => {
  const { showMenu, toggleUser } = props;
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error durante logout:", error);
      navigate("/");
    }
  };

  return (
    <div
      className={`bg-[#f1a035] fixed lg:left-0 top-0 w-28 h-full flex flex-col justify-between py-6 rounded-tr-xl rounded-br-xl z-50 transition-all duration-300 ease-in-out shadow-lg
      ${showMenu ? "left-0" : "-left-full"} lg:left-0`}
    >
      {/* Logo */}
      <div className="text-center my-4 relative group">
        <img
          src="/Images/burocrataLogo.png"
          alt="Logo El Súper Gestor"
          className="mx-auto w-25 h-auto cursor-pointer"
        />
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <div className="relative bg-red-500 text-white px-4 py-3 rounded-lg text-sm font-bold border-4 border-black shadow-lg transform rotate-1 whitespace-nowrap">
            <div className="relative z-10">
              <div className="text-yellow-300 text-lg font-black tracking-wide drop-shadow-lg">
                EL SUPER GESTOR!
              </div>
            </div>
            <div className="absolute inset-0 opacity-20">
              <div className="w-2 h-2 bg-yellow-300 rounded-full absolute top-2 left-2"></div>
              <div className="w-1 h-1 bg-yellow-300 rounded-full absolute top-4 left-6"></div>
              <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full absolute bottom-3 right-3"></div>
              <div className="w-1 h-1 bg-yellow-300 rounded-full absolute bottom-2 right-6"></div>
            </div>
            <div className="absolute right-full top-1/2 transform -translate-y-1/2">
              <div className="border-8 border-transparent border-r-red-500"></div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 border-4 border-transparent border-r-black"></div>
            </div>
            <div className="absolute inset-0 bg-black rounded-lg transform translate-x-1 translate-y-1 -z-10"></div>
          </div>
        </div>
      </div>

      {/* Lista de enlaces */}
      <div>
        <ul className="pl-4">
          {/* Inicio */}
          <li className="hover:bg-[#f8d19d] p-4 block rounded-tl-xl rounded-bl-xl group transition-colors">
            <button
              onClick={() => navigate("/burocrata")}
              className="group-hover:bg-[#f1a035] p-4 flex justify-center w-full rounded-xl text-white group-hover:text-white relative cursor-pointer"
            >
              <RiHome6Line className="text-2xl" />
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-[#f1a035] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Inicio
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-[#f1a035]"></div>
              </div>
            </button>
          </li>

          {/* Carpetas */}
          <li className="hover:bg-[#f8d19d] p-4 block rounded-tl-xl rounded-bl-xl group transition-colors">
            <button
              onClick={() => navigate("/burocrata/carpetas")}
              className="group-hover:bg-[#f1a035] p-4 flex justify-center w-full rounded-xl text-white group-hover:text-white relative cursor-pointer"
            >
              <FaRegFolder className="text-2xl" />
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-[#f1a035] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Carpetas
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-[#f1a035]"></div>
              </div>
            </button>
          </li>

          {/* Mi Perfil */}
          <li className="hover:bg-[#f8d19d] p-4 block rounded-tl-xl rounded-bl-xl group transition-colors">
            <button
              onClick={() => navigate("/burocrata/perfil")}
              className="group-hover:bg-[#f1a035] p-4 flex justify-center w-full rounded-xl text-white group-hover:text-white relative cursor-pointer"
            >
              <FaRegUserCircle className="text-2xl" />
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-[#f1a035] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Mi Perfil
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-[#f1a035]"></div>
              </div>
            </button>
          </li>

          {/* Soporte */}
          <li className="hover:bg-[#f8d19d] p-4 block rounded-tl-xl rounded-bl-xl group transition-colors">
            <button
              onClick={() => navigate("/burocrata/soporte")}
              className="group-hover:bg-[#f1a035] p-4 flex justify-center w-full rounded-xl text-white group-hover:text-white relative cursor-pointer"
            >
              <MdContactSupport className="text-2xl" />
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-[#f1a035] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Soporte
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-[#f1a035]"></div>
              </div>
            </button>
          </li>
        </ul>
      </div>

      {/* Logout */}
      <div>
        <ul className="pl-4">
          <li className="hover:bg-[#f8d19d] p-4 block rounded-tl-xl rounded-bl-xl group transition-colors">
            <button
              onClick={handleLogout}
              className="group-hover:bg-[#f1a035] p-4 flex justify-center w-full rounded-xl text-white group-hover:text-white relative cursor-pointer"
            >
              <CiLogout className="text-2xl" />
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Cerrar Sesión
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-red-500"></div>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
