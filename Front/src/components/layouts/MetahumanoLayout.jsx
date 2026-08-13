import { useState } from "react";
import SidebarMetahum from "../shared/SidebarMetaHum";
import Footer from "../footer";
import { CgMenuRound } from "react-icons/cg";
import { FaRegUserCircle } from "react-icons/fa";
import { RiCloseFill } from "react-icons/ri";
import { useAuth } from "../../context/AuthContext";

export default function MetahumanoLayout({ children, theme, hideFooter = false, fullScreen = false }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const { user } = useAuth();

  let bgClass = "bg-[#296588]"; // default background for all metahumanos

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    if (showUser) setShowUser(false);
  };

  const toggleUser = () => setShowUser(!showUser);
  const closeUser = () => setShowUser(false);

  return (
    <div className={`${bgClass} w-full ${fullScreen ? "h-screen overflow-hidden" : "min-h-screen"} transition-all duration-500 flex flex-col`}>
      {/* Sidebar */}
      <SidebarMetahum showMenu={showMenu} toggleUser={toggleUser} />

      {/* MENU MOBILE */}
      <nav className="bg-[#1F1D2B] lg:hidden fixed top-0 left-0 w-full flex justify-between items-center p-4 z-20">
        <button onClick={toggleMenu} className="text-white text-3xl">
          {showMenu ? <RiCloseFill /> : <CgMenuRound />}
        </button>
        <button onClick={toggleUser} className="text-white text-2xl">
          <FaRegUserCircle />
        </button>
      </nav>

      {/* CONTENIDO */}
      <main
        className={`flex-1 ${fullScreen ? "h-screen pb-4 lg:pb-6" : "pb-10"} pt-20 lg:pt-6 transition-all duration-300 ease-in-out
        ${showMenu ? "pl-4" : "pl-0"} lg:ml-28 ${fullScreen ? "flex flex-col" : ""}`}
      >
        {children}
      </main>

      {/* FOOTER */}
      {!hideFooter && (
        <footer
          className={`mt-auto ${showMenu ? "pl-4" : "pl-0"} transition-all duration-300 ease-in-out lg:ml-28`}
        >
          <Footer />
        </footer>
      )}
    </div>
  );
}
