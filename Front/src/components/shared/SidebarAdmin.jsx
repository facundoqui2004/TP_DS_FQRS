import React from "react";
import { RiHome6Line } from "react-icons/ri";
import { FaWpforms, FaWindowClose, FaRegUserCircle, FaUsers } from "react-icons/fa";
import { MdContactSupport } from "react-icons/md";
import { CiLogout, CiLogin } from "react-icons/ci";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";


const Sidebar = (props) => {
    const { showMenu, toggleUser } = props;
    const { logout } = useAuth();
    const navigate = useNavigate();

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
    <div className={`bg-[#0f172a] fixed lg:left-0 top-0 w-28 h-full flex flex-col justify-between rounded-tr-xl rounded-br-xl z-50 transition-all duration-300 ease-in-out shadow-lg overflow-x-hidden
    ${showMenu ? 'left-0' : '-left-full'}`}
    style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#0891b2 #0f172a'
    }}>
      <div className="text-center relative group flex-shrink-0 py-2 w-full overflow-hidden">
            <img
                src="/Images/Admin.png"
                alt="Logo El Súper Gestor"
                className="mx-auto w-20 h-auto cursor-pointer max-w-full"
            />
            {/* Tooltip logo */}
            <div className="tooltip-desktop absolute left-full ml-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="relative bg-[#0891b2] text-white px-4 py-3 rounded-lg text-sm font-bold border-4 border-black shadow-lg transform rotate-1 whitespace-nowrap">
                <div className="relative z-10">
                    <div className="text-[#bfdbfe] text-lg font-black tracking-wide drop-shadow-lg">
                    EL SUPER GESTOR!
                    </div>
                </div>
                <div className="absolute inset-0 opacity-20">
                    <div className="w-2 h-2 bg-[#bfdbfe] rounded-full absolute top-2 left-2"></div>
                    <div className="w-1 h-1 bg-[#bfdbfe] rounded-full absolute top-4 left-6"></div>
                    <div className="w-1.5 h-1.5 bg-[#bfdbfe] rounded-full absolute bottom-3 right-3"></div>
                    <div className="w-1 h-1 bg-[#bfdbfe] rounded-full absolute bottom-2 right-6"></div>
                </div>
                <div className="absolute right-full top-1/2 transform -translate-y-1/2">
                    <div className="border-8 border-transparent border-r-[#0891b2]"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 border-4 border-transparent border-r-black"></div>
                </div>
                <div className="absolute inset-0 bg-black rounded-lg transform translate-x-1 translate-y-1 -z-10"></div>
                </div>
            </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin overflow-x-hidden w-full">
        <ul className="pl-4 space-y-1 w-full overflow-x-hidden">
            <li className="hover:bg-[#0f4958] p-1.5 block rounded-tl-xl rounded-bl-xl group transition-colors">
            <button 
                onClick={() => navigate('/admin')}
                className="cursor-pointer group-hover:bg-[#0891b2] p-4 flex justify-center w-full rounded-xl text-[#06b6d4] group-hover:text-white relative"
            >
                <RiHome6Line className="text-2xl" />
                {/* Tooltip */}
                <div className="tooltip-desktop absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-[#0891b2] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Inicio
                {/* Flecha del tooltip */}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-[#0891b2]"></div>
                </div>
            </button>
            </li>

            <li className="hover:bg-[#0f4958] p-1.5 block rounded-tl-xl rounded-bl-xl group transition-colors">
                <button
                    onClick={() => navigate('/admin/usuarios')}
                    className="cursor-pointer group-hover:bg-[#0891b2] p-4 flex justify-center w-full rounded-xl text-[#06b6d4] group-hover:text-white relative"
                >
                    <FaUsers className="text-2xl" />
                    {/* Tooltip */}
                    <div className="tooltip-desktop absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-[#0891b2] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Gestionar Usuarios
                    {/* Flecha del tooltip */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-[#0891b2]"></div>
                    </div>
                </button>
            </li>

            <li className="hover:bg-[#0f4958] p-1.5 block rounded-tl-xl rounded-bl-xl group transition-colors">
                <button
                    onClick={() => navigate('/admin/metahumanos')}
                    className="cursor-pointer group-hover:bg-[#0891b2] p-4 flex justify-center w-full rounded-xl text-[#06b6d4] group-hover:text-white relative"
                >
                    <span className="text-2xl">⚡</span>
                    {/* Tooltip */}
                    <div className="tooltip-desktop absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-[#0891b2] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Gestionar Metahumanos
                    {/* Flecha del tooltip */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-[#0891b2]"></div>
                    </div>
                </button>
            </li>

            <li className="hover:bg-[#0f4958] p-1.5 block rounded-tl-xl rounded-bl-xl group transition-colors">
                <button
                    onClick={() => navigate('/admin/burocratas')}
                    className="cursor-pointer group-hover:bg-[#0891b2] p-4 flex justify-center w-full rounded-xl text-[#06b6d4] group-hover:text-white relative"
                >
                    <span className="text-2xl">🏢</span>
                    {/* Tooltip */}
                    <div className="tooltip-desktop absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-[#0891b2] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Gestionar Burócratas
                    {/* Flecha del tooltip */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-[#0891b2]"></div>
                    </div>
                </button>
            </li>

            <li className="hover:bg-[#0f4958] p-1.5 block rounded-tl-xl rounded-bl-xl group transition-colors">
                <button
                    onClick={() => navigate('/admin/tramites')}
                    className="cursor-pointer group-hover:bg-[#0891b2] p-4 flex justify-center w-full rounded-xl text-[#06b6d4] group-hover:text-white relative"
                >
                    <FaWpforms className="text-2xl" />
                    {/* Tooltip */}
                    <div className="tooltip-desktop absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-[#0891b2] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Tramites
                    {/* Flecha del tooltip */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-[#0891b2]"></div>
                    </div>
                </button>
            </li>


            <li className="hover:bg-[#0f4958] p-1.5 block rounded-tl-xl rounded-bl-xl group transition-colors">
                <button
                    onClick={() => navigate('/admin/perfil')}
                    className="cursor-pointer group-hover:bg-[#0891b2] p-4 flex justify-center w-full rounded-xl text-[#06b6d4] group-hover:text-white relative"
                >
                    <FaRegUserCircle className="text-2xl" />
                    {/* Tooltip */}
                    <div className="tooltip-desktop absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-[#0891b2] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Mi Perfil
                    {/* Flecha del tooltip */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-[#0891b2]"></div>
                    </div>
                </button>
            </li>

            <li className="hover:bg-[#0f4958] p-1.5 block rounded-tl-xl rounded-bl-xl group transition-colors">
                <button
                    onClick={() => navigate('/admin/soporte')}
                    className="cursor-pointer group-hover:bg-[#0891b2] p-4 flex justify-center w-full rounded-xl text-[#06b6d4] group-hover:text-white relative"
                >
                    <MdContactSupport className="text-2xl" />
                    {/* Tooltip */}
                    <div className="tooltip-desktop absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-[#0891b2] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Soporte
                    {/* Flecha del tooltip */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-[#0891b2]"></div>
                    </div>
                </button>
            </li>    
        </ul>
      </div>
      
      {/* Logout */}
      <div className="flex-shrink-0 pb-2">
        <ul className="pl-4">
            <li className="hover:bg-[#075985] p-1.5 block rounded-tl-xl rounded-bl-xl group transition-colors">
                <button
                    onClick={handleLogout}
                     className="cursor-pointer group-hover:bg-[#0ea5e9] p-4 flex justify-center w-full rounded-xl text-[#67e8f9] group-hover:text-white relative"
                >
                    <CiLogout className="text-2xl" />
                    {/* Tooltip */}
                    <div className="tooltip-desktop absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-[#0891b2] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        Cerrar Sesión
                        {/* Flecha del tooltip */}
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-[#0891b2]"></div>
                    </div>
                </button>
            </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;