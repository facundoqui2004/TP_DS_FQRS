import { useState, useEffect } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { MdEmail, MdPhone, MdWork, MdPerson, MdHome } from "react-icons/md";
import BurocrataLayout from "../../components/layouts/BurocrataLayout";
import { getMe } from "../../api/usuarios";
import { getBurocrataByIdRequest } from "../../api/burocratas";

export default function MiPerfilBuro() {
  const [burocrata, setBurocrata] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuarioActual = async () => {
      try {
        const { data } = await getMe();
        const id = data.data.perfilId;
        const dataBurocrata = await getBurocrataByIdRequest(id);
        setBurocrata(dataBurocrata.data.data);
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
      <BurocrataLayout>
        <div className="text-center text-white/80 mt-20 animate-pulse">
          Cargando perfil...
        </div>
      </BurocrataLayout>
    );
  }

  if (!burocrata) {
    return (
      <BurocrataLayout>
        <div className="text-center text-red-400 mt-20">
          No se pudo cargar la información del burócrata.
        </div>
      </BurocrataLayout>
    );
  }

  const { nombre, alias, origen, usuario } = burocrata;

  return (
    <BurocrataLayout>
      {/* Encabezado */}
      <section className="text-center text-white mt-8 mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          👤 Mi Perfil
        </h1>
        <p className="opacity-90 text-base">
          Información personal del usuario burócrata.
        </p>
      </section>

      {/*  Tarjeta de perfil */}
      <div className="max-w-2xl mx-auto bg-[#1e293b]/80 backdrop-blur-md rounded-2xl p-8 text-white shadow-xl border border-white/10">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <FaRegUserCircle className="text-7xl text-amber-400 mb-3" />
          <h2 className="text-2xl font-bold">{nombre}</h2>
          <p className="text-white/70 text-sm italic">
            "{alias || 'Sin alias'}"
          </p>
        </div>

        {/* Datos */}
        <div className="space-y-5">
          {/* Nombre */}
          <div className="flex items-center gap-2">
            <MdPerson className="text-xl text-amber-300 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Nombre completo
              </label>
              <p className="bg-white/10 p-3 rounded-lg mb-6">{nombre}</p>
            </div>
          </div>

          {/* Origen */}
          <div className="flex items-center gap-2">
            <MdHome className="text-xl text-amber-300 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Lugar de origen
              </label>
              <p className="bg-white/10 p-3 rounded-lg mb-6">{origen}</p>
            </div>
          </div>

          {/* Correo */}
          <div className="flex items-center gap-2">
            <MdEmail className="text-xl text-amber-300 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Correo electrónico
              </label>
              <p className="bg-white/10 p-3 rounded-lg mb-6">
                {usuario?.email || "Sin correo registrado"}
              </p>
            </div>
          </div>

          {/* Teléfono */}
          <div className="flex items-center gap-2">
            <MdPhone className="text-xl text-amber-300 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Teléfono
              </label>
              <p className="bg-white/10 p-3 rounded-lg mb-6">
                {usuario?.telefono || "No especificado"}
              </p>
            </div>
          </div>

          {/* Rol */}
          <div className="flex items-center gap-2">
               <MdWork className="text-xl text-amber-300 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Rol asignado
              </label>
              <p className="bg-white/10 p-3 rounded-lg uppercase tracking-wide flex mb-6">
                {usuario?.role || "BURÓCRATA"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fecha de actualización */}
      <p className="text-center text-white/60 mt-10">
        Última actualización:{" "}
        {new Date(usuario?.updatedAt || Date.now()).toLocaleDateString()}
      </p>
    </BurocrataLayout>
  );
}
