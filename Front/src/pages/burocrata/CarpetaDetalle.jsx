import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCarpetaByIdRequest, patchCarpetaEstadoRequest } from "../../api/carpetas";
import { createEvidenciaRequest, deleteEvidenciaRequest } from "../../api/evidencias";
import { createMultaRequest, deleteMultaRequest } from "../../api/multas";
import BurocrataLayout from "../../components/layouts/BurocrataLayout";
import { obtenerMetahumanoById } from "../../api/usuarios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function CarpetaDetalle() {
  const { id } = useParams();
  const [carpeta, setCarpeta] = useState(null);
  const [loading, setLoading] = useState(true);

  // Evidencia
  const [descripcion, setDescripcion] = useState("");
  const [fechaRecoleccion, setFechaRecoleccion] = useState("");
  const [imagen, setImagen] = useState("");
  const [evidenciaLat, setEvidenciaLat] = useState(null);
  const [evidenciaLng, setEvidenciaLng] = useState(null);
  const [metahumanoNombre, setMetahumanoNombre] = useState(null);

  // Actualizar estado de la carpeta
  const [estadoEdit, setEstadoEdit] = useState("");
  const [savingEstado, setSavingEstado] = useState(false);

  // Multas
  const [multaForms, setMultaForms] = useState({});

  const fetchCarpeta = async () => {
    try {
      const res = await getCarpetaByIdRequest(id);
      const c = res.data.data || res.data;
      setCarpeta(res.data.data || res.data);
      setCarpeta(c);
      setEstadoEdit(c?.estado || "activa");
      console.log("carpeta", c)
      if (c?.metahumano) {
        setMetahumanoNombre(c.metahumano.nombre || c.metahumano.alias || "—")
      } else {
        setMetahumanoNombre("-")
      }
    } catch (err) {
      console.error("Error al obtener carpeta:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarpeta();
  }, [id]);

  const isReadOnly = (carpeta?.estado === 'cerrada');

  // Inicialización del Mapa de la Evidencia
  useEffect(() => {
    let mapInstance = null;
    let markerInstance = null;

    if (!isReadOnly && !loading && carpeta) {
      const container = document.getElementById('evidencia-form-map');
      if (container) {
        mapInstance = L.map('evidencia-form-map').setView([-32.9468, -60.6393], 13); // Rosario por defecto

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        mapInstance.on('click', (e) => {
          const { lat, lng } = e.latlng;
          setEvidenciaLat(lat);
          setEvidenciaLng(lng);

          const icon = L.divIcon({
            html: `<div style="font-size: 28px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">📍</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          if (markerInstance) {
            markerInstance.setLatLng(e.latlng);
          } else {
            markerInstance = L.marker(e.latlng, { icon }).addTo(mapInstance);
          }
        });
      }
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [isReadOnly, loading, carpeta]);


  // Cambiar estado carpeta
  const handleGuardarEstado = async () => {
    try {
      if (!carpeta) return;
      if (estadoEdit === carpeta.estado) return;

      setSavingEstado(true);
      await patchCarpetaEstadoRequest(carpeta.id, estadoEdit);

      await fetchCarpeta();

    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("No se pudo actualizar el estado.");
    } finally {
      setSavingEstado(false);
    }
  };

  // Manejar cambio de archivo para la evidencia
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecciona un archivo de imagen (PNG o JPG).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagen(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Crear evidencia
  const handleCrearEvidencia = async (e) => {
    e.preventDefault();
    try {
      await createEvidenciaRequest({
        descripcion,
        fechaRecoleccion,
        carpetaId: id,
        imagen,
        latitud: evidenciaLat ? Number(evidenciaLat) : undefined,
        longitud: evidenciaLng ? Number(evidenciaLng) : undefined
      });
      setDescripcion("");
      setFechaRecoleccion("");
      setImagen("");
      setEvidenciaLat(null);
      setEvidenciaLng(null);
      const fileInput = document.getElementById("evidencia-file-input");
      if (fileInput) fileInput.value = "";
      fetchCarpeta();
    } catch (err) {
      console.error("Error al crear evidencia:", err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Error desconocido";
      alert(`❌ Error al crear evidencia: ${errMsg}`);
    }
  };



  // Eliminar evidencia
  const handleEliminarEvidencia = async (evidenciaId) => {
    if (!confirm("Eliminar evidencia?")) return;
    try {
      await deleteEvidenciaRequest(evidenciaId);
      fetchCarpeta();
    } catch (err) {
      console.error("Error al eliminar evidencia:", err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Error desconocido";
      alert(`❌ Error al eliminar evidencia: ${errMsg}`);
    }
  };

  // Cambiar campos de multa
  const handleMultaChange = (evidenciaId, field, value) => {
    setMultaForms(prev => ({
      ...prev,
      [evidenciaId]: {
        ...prev[evidenciaId],
        [field]: value,
      },
    }));
  };

  //  Crear multa
  const handleCrearMulta = async (e, evidenciaId) => {
    e.preventDefault();
    const formData = multaForms[evidenciaId];
    if (!formData) return;

    try {
      await createMultaRequest({
        ...formData,
        montoMulta: Number(formData.montoMulta),
        evidenciaId: evidenciaId,
        estado: "PENDIENTE", // Estado por defecto
      });

      setMultaForms(prev => ({
        ...prev,
        [evidenciaId]: {
          motivoMulta: "",
          montoMulta: "",
          lugarDePago: "",
          fechaEmision: "",
          fechaVencimiento: "",
          estado: "",
        },
      }));

      fetchCarpeta();
      alert("✅ Multa creada exitosamente con estado PENDIENTE");
    } catch (err) {
      console.error("Error al crear multa:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Error desconocido";
      alert(`❌ Error al crear la multa: ${errMsg}`);
    }
  };

  // Eliminar multa
  const handleEliminarMulta = async (multaId) => {
    if (!confirm("¿Eliminar esta multa?")) return;
    try {
      await deleteMultaRequest(multaId);
      fetchCarpeta();
    } catch (err) {
      console.error("Error al eliminar multa:", err);
    }
  };

  if (loading) {
    return (
      <BurocrataLayout>
        <p className="p-6 text-white">Cargando...</p>
      </BurocrataLayout>
    );
  }

  if (!carpeta) {
    return (
      <BurocrataLayout>
        <p className="p-6 text-white">No se encontró la carpeta solicitada.</p>
      </BurocrataLayout>
    );
  }

  return (
    <BurocrataLayout>
      <div className="p-6 text-white flex flex-col items-center">
        <div className="w-full max-w-2xl">

          {/* Cabecera */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">📁</span>
            <h1 className="text-3xl font-extrabold text-white drop-shadow">
              Detalle de Carpeta #{carpeta.id}
            </h1>
          </div>

          <div className="bg-[#2e2e2e] rounded-xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              📋 Información de la Carpeta
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">

              {/* Descripción */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Descripción
                </p>
                <p className="text-white text-base font-medium">
                  {carpeta.descripcion}
                </p>
              </div>

              {/* Estado */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Estado
                </p>
                <div className="flex items-center gap-3">
                  <select
                    value={estadoEdit}
                    onChange={(e) => setEstadoEdit(e.target.value)}
                    className="p-2 rounded bg-[#1a1a1a] text-white border border-gray-700"
                  >
                    <option value="ACTIVA">Activa</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="CERRADA">Cerrada</option>
                  </select>
                  <button
                    onClick={handleGuardarEstado}
                    disabled={savingEstado || estadoEdit === carpeta.estado}
                    className={`px-3 py-1 rounded font-semibold transition ${savingEstado || estadoEdit === carpeta.estado
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                      }`}
                  >
                    {savingEstado ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>

              {/* Metahumano */}
              <div className="-mt-3 ">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Metahumano
                </p>
                <p className="text-white text-base font-medium">
                  {metahumanoNombre ?? "—"}
                </p>
              </div>

              {/* Tipo */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Tipo
                </p>
                <p className="text-white text-base font-medium capitalize">
                  {carpeta.tipo}
                </p>
              </div>

              {/* ID Carpeta */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  ID Carpeta
                </p>
                <p className="text-white text-base font-medium">
                  {carpeta.id}
                </p>
              </div>
            </div>
          </div>


          {/* crear evidencia */}

          {!isReadOnly && (<div className="bg-[#2e2e2e] rounded-xl shadow-xl p-5 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              ✍️ Nueva Evidencia
            </h2>
            <form onSubmit={handleCrearEvidencia} className="space-y-3">
              <div>
                <label className="block mb-1 font-semibold">Descripción</label>
                <input
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full p-2 rounded bg-[#1a1a1a] text-white placeholder-gray-400"
                  placeholder="Descripción de la evidencia"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Fecha de Recolección</label>
                <input
                  type="date"
                  value={fechaRecoleccion}
                  onChange={(e) => setFechaRecoleccion(e.target.value)}
                  className="w-full p-2 rounded bg-[#1a1a1a] text-white"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-200">Imagen Adjunta (PNG o JPG)</label>
                <input
                  id="evidencia-file-input"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  className="w-full p-2 rounded bg-[#1a1a1a] text-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                {imagen && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">Previsualización:</p>
                    <img src={imagen} alt="Preview" className="max-h-32 rounded border border-gray-600 object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagen("");
                        const fileInput = document.getElementById("evidencia-file-input");
                        if (fileInput) fileInput.value = "";
                      }}
                      className="mt-1 text-xs text-red-400 hover:text-red-300 font-semibold"
                    >
                      Quitar imagen
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-200">📍 Ubicación de la Evidencia (Opcional)</label>
                <p className="text-gray-400 text-xs mb-2">Haz clic en el mapa para marcar dónde se recolectó/ocurrió la evidencia.</p>
                <div className="h-[200px] relative rounded bg-[#1a1a1a] overflow-hidden border border-gray-700">
                  <div id="evidencia-form-map" className="absolute inset-0 z-10"></div>
                </div>
                {evidenciaLat && evidenciaLng && (
                  <p className="text-xs text-green-400 mt-1">
                    Coordenadas seleccionadas: Lat {Number(evidenciaLat).toFixed(6)}, Lng {Number(evidenciaLng).toFixed(6)}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold w-full sm:w-auto"
              >
                Crear Evidencia
              </button>
            </form>
          </div>)}

          {/* evidencias */}
          {carpeta.evidencias?.length > 0 ? (
            <ul className="space-y-6">
              {carpeta.evidencias.map((ev) => (
                <li key={ev.id} className="bg-[#2e2e2e] p-5 rounded-xl shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{ev.descripcion}</p>
                      <p className="text-sm text-gray-400 mb-2">{ev.fechaRecoleccion}</p>
                      {ev.latitud && ev.longitud && (
                        <p className="text-xs text-amber-400 mb-2 flex items-center gap-1.5 bg-slate-900/40 p-2 rounded border border-slate-800">
                          <span>📍</span>
                          <span>Ubicación de la Evidencia: Lat {Number(ev.latitud).toFixed(6)}, Lng {Number(ev.longitud).toFixed(6)}</span>
                        </p>
                      )}
                      {ev.imagen && (
                        <div className="mt-3 mb-2">
                          <p className="text-xs text-gray-400 mb-1">Imagen Adjunta:</p>
                          <a href={ev.imagen} target="_blank" rel="noopener noreferrer" title="Clic para abrir en tamaño completo">
                            <img
                              src={ev.imagen}
                              alt="Evidencia adjunta"
                              className="max-h-48 rounded border border-gray-700 object-contain hover:scale-[1.01] transition-all cursor-zoom-in shadow-md"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {!isReadOnly && (<button
                        onClick={() => handleEliminarEvidencia(ev.id)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-semibold"
                      >
                        Eliminar
                      </button>)}
                      {isReadOnly && (<p className="text-sm text-gray-300"><i>Cambiar estado de carpeta para modificar...</i></p>)}
                    </div>
                  </div>

                  <div className="border-t border-gray-600 pt-3 mt-3">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      💰 Multas
                    </h3>

                    {ev.multas?.length > 0 ? (
                      <ul className="space-y-2 mb-4">
                        {ev.multas.map((m) => (
                          <li key={m.id} className="bg-[#3a3a3a] p-3 rounded flex justify-between">
                            <div>
                              <p className="font-semibold">{m.motivoMulta}</p>
                              <p className="text-sm text-gray-300">
                                {m.montoMulta} — {m.lugarDePago}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex items-center justify-center rounded font-semibold text-sm text-center h-10 w-28
                                    ${m.estado === "PAGADA"
                                    ? "bg-green-700/30 text-green-300 border border-green-500/50"
                                    : m.estado === "APROBADA"
                                      ? "bg-blue-700/30 text-blue-300 border border-blue-500/50"
                                      : m.estado === "PENDIENTE"
                                        ? "bg-yellow-700/3  0 text-yellow-300 border border-yellow-500/50"
                                        : "bg-gray-700/30 text-gray-300 border border-gray-500/50"
                                  }`}
                              >
                                {m.estado}
                              </div>

                              {!isReadOnly && (<button
                                onClick={() => handleEliminarMulta(m.id)}
                                className="bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-sm h-10 w-28"
                              >
                                Eliminar
                              </button>)}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-white/70 mb-4">No hay multas.</p>
                    )}

                    {/* crear multa */}
                    {!isReadOnly && (<form
                      onSubmit={(e) => handleCrearMulta(e, ev.id)}
                      className="space-y-2"
                    >
                      <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 mb-3">
                        <p className="text-yellow-200 text-sm flex items-center gap-2">
                          <span>⏳</span>
                          <span>La multa se creará con estado <strong>PENDIENTE</strong> y debe ser aprobada por un administrador</span>
                        </p>
                      </div>
                      <input
                        type="text"
                        placeholder="Motivo de la multa"
                        value={multaForms[ev.id]?.motivoMulta || ""}
                        onChange={(e) =>
                          handleMultaChange(ev.id, "motivoMulta", e.target.value)
                        }
                        className="w-full p-2 rounded bg-[#1a1a1a] text-white"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Monto"
                        value={multaForms[ev.id]?.montoMulta || ""}
                        onChange={(e) =>
                          handleMultaChange(ev.id, "montoMulta", e.target.value)
                        }
                        className="w-full p-2 rounded bg-[#1a1a1a] text-white"
                      />
                      <input
                        type="text"
                        placeholder="Lugar de pago"
                        value={multaForms[ev.id]?.lugarDePago || ""}
                        onChange={(e) =>
                          handleMultaChange(ev.id, "lugarDePago", e.target.value)
                        }
                        className="w-full p-2 rounded bg-[#1a1a1a] text-white"
                        required
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-sm mb-1 text-gray-300">
                            Fecha de emisión
                          </label>
                          <input
                            type="date"
                            value={multaForms[ev.id]?.fechaEmision || ""}
                            onChange={(e) =>
                              handleMultaChange(ev.id, "fechaEmision", e.target.value)
                            }
                            className="w-full p-2 rounded bg-[#1a1a1a] text-white"
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm mb-1 text-gray-300">
                            Fecha de vencimiento
                          </label>
                          <input
                            type="date"
                            value={multaForms[ev.id]?.fechaVencimiento || ""}
                            onChange={(e) =>
                              handleMultaChange(ev.id, "fechaVencimiento", e.target.value)
                            }
                            className="w-full p-2 rounded bg-[#1a1a1a] text-white"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded font-semibold"
                      >
                        Crear Multa
                      </button>
                    </form>)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/70">No hay evidencias asociadas.</p>
          )}
        </div>
      </div>
    </BurocrataLayout>
  );
}
