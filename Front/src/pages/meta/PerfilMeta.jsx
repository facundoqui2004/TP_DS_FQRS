import { useState, useEffect, useRef } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { MdEmail, MdPhone, MdWork, MdPerson, MdHome } from "react-icons/md";
import MetahumanoLayout from "../../components/layouts/MetahumanoLayout";
import { getMe, obtenerMetahumanoById, actualizarMetahumano } from "../../api/usuarios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MiPerfilMeta() {
  const [metahumano, setMetahumano] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempLat, setTempLat] = useState(null);
  const [tempLng, setTempLng] = useState(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const profileMapRef = useRef(null);
  const profileMarkerRef = useRef(null);

  useEffect(() => {
    const usuarioActual = async () => {
      try {
        const { data } = await getMe();
        const id = data.data.perfilId;
        const dataMeta = await obtenerMetahumanoById(id);
        setMetahumano(dataMeta.data.data);
      } catch (error) {
        console.error("Error al obtener el perfil", error);
      } finally {
        setLoading(false);
      }
    };

    usuarioActual();
  }, []);

  // Manejar inicialización y actualización del mapa del perfil
  useEffect(() => {
    let timer;
    if (!loading && metahumano) {
      timer = setTimeout(() => {
        const container = document.getElementById("profile-map");
        if (container && !profileMapRef.current) {
          const defaultLat = -32.9468;
          const defaultLng = -60.6393;
          const initialLat = metahumano.latitud || defaultLat;
          const initialLng = metahumano.longitud || defaultLng;

          const map = L.map("profile-map").setView([initialLat, initialLng], 14);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          profileMapRef.current = map;

          const icon = L.divIcon({
            html: `<div style="font-size: 26px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">📍</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          // Ubicar marcador si ya tiene ubicación guardada
          if (metahumano.latitud && metahumano.longitud) {
            profileMarkerRef.current = L.marker([metahumano.latitud, metahumano.longitud], { icon }).addTo(map);
          }

          map.on("click", (e) => {
            const { lat, lng } = e.latlng;
            setTempLat(lat);
            setTempLng(lng);
            setSaveSuccess(false);

            if (profileMarkerRef.current) {
              profileMarkerRef.current.setLatLng([lat, lng]);
            } else {
              profileMarkerRef.current = L.marker([lat, lng], { icon }).addTo(map);
            }
          });
        }
      }, 100);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (profileMapRef.current) {
        profileMapRef.current.remove();
        profileMapRef.current = null;
        profileMarkerRef.current = null;
      }
    };
  }, [loading, metahumano]);

  const handleSaveLocation = async () => {
    if (!tempLat || !tempLng) return;
    try {
      setSavingLocation(true);
      setSaveSuccess(false);
      setSaveError("");

      const payload = {
        nombre: metahumano.nombre,
        alias: metahumano.alias,
        origen: metahumano.origen,
        latitud: tempLat,
        longitud: tempLng
      };

      await actualizarMetahumano(metahumano.id, payload);

      setMetahumano(prev => ({
        ...prev,
        latitud: tempLat,
        longitud: tempLng
      }));

      setSaveSuccess(true);
      setTempLat(null);
      setTempLng(null);
    } catch (error) {
      console.error("Error al guardar ubicación:", error);
      setSaveError(error.message || "Error al actualizar ubicación");
    } finally {
      setSavingLocation(false);
    }
  };

  if (loading) {
    return (
      <MetahumanoLayout>
        <div className="text-center text-white/80 mt-20 animate-pulse">
          Cargando perfil...
        </div>
      </MetahumanoLayout>
    );
  }

  if (!metahumano) {
    return (
      <MetahumanoLayout>
        <div className="text-center text-red-400 mt-20">
          No se pudo cargar la información del metahumano.
        </div>
      </MetahumanoLayout>
    );
  }

  const { nombre, alias, origen, usuario, latitud, longitud } = metahumano;

  return (
    <MetahumanoLayout>
      {/* Encabezado */}
      <section className="text-center text-white mt-8 mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          👤 Mi Perfil
        </h1>
        <p className="opacity-90 text-base">
          Información personal del metahumano.
        </p>
      </section>

      {/* Tarjeta de perfil */}
      <div className="max-w-2xl mx-auto bg-[#1e293b]/80 backdrop-blur-md rounded-2xl p-8 text-white shadow-xl border border-white/10">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <FaRegUserCircle className="text-7xl text-blue-400 mb-3" />
          <h2 className="text-2xl font-bold">{nombre}</h2>
          <p className="text-white/70 text-sm italic">
            "{alias || 'Sin alias'}"
          </p>
        </div>

        {/* Datos */}
        <div className="space-y-5">
          {/* Nombre */}
          <div className="flex items-center gap-2">
            <MdPerson className="text-xl text-blue-300 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Nombre completo
              </label>
              <p className="bg-white/10 p-3 rounded-lg mb-6">{nombre}</p>
            </div>
          </div>

          {/* Origen */}
          <div className="flex items-center gap-2">
            <MdHome className="text-xl text-blue-300 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Lugar de origen
              </label>
              <p className="bg-white/10 p-3 rounded-lg mb-6">{origen}</p>
            </div>
          </div>

          {/* Correo */}
          <div className="flex items-center gap-2">
            <MdEmail className="text-xl text-blue-300 flex-shrink-0" />
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
            <MdPhone className="text-xl text-blue-300 flex-shrink-0" />
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
            <MdWork className="text-xl text-blue-300 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Rol asignado
              </label>
              <p className="bg-white/10 p-3 rounded-lg uppercase tracking-wide flex mb-6">
                {usuario?.role || "METAHUMANO"}
              </p>
            </div>
          </div>

          {/* Ubicación (Mapa para definir) */}
          <div className="border-t border-white/10 pt-6 mt-6">
            <h3 className="text-lg font-bold mb-3 text-blue-300 flex items-center gap-2">
              📍 Ubicación de mi Base de Operaciones
            </h3>
            <div 
              id="profile-map" 
              style={{ height: "250px" }} 
              className="w-full rounded-lg overflow-hidden border border-white/10 mb-3 relative z-10"
            ></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm">
                {latitud && longitud ? (
                  <p className="text-green-400 font-medium">
                    Base establecida: Lat: {latitud.toFixed(6)}, Lng: {longitud.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-amber-400 font-medium">
                    Sin ubicación definida. ¡Marca un punto en el mapa!
                  </p>
                )}
                {tempLat && tempLng && (
                  <p className="text-blue-300 text-xs mt-1">
                    Nueva ubicación seleccionada: Lat: {tempLat.toFixed(6)}, Lng: {tempLng.toFixed(6)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveLocation}
                disabled={savingLocation || !tempLat}
                className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-gray-400 disabled:cursor-not-allowed font-bold rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {savingLocation ? "Guardando..." : "Guardar Ubicación"}
              </button>
            </div>
            
            {saveSuccess && (
              <p className="text-xs text-green-400 mt-2">
                ✓ Ubicación guardada exitosamente.
              </p>
            )}
            {saveError && (
              <p className="text-xs text-red-400 mt-2">
                ✗ Error al guardar ubicación: {saveError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Fecha de actualización */}
      <p className="text-center text-white/60 mt-10">
        Última actualización:{" "}
        {new Date(usuario?.updatedAt || Date.now()).toLocaleDateString()}
      </p>
    </MetahumanoLayout>
  );
}
