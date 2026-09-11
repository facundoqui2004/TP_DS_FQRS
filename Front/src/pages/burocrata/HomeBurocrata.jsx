import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BurocrataLayout from "../../components/layouts/BurocrataLayout";
import { useAuth } from "../../context/AuthContext";
import { getMe } from "../../api/usuarios";
import { getBurocrataByIdRequest, updateBurocrataRequest } from "../../api/burocratas";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function HomeBurocrata() {
  const [showMenu, setShowMenu] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const [burocrata, setBurocrata] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [savingLocation, setSavingLocation] = useState(false);

  // Cargar burócrata al montar
  const fetchBurocrataInfo = async () => {
    try {
      const { data } = await getMe();
      const id = data.data.perfilId;
      const res = await getBurocrataByIdRequest(id);
      const buro = res.data.data;
      setBurocrata(buro);
      if (buro.latitud) setLat(buro.latitud);
      if (buro.longitud) setLng(buro.longitud);
    } catch (err) {
      console.error("Error al obtener información del burócrata:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBurocrataInfo();
    }
  }, [isAuthenticated]);

  // Inicializar Leaflet cuando el modal se abre
  useEffect(() => {
    let mapInstance = null;
    let markerInstance = null;

    if (showMapModal && burocrata) {
      const initialLat = lat || -32.9468;
      const initialLng = lng || -60.6393;

      const container = document.getElementById('buro-location-map');
      if (container) {
        mapInstance = L.map('buro-location-map').setView([initialLat, initialLng], lat ? 12 : 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        if (lat && lng) {
          const icon = L.divIcon({
            html: `<div style="font-size: 28px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">💼</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          markerInstance = L.marker([lat, lng], { icon }).addTo(mapInstance);
        }

        mapInstance.on('click', (e) => {
          const { lat: clickLat, lng: clickLng } = e.latlng;
          setLat(clickLat);
          setLng(clickLng);

          const icon = L.divIcon({
            html: `<div style="font-size: 28px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">💼</div>`,
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
  }, [showMapModal, burocrata]);

  const handleGuardarUbicacion = async () => {
    if (!lat || !lng || !burocrata) return;
    try {
      setSavingLocation(true);
      await updateBurocrataRequest(burocrata.id, {
        ...burocrata,
        latitud: Number(lat),
        longitud: Number(lng)
      });
      await fetchBurocrataInfo();
      setShowMapModal(false);
      alert("📍 Ubicación de la oficina burócrata guardada con éxito!");
    } catch (error) {
      console.error("Error al guardar la ubicación:", error);
      alert("No se pudo guardar la ubicación.");
    } finally {
      setSavingLocation(false);
    }
  };

  // Navegación
  const goToCarpetas = () => navigate("/burocrata/carpetas");
  const goToPerfil = () => navigate("/burocrata/perfil");
  const goToSoporte = () => navigate("/burocrata/soporte");
  const goToNoticias = () => navigate("/burocrata/noticias");

  // Menú lateral y usuario
  const toggleMenu = () => {
    setShowMenu(!showMenu);
    if (showUser) setShowUser(false);
  };

  const toggleUser = () => setShowUser(!showUser);
  const closeUser = () => setShowUser(false);

  return (
   
    <BurocrataLayout>
        {/* Encabezado */}
        <section className="text-center text-white mt-8 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            🏛️ Portal Burócrata
          </h1>
          <p className="opacity-90 text-base">
            Bienvenido al panel de control para usuarios burócratas.
          </p>
        </section>

        <section className="flex flex-col items-center gap-6">
          {/* Carpetas */}
          <div
            onClick={goToCarpetas}
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                       p-6 rounded-2xl shadow-2xl text-white w-full max-w-md transition transform hover:-translate-y-1 hover:shadow-blue-500/30"
          >
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              📂 Gestión Carpetas
            </h2>
            <p className="text-white/90 text-sm">
              Gestioná y supervisá todas tus carpetas burocráticas en un solo lugar.
            </p>
            <div className="text-right mt-3 text-2xl font-light">→</div>
          </div>

          {/* Mi Perfil */}
          <div
            onClick={goToPerfil}
            className="cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 
                       p-6 rounded-2xl shadow-2xl text-white w-full max-w-md transition transform hover:-translate-y-1 hover:shadow-emerald-500/30"
          >
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              👤 Mi Perfil
            </h2>
            <p className="text-white/90 text-sm">
              Consultá y actualizá tu información personal, credenciales y preferencias.
            </p>
            <div className="text-right mt-3 text-2xl font-light">→</div>
          </div>

          {/* Noticias */}
          <div
            onClick={goToNoticias}
            className="cursor-pointer bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 
                       p-6 rounded-2xl shadow-2xl text-white w-full max-w-md transition transform hover:-translate-y-1 hover:shadow-indigo-500/30"
          >
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              📰 Gestión de Noticias
            </h2>
            <p className="text-white/90 text-sm">
              Publicá, editá y gestioná noticias oficiales para los metahumanos registrados.
            </p>
            <div className="text-right mt-3 text-2xl font-light">→</div>
          </div>

          {/* Establecer mi ubicación */}
          <div
            onClick={() => setShowMapModal(true)}
            className="cursor-pointer bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 
                       p-6 rounded-2xl shadow-2xl text-white w-full max-w-md transition transform hover:-translate-y-1 hover:shadow-orange-500/30"
          >
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              📍 Establecer mi ubicación
            </h2>
            <p className="text-white/90 text-sm">
              {lat && lng 
                ? `Ubicación actual: Lat ${Number(lat).toFixed(4)}, Lng ${Number(lng).toFixed(4)}`
                : "Establece las coordenadas geográficas de tu oficina burócrata."}
            </p>
            <div className="text-right mt-3 text-2xl font-light">→</div>
          </div>

          {/* Soporte */}
          <div
            onClick={goToSoporte}
            className="cursor-pointer bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 
                       p-6 rounded-2xl shadow-2xl text-white w-full max-w-md transition transform hover:-translate-y-1 hover:shadow-fuchsia-500/30"
          >
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              🛠️ Soporte
            </h2>
            <p className="text-white/90 text-sm">
              Accedé a ayuda, tutoriales y contactá con el equipo de soporte técnico.
            </p>
            <div className="text-right mt-3 text-2xl font-light">→</div>
          </div>
        </section>

        {/* Bloque informativo */}
        <section className="mt-12 text-center text-white/70">
          Panel de control Burócrata en desarrollo…
        </section>

        {/* Modal de Mapa */}
        {showMapModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl text-white shadow-2xl relative animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  📍 Selecciona tu Ubicación de Oficina / Base
                </h3>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-2xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-400 text-xs mb-4">
                Haz clic sobre el mapa para establecer o actualizar tu ubicación geográfica.
              </p>

              {/* Contenedor del Mapa */}
              <div className="h-[350px] relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                <div id="buro-location-map" className="absolute inset-0 z-10"></div>
              </div>

              {/* Info de coordenadas */}
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs">
                <div className="flex gap-4 items-center justify-between sm:justify-start">
                  <div>
                    <span className="text-gray-400 font-semibold block uppercase tracking-widest text-[9px]">Latitud</span>
                    <strong className="text-white text-sm">{lat ? Number(lat).toFixed(6) : "No seleccionada"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block uppercase tracking-widest text-[9px]">Longitud</span>
                    <strong className="text-white text-sm">{lng ? Number(lng).toFixed(6) : "No seleccionada"}</strong>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowMapModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarUbicacion}
                    disabled={savingLocation || !lat || !lng}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    {savingLocation ? "⏳ Guardando..." : "📍 Confirmar Ubicación"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </BurocrataLayout>
  );
}

export default HomeBurocrata;