import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCarpetaRequest } from "../../api/carpetas";
import { getCarpetasByBurocrataId } from "../../api/burocratas";
import BurocrataLayout from "../../components/layouts/BurocrataLayout";
import { getMe, obtenerMetahumanos } from "../../api/usuarios";
import { FaSearch, FaUserNinja, FaFolder, FaFilter, FaTimes } from "react-icons/fa";

export default function CarpetasList() {
  const [carpetas, setCarpetas] = useState([]);
  const [metahumanos, setMetahumanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetaId, setSelectedMetaId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await getMe();
        const u = data?.data;
        if (u.role !== "BUROCRATA" || !u.perfilId) {
          alert("Debés iniciar sesión como BUROCRATA.");
          return;
        }

        // Cargar carpetas del burócrata y la lista completa de metahumanos en paralelo
        const [carpetasRes, metaRes] = await Promise.allSettled([
          getCarpetasByBurocrataId(u.perfilId),
          obtenerMetahumanos()
        ]);

        if (carpetasRes.status === "fulfilled") {
          setCarpetas(carpetasRes.value.data?.data || []);
        } else {
          console.error("Error cargando carpetas:", carpetasRes.reason);
        }

        if (metaRes.status === "fulfilled") {
          const listaMeta = metaRes.value.data?.data || metaRes.value.data || [];
          setMetahumanos(listaMeta);
        } else {
          console.error("Error cargando metahumanos:", metaRes.reason);
        }

      } catch (e) {
        console.error("No se pudo obtener /usuarios/me", e);
        alert("Iniciá sesión para continuar.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de eliminar esta carpeta?")) {
      await deleteCarpetaRequest(id);
      setCarpetas((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedMetaId("");
  };

  // Filtrado de carpetas por metahumano (nombre, alias, ID) o por ID/descripción de carpeta
  const carpetasFiltradas = carpetas.filter((c) => {
    // 1. Filtrar por selector de Metahumano si está activo
    if (selectedMetaId && c.metahumano?.id?.toString() !== selectedMetaId.toString()) {
      return false;
    }

    // 2. Filtrar por término de búsqueda general
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      const matchCarpetaId = c.id?.toString().includes(term);
      const matchDesc = c.descripcion?.toLowerCase().includes(term);
      const matchTipo = c.tipo?.toLowerCase().includes(term);
      const matchEstado = c.estado?.toLowerCase().includes(term);

      // Búsqueda por datos del metahumano
      const matchMetaNombre = c.metahumano?.nombre?.toLowerCase().includes(term);
      const matchMetaAlias = c.metahumano?.alias?.toLowerCase().includes(term);
      const matchMetaId = c.metahumano?.id?.toString().includes(term);

      return (
        matchCarpetaId ||
        matchDesc ||
        matchTipo ||
        matchEstado ||
        matchMetaNombre ||
        matchMetaAlias ||
        matchMetaId
      );
    }

    return true;
  });

  return (
    <BurocrataLayout>
      <div className="p-6 text-white">
        {/* Encabezado */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-8">
          <div></div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2 justify-center text-white">
            <FaFolder className="text-[#c4a783]" /> Carpetas
          </h1>
          <button
            onClick={() => navigate("/burocrata/carpeta/crear")}
            className="md:justify-self-end bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg hover:shadow-blue-600/40 transition cursor-pointer flex items-center justify-center gap-2"
          >
            + Nueva Carpeta
          </button>
        </div>

        {/* Card contenedora de Filtros y Lista */}
        <div className="bg-[#1e1e1e] max-w-5xl mx-auto p-6 md:p-8 rounded-2xl shadow-2xl border border-[#c4a783]/30">
          
          {/* 🔍 Panel de Búsqueda y Filtro por Metahumano */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Buscador de texto (ID, Metahumano nombre/alias, Descripción) */}
              <div className="relative w-full md:w-2/3">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por ID, metahumano (alias/nombre) o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c4a783]/40 bg-[#2E2E2E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4a783]/60 transition text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {/* Selector desplegable de Metahumano */}
              <div className="relative w-full md:w-1/3">
                <div className="flex items-center gap-2">
                  <FaUserNinja className="text-[#c4a783] shrink-0" />
                  <select
                    value={selectedMetaId}
                    onChange={(e) => setSelectedMetaId(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-[#c4a783]/40 bg-[#2E2E2E] text-white focus:outline-none focus:ring-2 focus:ring-[#c4a783]/60 transition text-sm cursor-pointer"
                  >
                    <option value="">👤 Todos los Metahumanos</option>
                    {metahumanos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.alias ? `${m.alias} (${m.nombre})` : m.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Barra de estado de filtros activos */}
            {(searchTerm || selectedMetaId) && (
              <div className="flex items-center justify-between text-xs text-gray-300 bg-[#2E2E2E]/60 px-4 py-2 rounded-lg border border-[#c4a783]/20">
                <span className="flex items-center gap-2">
                  <FaFilter className="text-[#c4a783]" />
                  Filtro activo: {carpetasFiltradas.length} resultado(s) encontrado(s)
                </span>
                <button
                  onClick={handleClearFilters}
                  className="text-red-400 hover:text-red-300 font-semibold underline cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {/* Estado de Carga */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#c4a783] mx-auto mb-3"></div>
              <p className="text-white/70 text-sm">Cargando carpetas...</p>
            </div>
          ) : carpetasFiltradas.length === 0 ? (
            <div className="text-center py-12 bg-[#252525] rounded-xl border border-dashed border-[#c4a783]/30 p-6">
              <FaFolder className="text-5xl text-gray-500 mx-auto mb-3 opacity-40" />
              <p className="text-white/80 font-medium text-lg">
                No se encontraron carpetas
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm || selectedMetaId
                  ? "Prueba cambiando los criterios de búsqueda o seleccionando otro metahumano."
                  : "No hay carpetas registradas en tu perfil."}
              </p>
              {(searchTerm || selectedMetaId) && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-[#2E2E2E] hover:bg-[#383838] border border-[#c4a783]/40 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Restablecer búsqueda
                </button>
              )}
            </div>
          ) : (
            /* Lista de Carpetas */
            <ul className="space-y-4">
              {carpetasFiltradas.map((c) => {
                const metahumanoNombre = c.metahumano
                  ? c.metahumano.alias
                    ? `${c.metahumano.alias} (${c.metahumano.nombre})`
                    : c.metahumano.nombre
                  : "Sin asignar";

                return (
                  <li
                    key={c.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#2E2E2E] p-5 rounded-xl shadow-md hover:shadow-lg transition border border-[#c4a783]/20 gap-4"
                  >
                    <div className="space-y-1.5 max-w-full sm:max-w-[70%]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#c4a783]/20 text-[#c4a783] text-xs font-bold px-2.5 py-0.5 rounded-md border border-[#c4a783]/40">
                          Carpeta #{c.id}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase ${
                            c.estado?.toUpperCase() === "ACTIVA"
                              ? "bg-green-900/60 text-green-300 border border-green-700/50"
                              : c.estado?.toUpperCase() === "APROBADA"
                              ? "bg-blue-900/60 text-blue-300 border border-blue-700/50"
                              : c.estado?.toUpperCase() === "CERRADA"
                              ? "bg-gray-800 text-gray-400 border border-gray-700"
                              : "bg-amber-900/60 text-amber-300 border border-amber-700/50"
                          }`}
                        >
                          {c.estado}
                        </span>
                        {c.tipo && (
                          <span className="text-xs text-gray-400 bg-black/40 px-2 py-0.5 rounded">
                            {c.tipo}
                          </span>
                        )}
                      </div>

                      {/* Metahumano asociado */}
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-300">
                        <FaUserNinja className="text-xs shrink-0" />
                        <span>Metahumano: {metahumanoNombre}</span>
                      </div>

                      {/* Descripción */}
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {c.descripcion || "Sin descripción"}
                      </p>
                    </div>

                    <div className="flex gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => navigate(`/burocrata/carpeta/${c.id}`)}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold shadow hover:shadow-green-600/30 transition cursor-pointer"
                      >
                        Ver Detalle
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold shadow hover:shadow-red-600/30 transition cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </BurocrataLayout>
  );
}

