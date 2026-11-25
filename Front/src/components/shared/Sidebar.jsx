import React from "react";
import { CiLogout, CiLogin } from "react-icons/ci";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DEFAULT_LOGO_TOOLTIP = {
  bgClass: "bg-red-500",
  titleClass: "text-yellow-300",
  dotClass: "bg-yellow-300",
  arrowClass: "border-r-red-500",
};

const Sidebar = ({ showMenu, config }) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const {
    bgClass,
    scrollbarColor,
    logoSrc,
    logoAlt = "Logo El Súper Gestor",
    logoTooltip = DEFAULT_LOGO_TOOLTIP,
    itemHoverClass,
    buttonClass,
    tooltipBgClass,
    tooltipArrowClass,
    logoutItemHoverClass = itemHoverClass,
    logoutButtonClass = buttonClass,
    logoutTooltipBgClass = tooltipBgClass,
    logoutTooltipArrowClass = tooltipArrowClass,
    showLoginWhenUnauthenticated = false,
    items = [],
  } = config;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error durante logout:", error);
      navigate("/");
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const showLoginAction = showLoginWhenUnauthenticated && !isAuthenticated;

  return (
    <div
      className={`${bgClass} fixed lg:left-0 top-0 w-28 h-screen max-h-screen flex flex-col justify-between rounded-tr-xl rounded-br-xl z-50 transition-all duration-300 ease-in-out shadow-lg overflow-x-hidden ${
        showMenu ? "left-0" : "-left-full"
      }`}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor,
      }}
    >
      {/* Logo */}
      <div className="text-center relative group flex-shrink-0 py-2 w-full overflow-hidden">
        <img
          src={logoSrc}
          alt={logoAlt}
          className="mx-auto w-20 h-auto cursor-pointer max-w-full"
        />
        {/* Tooltip logo */}
        <div className="tooltip-desktop absolute left-full ml-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <div
            className={`relative ${logoTooltip.bgClass} text-white px-4 py-3 rounded-lg text-sm font-bold border-4 border-black shadow-lg transform rotate-1 whitespace-nowrap`}
          >
            <div className="relative z-10">
              <div
                className={`${logoTooltip.titleClass} text-lg font-black tracking-wide drop-shadow-lg`}
              >
                EL SUPER GESTOR!
              </div>
            </div>
            <div className="absolute inset-0 opacity-20">
              <div
                className={`w-2 h-2 ${logoTooltip.dotClass} rounded-full absolute top-2 left-2`}
              ></div>
              <div
                className={`w-1 h-1 ${logoTooltip.dotClass} rounded-full absolute top-4 left-6`}
              ></div>
              <div
                className={`w-1.5 h-1.5 ${logoTooltip.dotClass} rounded-full absolute bottom-3 right-3`}
              ></div>
              <div
                className={`w-1 h-1 ${logoTooltip.dotClass} rounded-full absolute bottom-2 right-6`}
              ></div>
            </div>
            <div className="absolute right-full top-1/2 transform -translate-y-1/2">
              <div
                className={`border-8 border-transparent ${logoTooltip.arrowClass}`}
              ></div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 border-4 border-transparent border-r-black"></div>
            </div>
            <div className="absolute inset-0 bg-black rounded-lg transform translate-x-1 translate-y-1 -z-10"></div>
          </div>
        </div>
      </div>

      {/* Lista de enlaces */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin overflow-x-hidden w-full">
        <ul className="pl-4 space-y-1 w-full overflow-x-hidden">
          {items.map((item) => (
            <li
              key={item.path}
              className={`${itemHoverClass} p-1.5 block rounded-tl-xl rounded-bl-xl group transition-colors`}
            >
              <button
                onClick={() => navigate(item.path)}
                className={buttonClass}
              >
                {item.icon}
                <div
                  className={`tooltip-desktop absolute left-full ml-2 top-1/2 transform -translate-y-1/2 ${tooltipBgClass} text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10`}
                >
                  {item.label}
                  <div
                    className={`absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent ${tooltipArrowClass}`}
                  ></div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout / Login */}
      <div className="flex-shrink-0 pb-2">
        <ul className="pl-4">
          <li
            className={`${logoutItemHoverClass} p-1.5 block rounded-tl-xl rounded-bl-xl group transition-colors`}
          >
            <button
              onClick={showLoginAction ? handleLoginClick : handleLogout}
              className={logoutButtonClass}
            >
              {showLoginAction ? (
                <CiLogin className="text-2xl" />
              ) : (
                <CiLogout className="text-2xl" />
              )}
              <div
                className={`tooltip-desktop absolute left-full ml-2 top-1/2 transform -translate-y-1/2 ${logoutTooltipBgClass} text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10`}
              >
                {showLoginAction ? "Iniciar Sesión" : "Cerrar Sesión"}
                <div
                  className={`absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent ${logoutTooltipArrowClass}`}
                ></div>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
