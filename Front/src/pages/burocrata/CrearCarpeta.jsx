import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCarpetaRequest } from "../../api/carpetas";
import { getMe, obtenerMetahumanos } from "../../api/usuarios";
import BurocrataLayout from "../../components/layouts/BurocrataLayout";

export default function CrearCarpeta() {
  const [titulo, setTitulo] = useState("");
  const [estado, setEstado] = useState("activa");
  const [tipo, setTipo] = useState("general");
  const [metahumanoId, setMetahumanoId] = useState("");
  const [metahumanoNombre, setMetahumanoNombre] = useState("");
  const [burocrataId, setBurocrataId] = useState("");
  const [metahumanos, setMetahumanos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const navigate = useNavigate();

  // Obtener usuario BUROCRATA
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMe();
        const u = data?.data;
        if (u.role !== "BUROCRATA" || !u.perfilId) {
          alert("Debés iniciar sesión como BUROCRATA.");
          return;
        }
        setBurocrataId(u.perfilId);
      } catch (e) {
        console.error("No se pudo obtener /usuarios/me", e);
        alert("Iniciá sesión para continuar.");
      }
    })();
  }, []);

  // Obtener lista de metahumanos
  useEffect(() => {
    (async () => {
      try {
        const { data } = await obtenerMetahumanos();
        const lista = data?.data || data;
        setMetahumanos(lista);
      } catch (error) {
        console.error("Error al obtener metahumanos:", error);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  // Filtrado dinámico
  const metahumanosFiltrados = metahumanos.filter((m) =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Crear carpeta
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCarpetaRequest({
        descripcion: titulo,
        estado: estado,
        tipo: tipo,
        metahumanoId: Number(metahumanoId),
        burocrataId: Number(burocrataId),
      });
      alert("Carpeta creada con éxito");
      navigate("/burocrata/carpetas");
    } catch (err) {
      console.error("Error al crear carpeta:", err);
      alert("Ocurrió un error al crear la carpeta.");
    }
  };

  return (
    <BurocrataLayout>
      <div className="flex justify-center items-center p-6 min-h-[calc(100vh-100px)]">
        <div className="bg-[#2E2E2E]/90 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg p-8 text-white relative">
          <h1 className="text-3xl font-extrabold mb-6 text-center flex items-center justify-center gap-2">
            ➕ Nueva Carpeta
          </h1>

          <form onSubmit={handleCreate} className="space-y-5">
            {/* Descripción */}
            <div>
              <label className="block mb-1 font-semibold">Descripción</label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#1F1F1F] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                placeholder="Ingrese la descripción"
                required
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block mb-1 font-semibold">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                disabled={tipo === "CAPTURA_VILLANO"}
                className="w-full p-3 rounded-lg bg-[#1F1F1F] text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition disabled:opacity-60"
              >
                <option value="activa">Activa</option>
                <option value="pendiente">Pendiente</option>
                <option value="cerrada">Cerrada</option>
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block mb-1 font-semibold">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => {
                  const val = e.target.value;
                  setTipo(val);
                  if (val === "CAPTURA_VILLANO") {
                    setEstado("pendiente");
                  }
                }}
                className="w-full p-3 rounded-lg bg-[#1F1F1F] text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              >
                <option value="general">General</option>
                <option value="penal">Penal</option>
                <option value="civil">Civil</option>
                <option value="CAPTURA_VILLANO">Captura de Villano</option>
              </select>
            </div>

            {/* Busqueda de metahumanos */}
            <div className="relative">
              <label className="block mb-1 font-semibold">Metahumano</label>

              <input
                type="text"
                placeholder={
                  cargando
                    ? "Cargando metahumanos..."
                    : "Buscar o seleccionar un metahumano..."
                }
                value={busqueda || metahumanoNombre}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setMetahumanoId("");
                  setMetahumanoNombre("");
                  setMostrarOpciones(true);
                }}
                onFocus={() => setMostrarOpciones(true)}
                className="w-full p-3 rounded-lg bg-[#1F1F1F] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />

              {/* Lista */}
              {mostrarOpciones && !cargando && (
                <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-[#1F1F1F] border border-gray-700 rounded-lg shadow-lg">
                  {metahumanosFiltrados.length > 0 ? (
                    metahumanosFiltrados.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setMetahumanoId(m.id);
                          setMetahumanoNombre(m.nombre);
                          setBusqueda("");
                          setMostrarOpciones(false);
                        }}
                        className="px-3 py-2 hover:bg-blue-600 cursor-pointer transition"
                      >
                        {m.nombre} <span className="text-gray-400">(ID: {m.id})</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-400">
                      No se encontraron resultados
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botón */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-blue-600/40 transition"
              >
                Crear
              </button>
            </div>
          </form>
        </div>
      </div>
    </BurocrataLayout>
  );
}
