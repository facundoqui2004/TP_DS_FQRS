import React, { useState } from "react";
import Sidebar from "../shared/Sidebar";
import Footer from "../footer";
import { CgMenuRound } from "react-icons/cg";
import { RiCloseFill } from "react-icons/ri";
import { ROLE_LAYOUT_CONFIG } from "./roleLayoutConfig";

export default function RoleLayout({
  role = "user",
  children,
  hideFooter = false,
  fullScreen = false,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const config = ROLE_LAYOUT_CONFIG[role] || ROLE_LAYOUT_CONFIG.user;

  const toggleMenu = () => setShowMenu((prev) => !prev);

  return (
    <div
      className={`${config.bgClass} w-full ${
        fullScreen ? "h-screen overflow-hidden" : "min-h-screen"
      } ${config.transitionClass} flex flex-col`}
    >
      {/* Sidebar */}
      <Sidebar showMenu={showMenu} config={config.sidebar} />

      {/* Backdrop overlay */}
      {showMenu && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* MENU MOBILE */}
      <nav
        className={`${config.mobileNavBgClass} lg:hidden fixed top-0 left-0 w-full flex justify-between items-center p-4 z-20`}
      >
        <button
          onClick={toggleMenu}
          aria-label={showMenu ? "Cerrar menú" : "Abrir menú"}
          className="text-white text-3xl"
        >
          {showMenu ? <RiCloseFill /> : <CgMenuRound />}
        </button>
      </nav>

      {/* CONTENIDO */}
      <main
        className={`flex-1 ${
          fullScreen ? "h-screen pb-4 lg:pb-6 flex flex-col" : "pb-10"
        } pt-20 lg:pt-6 transition-all duration-300 ease-in-out ${
          showMenu ? "pl-4" : "pl-0"
        } lg:ml-28`}
      >
        {children}
      </main>

      {/* FOOTER */}
      {!hideFooter && (
        <footer
          className={`mt-auto ${
            showMenu ? "pl-4" : "pl-0"
          } transition-all duration-300 ease-in-out lg:ml-28`}
        >
          <Footer />
        </footer>
      )}
    </div>
  );
}
