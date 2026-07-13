import { useState } from "react";
import SidebarBurocrata from "../shared/SidebarBurocrata";
import Footer from "../footer";
import { CgMenuRound } from "react-icons/cg";
import { FaRegUserCircle } from "react-icons/fa";
import { RiCloseFill } from "react-icons/ri";

export default function BurocrataLayout({ children }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    if (showUser) setShowUser(false);
  };

  const toggleUser = () => setShowUser(!showUser);
  const closeUser = () => setShowUser(false);

  return (
    <div className="bg-[#c4a783] w-full min-h-screen transition-colors duration-300 flex flex-col">
      {/* Sidebar */}
      <SidebarBurocrata showMenu={showMenu} toggleUser={toggleUser} />

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
        className={`flex-1 pt-20 lg:pt-6 pb-10 transition-all duration-300 ease-in-out
        ${showMenu ? "pl-4" : "pl-0"} lg:ml-28`}
      >
        {children}
      </main>

      {/* FOOTER */}
      <footer
        className={`mt-auto ${showMenu ? "pl-4" : "pl-0"} transition-all duration-300 ease-in-out lg:ml-28`}
      >
        <Footer />
      </footer>
    </div>
  );
}
