import { useState, useEffect, useRef } from "react";
import MetahumanoLayout from "../../components/layouts/MetahumanoLayout";
import { useAuth } from "../../context/AuthContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function VigilarMundoMeta() {
    const { isAuthenticated, getPerfilId, user } = useAuth();
    const [mapTheme, setMapTheme] = useState("oscuro");
    const [metahumanosList, setMetahumanosList] = useState([]);
    const [burocratasList, setBurocratasList] = useState([]);
    const [carpetasDestruccion, setCarpetasDestruccion] = useState([]);
    const [evidenciasList, setEvidenciasList] = useState([]);
    const [loading, setLoading] = useState(false);
    const mapRef = useRef(null);

    // Cargar metahumanos y carpetas de la base de datos
    const fetchMapData = async () => {
        setLoading(true);
        try {
            console.log('fetchMapData ejecutándose...');
            const resMeta = await fetch('http://localhost:3000/api/metahumanos', { credentials: 'include' });
            if (resMeta.ok) {
                const data = await resMeta.json();
                console.log('Metahumanos cargados:', data.length || (data.data && data.data.length));
                setMetahumanosList(data.data || data || []);
            }

            const resCarp = await fetch('http://localhost:3000/api/carpetas', { credentials: 'include' });
            if (resCarp.ok) {
                const data = await resCarp.json();
                const list = data.data || data || [];
                console.log('Carpetas cargadas:', list.length);
                setCarpetasDestruccion(list.filter(c => c.tipo === 'PERMISO_DESTRUCCION'));
            }

            const metaId = getPerfilId();
            console.log('metaId obtenido en fetchMapData:', metaId);
            if (metaId) {
                const url = `http://localhost:3000/api/evidencias?carpeta_metahumano=${metaId}`;
                console.log('Fetching evidencias de URL:', url);
                const resEv = await fetch(url, { credentials: 'include' });
                if (resEv.ok) {
                    const data = await resEv.json();
                    const evidencias = data.data || data || [];
                    console.log('Evidencias cargadas:', evidencias);
                    setEvidenciasList(evidencias);
                } else {
                    console.error('Error en respuesta de evidencias status:', resEv.status);
                }
            } else {
                console.warn('No se pudo obtener metaId para cargar evidencias');
            }

            const resBuro = await fetch('http://localhost:3000/api/burocratas', { credentials: 'include' })
            if (resBuro.ok) {
                const data = await resBuro.json();
                console.log('Burocratas cargados:', data.length || (data.data && data.data.length));
                setBurocratasList(data.data || data || []);
            }
        } catch (err) {
            console.error('Error al cargar datos para el mapa:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchMapData();
        }
    }, [isAuthenticated, user]);

    // 1. Inicialización del Mapa (Solo se ejecuta una vez al montar)
    useEffect(() => {
        if (!isAuthenticated) return;

        const container = document.getElementById('vigilar-map');
        if (!container) return;

        if (!mapRef.current) {
            mapRef.current = L.map('vigilar-map').setView([-32.9468, -60.6393], 15);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [isAuthenticated]);

    // 2. Actualización de Capas y Datos (Se ejecuta cuando cambian los datos o el tema)
    useEffect(() => {
        const mapInstance = mapRef.current;
        if (!mapInstance || !isAuthenticated) return;

        // Limpiar todas las capas existentes antes de re-dibujar
        mapInstance.eachLayer((layer) => {
            mapInstance.removeLayer(layer);
        });

        // Capas Base:
        const osmLight = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        });

        const osmDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        });

        // Aplicar capa base según el tema activo
        if (mapTheme === 'claro') {
            osmLight.addTo(mapInstance);
        } else {
            osmDark.addTo(mapInstance);
        }

        // 4. Graficar Metahumanos registrados
        metahumanosList.forEach(m => {
            if (m.latitud && m.longitud) {
                const emoji = m.tipoMeta === 'heroe' || m.tipoMeta === 'heróe' ? '🦸‍♂️' : m.tipoMeta === 'villano' ? '🦹' : '👤';
                const icon = L.divIcon({
                    html: `<div style="font-size: 26px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">${emoji}</div>`,
                    iconSize: [26, 26],
                    iconAnchor: [13, 13]
                });

                L.marker([m.latitud, m.longitud], { icon })
                    .addTo(mapInstance)
                    .bindPopup(`
            <div style="font-family: sans-serif; color: #333; min-width: 140px; padding: 2px;">
              <strong style="font-size: 13px;">${m.alias || 'Metahumano'}</strong><br/>
              <span style="font-size: 11px; color: #666;">Nombre: ${m.nombre}</span><br/>
              <span style="font-size: 11px; font-weight: bold; color: ${m.tipoMeta === 'heroe' || m.tipoMeta === 'heróe' ? '#3b82f6' : m.tipoMeta === 'villano' ? '#ef4444' : '#10b981'}">
                ${m.tipoMeta === 'heroe' || m.tipoMeta === 'heróe' ? '🦸‍♂️ HÉROE' : m.tipoMeta === 'villano' ? '🦹 VILLANO' : '👤 SIN DEFINIR'}
              </span>
            </div>
          `);
            }
        });

        // 5. Graficar Evidencias registradas
        console.log('Graficando evidencias en el mapa, cantidad:', evidenciasList.length);
        evidenciasList.forEach(ev => {
            console.log('Procesando evidencia:', ev);
            if (ev.latitud && ev.longitud) {
                const { id, fechaRecoleccion, latitud, longitud, carpeta } = ev;

                const icon = L.divIcon({
                    html: `<div style="font-size: 26px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">🔍</div>`,
                    iconSize: [26, 26],
                    iconAnchor: [13, 13]
                });

                const fechaFormateada = new Date(fechaRecoleccion).toLocaleDateString("es-AR", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                L.marker([latitud, longitud], { icon })
                    .addTo(mapInstance)
                    .bindPopup(`
                        <div style="font-family: sans-serif; color: #333; min-width: 160px; padding: 2px;">
                            <strong style="font-size: 13px; color: #1e293b;">Evidencia ID: ${id}</strong><br/>
                            <hr style="margin: 4px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
                            <span style="font-size: 11px; color: #475569;">
                                📅 <b>Fecha:</b> ${fechaFormateada}
                            </span><br/>
                            <span style="font-size: 11px; color: #475569;">
                                📂 <b>Carpeta:</b> ${carpeta?.descripcion || 'Sin descripción'} (ID: ${carpeta?.id || 'N/A'})
                            </span>
                        </div>
                    `);
                console.log(`Marcador de evidencia ${id} agregado al mapa en coordenadas:`, [latitud, longitud]);
            } else {
                console.warn(`Evidencia ${ev.id} no tiene coordenadas lat/long válidas:`, ev.latitud, ev.longitud);
            }
        });
        // Graficar burocratas
        console.log('Graficando burocratas en el mapa, cantidad:', burocratasList.length);
        burocratasList.forEach(b => {
            console.log('Procesando burocrata:', b);
            if (b.latitud && b.longitud) {
                const { id, nombre, latitud, longitud } = b;

                const icon = L.divIcon({
                    html: `<div style="font-size: 26px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">👨‍💼</div>`,
                    iconSize: [26, 26],
                    iconAnchor: [13, 13]
                });

                L.marker([latitud, longitud], { icon })
                    .addTo(mapInstance)
                    .bindPopup(`
                        <div style="font-family: sans-serif; color: #333; min-width: 160px; padding: 2px;">
                            <strong style="font-size: 13px; color: #1e293b;">Burocrata ID: ${id}</strong><br/>
                            <hr style="margin: 4px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
                            <span style="font-size: 11px; color: #475569;">
                                👨‍💼 <b>Nombre:</b> ${nombre}
                            </span>
                        </div>
                    `);
                console.log(`Marcador de burocrata ${id} agregado al mapa en coordenadas:`, [latitud, longitud]);
            } else {
                console.warn(`Burocrata ${b.id} no tiene coordenadas lat/long válidas:`, b.latitud, b.longitud);
            }
        });
    }, [metahumanosList, carpetasDestruccion, evidenciasList, burocratasList, isAuthenticated, mapTheme]);

    return (
        <MetahumanoLayout hideFooter={true} fullScreen={true}>
            <div className="px-4 h-full flex flex-col">
                {/* Encabezado */}
                <section className="text-white mb-4 flex justify-center items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Vigilar Mundo Metahumano</h1>
                    </div>
                </section>

                {/* Contenedor del Mapa de pantalla completa */}
                <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950">
                    {/* Botones flotantes (Actualizar y Tema) */}
                    <div className="absolute top-4 right-4 z-[1000] flex gap-2">
                        <button
                            onClick={fetchMapData}
                            disabled={loading}
                            className={`px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-1.5 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            <span className={loading ? "animate-spin inline-block" : "inline-block"}>🔄</span>
                            {loading ? "Actualizando..." : "Actualizar"}
                        </button>
                        <button
                            onClick={() => setMapTheme(prev => prev === 'claro' ? 'oscuro' : 'claro')}
                            className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg cursor-pointer"
                        >
                            {mapTheme === "claro" ? "🌙 Modo Oscuro" : "☀️ Modo Claro"}
                        </button>
                    </div>

                    <div id="vigilar-map" className="absolute inset-0 z-10"></div>
                </div>
            </div>
        </MetahumanoLayout>
    );
}
