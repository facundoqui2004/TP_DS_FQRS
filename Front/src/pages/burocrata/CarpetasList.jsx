import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCarpetaRequest } from "../../api/carpetas";
import { getCarpetasByBurocrataId } from "../../api/burocratas";
import BurocrataLayout from "../../components/layouts/BurocrataLayout";
import { getMe } from "../../api/usuarios";
import { FaSearch } from "react-icons/fa"; // 👈 Importamos el ícono de lupa

export default function CarpetasList() {
  const [carpetas, setCarpetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
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
        const carpetasBuro = await getCarpetasByBurocrataId(u.perfilId);
        setCarpetas(carpetasBuro.data.data);
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

  const carpetasFiltradas = carpetas.filter((c) =>
    c.id.toString().includes(searchId.trim())
  );

  return (
    <BurocrataLayout>
      <div className="p-6 text-white">
        {/* Encabezado */}
        <div className="grid grid-cols-3 items-center mb-8">
          <h1 className="text-3xl font-extrabold flex items-center gap-2 justify-center col-span-1 col-start-2 text-white">
            📂 Carpetas
          </h1>
          <button
            onClick={() => navigate("/burocrata/carpeta/crear")}
            className="justify-self-end bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-blue-600/40 transition"
          >
            + Nueva Carpeta
          </button>
        </div>

        {/* Card contenedora */}
        <div className="bg-[#1e1e1e] max-w-4xl mx-auto p-8 rounded-2xl shadow-2xl border border-[#c4a783]/30">
          {/* 🔍 Buscador con ícono */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-full sm:w-1/2">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                placeholder="Buscar carpeta por ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#c4a783]/40 bg-[#2E2E2E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c4a783]/60 transition"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-white/70 text-center">Cargando...</p>
          ) : carpetasFiltradas.length === 0 ? (
            <p className="text-white/70 text-center">
              {searchId
                ? `No se encontró ninguna carpeta con ID ${searchId}.`
                : "No hay carpetas registradas."}
            </p>
          ) : (
            <ul className="space-y-4">
              {carpetasFiltradas.map((c) => (
                <li
                  key={c.id}
                  className="flex justify-between items-center bg-[#2E2E2E] p-4 rounded-xl shadow-md hover:shadow-lg transition border border-[#c4a783]/20"
                >
                  <span className="truncate max-w-[65%] font-medium">
                    {`Descripcion : ${c.descripcion}`} |{" "}
                    {`Estado : ${c.estado}`} | {`Carpeta Nro : ${c.id}`}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/burocrata/carpeta/${c.id}`)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg text-sm font-semibold shadow hover:shadow-green-600/30 transition"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-lg text-sm font-semibold shadow hover:shadow-red-600/30 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </BurocrataLayout>
  );
}
