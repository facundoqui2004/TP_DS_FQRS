import React from "react";
import { RiHome6Line } from "react-icons/ri";
import {
  FaWpforms,
  FaRegUserCircle,
  FaUsers,
  FaRegFolder,
} from "react-icons/fa";
import { MdContactSupport } from "react-icons/md";
import { BiWorld } from "react-icons/bi";
import { IoNewspaper } from "react-icons/io5";

export const ROLE_LAYOUT_CONFIG = {
  admin: {
    bgClass: "bg-[#0f172a]",
    transitionClass: "transition-colors duration-300",
    mobileNavBgClass: "bg-[#1e293b]",
    sidebar: {
      bgClass: "bg-[#0f172a]",
      scrollbarColor: "#0891b2 #0f172a",
      logoSrc: "/Images/Admin.png",
      logoAlt: "Logo El Súper Gestor",
      logoTooltip: {
        bgClass: "bg-[#0891b2]",
        titleClass: "text-[#bfdbfe]",
        dotClass: "bg-[#bfdbfe]",
        arrowClass: "border-r-[#0891b2]",
      },
      itemHoverClass: "hover:bg-[#0f4958]",
      buttonClass:
        "cursor-pointer group-hover:bg-[#0891b2] p-4 flex justify-center w-full rounded-xl text-[#06b6d4] group-hover:text-white relative",
      tooltipBgClass: "bg-[#0891b2]",
      tooltipArrowClass: "border-r-[#0891b2]",
      logoutItemHoverClass: "hover:bg-[#075985]",
      logoutButtonClass:
        "cursor-pointer group-hover:bg-[#0ea5e9] p-4 flex justify-center w-full rounded-xl text-[#67e8f9] group-hover:text-white relative",
      logoutTooltipBgClass: "bg-[#0891b2]",
      logoutTooltipArrowClass: "border-r-[#0891b2]",
      items: [
        {
          label: "Inicio",
          path: "/admin",
          icon: <RiHome6Line className="text-2xl" />,
        },
        {
          label: "Gestionar Usuarios",
          path: "/admin/usuarios",
          icon: <FaUsers className="text-2xl" />,
        },
        {
          label: "Gestionar Metahumanos",
          path: "/admin/metahumanos",
          icon: <span className="text-2xl">⚡</span>,
        },
        {
          label: "Gestionar Burócratas",
          path: "/admin/burocratas",
          icon: <span className="text-2xl">🏢</span>,
        },
        {
          label: "Tramites",
          path: "/admin/tramites",
          icon: <FaWpforms className="text-2xl" />,
        },
        {
          label: "Mi Perfil",
          path: "/admin/perfil",
          icon: <FaRegUserCircle className="text-2xl" />,
        },
        {
          label: "Soporte",
          path: "/admin/soporte",
          icon: <MdContactSupport className="text-2xl" />,
        },
      ],
    },
  },

  burocrata: {
    bgClass: "bg-[#c4a783]",
    transitionClass: "transition-colors duration-300",
    mobileNavBgClass: "bg-[#1F1D2B]",
    sidebar: {
      bgClass: "bg-[#f1a035]",
      scrollbarColor: "#f8d19d #f1a035",
      logoSrc: "/Images/burocrataLogo.png",
      logoAlt: "Logo El Súper Gestor",
      itemHoverClass: "hover:bg-[#f8d19d]",
      buttonClass:
        "group-hover:bg-[#f1a035] p-4 flex justify-center w-full rounded-xl text-white group-hover:text-white relative cursor-pointer",
      tooltipBgClass: "bg-[#f1a035]",
      tooltipArrowClass: "border-r-[#f1a035]",
      logoutTooltipBgClass: "bg-red-500",
      logoutTooltipArrowClass: "border-r-red-500",
      items: [
        {
          label: "Inicio",
          path: "/burocrata",
          icon: <RiHome6Line className="text-2xl" />,
        },
        {
          label: "Carpetas",
          path: "/burocrata/carpetas",
          icon: <FaRegFolder className="text-2xl" />,
        },
        {
          label: "Mi Perfil",
          path: "/burocrata/perfil",
          icon: <FaRegUserCircle className="text-2xl" />,
        },
        {
          label: "Vigilar el Mundo",
          path: "/burocrata/vigilar-mundo",
          icon: <BiWorld className="text-2xl" />,
        },
        {
          label: "Noticias",
          path: "/burocrata/noticias",
          icon: <IoNewspaper className="text-2xl" />,
        },
        {
          label: "Soporte",
          path: "/burocrata/soporte",
          icon: <MdContactSupport className="text-2xl" />,
        },
      ],
    },
  },

  metahumano: {
    bgClass: "bg-[#296588]",
    transitionClass: "transition-all duration-500",
    mobileNavBgClass: "bg-[#1F1D2B]",
    sidebar: {
      bgClass: "bg-[#317196]",
      scrollbarColor: "#b8cbd6 #317196",
      logoSrc: "/Images/metahumano.png",
      logoAlt: "Logo El Súper Gestor MetaHumano",
      itemHoverClass: "hover:bg-[#b8cbd6]",
      buttonClass:
        "cursor-pointer group-hover:bg-[#317196] p-4 flex justify-center w-full rounded-xl text-white group-hover:text-white relative",
      tooltipBgClass: "bg-red-500",
      tooltipArrowClass: "border-r-red-500",
      items: [
        {
          label: "Inicio",
          path: "/metahumano",
          icon: <RiHome6Line className="text-2xl" />,
        },
        {
          label: "Tramites",
          path: "/metahumano/tramites",
          icon: <FaWpforms className="text-2xl" />,
        },
        {
          label: "Usuario",
          path: "/metahumano/perfil",
          icon: <FaRegUserCircle className="text-2xl" />,
        },
        {
          label: "Vigilar el Mundo",
          path: "/metahumano/vigilar-mundo",
          icon: <BiWorld className="text-2xl" />,
        },
        {
          label: "Noticias",
          path: "/metahumano/noticias",
          icon: <IoNewspaper className="text-2xl" />,
        },
        {
          label: "Soporte",
          path: "/metahumano/soporte",
          icon: <MdContactSupport className="text-2xl" />,
        },
      ],
    },
  },

  user: {
    bgClass: "bg-[#262837]",
    transitionClass: "transition-colors duration-300",
    mobileNavBgClass: "bg-[#262837]",
    sidebar: {
      bgClass: "bg-[#1F1D2B]",
      scrollbarColor: "#ec7c6a #1F1D2B",
      logoSrc: "/Logo.png",
      logoAlt: "Logo El Súper Gestor",
      itemHoverClass: "hover:bg-[#262837]",
      buttonClass:
        "bg-[#ec7c6a] p-4 flex justify-center w-full rounded-xl text-white relative cursor-pointer",
      tooltipBgClass: "bg-red-500",
      tooltipArrowClass: "border-r-red-500",
      logoutButtonClass:
        "group-hover:bg-[#ec7c6a] p-4 flex justify-center items-center w-full rounded-xl text-[#ec7c6a] group-hover:text-white relative cursor-pointer",
      showLoginWhenUnauthenticated: true,
      items: [
        {
          label: "Inicio",
          path: "/",
          icon: <RiHome6Line className="text-2xl" />,
        },
      ],
    },
  },
};
