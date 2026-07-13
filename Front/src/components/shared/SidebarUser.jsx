import React from "react";
import { RiHome6Line } from "react-icons/ri";
import { FaWpforms, FaWindowClose, FaRegUserCircle } from "react-icons/fa";
import { MdContactSupport } from "react-icons/md";
import { CiLogout, CiLogin } from "react-icons/ci";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";


const Sidebar = (props) => {
    const { showMenu, toggleUser } = props;
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Error durante logout:', error);
            navigate('/');
        }
    };

  return (
    <div className={` bg-[#1F1D2B] fixed lg:left-0 top-0 w-28 h-full flex flex-col justify-between py-6 rounded-tr-xl rounded-br-xl z-50 transition-all duration-300 ease-in-out shadow-lg
    ${showMenu ? 'left-0' : '-left-full'}`}>
      <div className="text-center my-4 relative group">
            <img
                src="/public/Logo.png"
                alt="Logo El Súper Gestor"
                className="mx-auto w-25 h-auto cursor-pointer" 
            />
            {/* Tooltip logo */}
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
            <li className="bg-[#262837] p-4 block rounded-tl-xl rounded-bl-xl">
            <button
                onClick={() => navigate("/")}
                className="bg-[#ec7c6a] p-4 flex justify-center block rounded-xl text-white relative group"
            >
                <RiHome6Line className="text-2xl" />
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Inicio
                {/* Flecha del tooltip */}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-red-500"></div>
                </div>
            </button>
            </li>
                        
        </ul>
      </div>
      <div>
        <ul className="pl-4">
            <li className="hover:bg-[#262837] p-4 block rounded-tl-xl rounded-bl-xl group transition-colors">
                <div className="relative">
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="group-hover:bg-[#ec7c6a] p-4 flex justify-center items-center w-full rounded-xl text-[#ec7c6a] group-hover:text-white"
                        >
                            <CiLogout className="text-2xl" />
                        </button>
                    ) : (
                        <button
                            onClick={handleLoginClick}
                            className="group-hover:bg-[#ec7c6a] p-4 flex justify-center items-center w-full rounded-xl text-[#ec7c6a] group-hover:text-white"
                        >
                            <CiLogin className="text-2xl" />
                        </button>
                    )}

                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        {isAuthenticated ? 'Cerrar Sesión' : 'Login'}
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-red-500"></div>
                    </div>
                </div>
            </li>
        </ul>
      </div>
      
    </div>
  );
};

export default Sidebar;