import { useState, useEffect } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { MdEmail, MdPhone, MdWork, MdPerson, MdAdminPanelSettings } from "react-icons/md";
import AdminLayout from "../../components/layouts/AdminLayout";
import { getMe } from "../../api/usuarios";

export default function MiPerfil() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuarioActual = async () => {
      try {
        const { data } = await getMe();
        setAdmin(data.data);
      } catch (error) {
        console.error("Error al obtener el perfil", error);
      } finally {
        setLoading(false);
      }
    };

    usuarioActual();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Mi Perfil">
        <div className="text-center text-white/80 mt-20 animate-pulse">
          Cargando perfil...
        </div>
      </AdminLayout>
    );
  }

  if (!admin) {
    return (
      <AdminLayout title="Mi Perfil">
        <div className="text-center text-red-400 mt-20">
          No se pudo cargar la información del administrador.
        </div>
      </AdminLayout>
    );
  }

  const { nomUsuario, email, telefono, role, updatedAt } = admin;

  return (
    <AdminLayout title="Mi Perfil">
      {/* 🏛️ Encabezado */}
      <section className="text-center text-white mt-8 mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          👤 Mi Perfil
        </h1>
        <p className="opacity-90 text-base">
          Información personal del administrador del sistema.
        </p>
      </section>

      {/* 🧾 Tarjeta de perfil */}
      <div className="max-w-2xl mx-auto bg-[#1e293b]/80 backdrop-blur-md rounded-2xl p-8 text-white shadow-xl border border-slate-600">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-[#0891b2] rounded-full flex items-center justify-center mb-4">
            <FaRegUserCircle className="text-6xl text-white" />
          </div>
          <h2 className="text-2xl font-bold">{nomUsuario}</h2>
          <div className="flex items-center gap-2 mt-2">
            <MdAdminPanelSettings className="text-xl text-[#0891b2]" />
            <p className="text-[#0891b2] text-sm font-semibold uppercase tracking-wide">
              Administrador del Sistema
            </p>
          </div>
        </div>

        {/* Datos */}
        <div className="space-y-5">


          {/* Correo */}
          <div className="flex items-center gap-2">
            <MdEmail className="text-xl text-[#0891b2] flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Correo electrónico
              </label>
              <p className="bg-white/10 p-3 rounded-lg">
                {email || "Sin correo registrado"}
              </p>
            </div>
          </div>

          {/* Teléfono */}
          <div className="flex items-center gap-2">
            <MdPhone className="text-xl text-[#0891b2] flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Teléfono
              </label>
              <p className="bg-white/10 p-3 rounded-lg">
                {telefono || "No especificado"}
              </p>
            </div>
          </div>

          {/* Rol */}
          <div className="flex items-center gap-2">
            <MdWork className="text-xl text-[#0891b2] flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Rol asignado
              </label>
              <p className="bg-white/10 p-3 rounded-lg uppercase tracking-wide flex items-center gap-2">
                <span className="text-[#0891b2]">👑</span>
                {role || "ADMIN"}
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 p-4 bg-[#0891b2]/10 rounded-lg border border-[#0891b2]/30">
          <p className="text-sm text-white/70">
            <strong className="text-[#0891b2]">ℹ️ Nota:</strong> Como administrador, tienes acceso completo a todas las funcionalidades del sistema, incluyendo la gestión de usuarios, metahumanos, burócratas y trámites administrativos.
          </p>
        </div>
      </div>

      {/* Fecha de actualización */}
      <p className="text-center text-white/60 mt-10">
        Última actualización:{" "}
        {new Date(updatedAt || Date.now()).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}
      </p>
    </AdminLayout>
  );
}
