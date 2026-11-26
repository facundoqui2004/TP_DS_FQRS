import { useState, useEffect, useCallback, useMemo } from "react";
import MetahumanoLayout from "../../components/layouts/MetahumanoLayout";
import BurocrataLayout from "../../components/layouts/BurocrataLayout";
import { useAuth } from "../../context/AuthContext";
import { escapeHtml } from "../../utils/escapeHtml";
import { normalizeRole } from "../../utils/roles";
import { config } from "../../config/environment";
import MapView from "../../components/MapView";

export default function VigilarMundoMeta() {
    const { isAuthenticated, getPerfilId, user } = useAuth();
    const [metahumanosList, setMetahumanosList] = useState([]);
    const [burocratasList, setBurocratasList] = useState([]);
    const [carpetasDestruccion, setCarpetasDestruccion] = useState([]);
    const [evidenciasList, setEvidenciasList] = useState([]);
    const [loading, setLoading] = useState(false);

    const rolUsuario = normalizeRole(user?.role);
    const isBurocrata = rolUsuario === 'BUROCRATA' || rolUsuario === 'ADMIN';
    const LayoutComponent = isBurocrata ? BurocrataLayout : MetahumanoLayout;

    // Cargar metahumanos, carpetas, evidencias y burócratas
    const fetchMapData = useCallback(async () => {
        setLoading(true);
        try {
            const resMeta = await fetch(`${config.apiBaseUrl}/metahumanos`, { credentials: 'include' });
            if (resMeta.ok) {
                const data = await resMeta.json();
                setMetahumanosList(data.data || data || []);
            }

            const resCarp = await fetch(`${config.apiBaseUrl}/carpetas`, { credentials: 'include' });
            if (resCarp.ok) {
                const data = await resCarp.json();
                const list = data.data || data || [];
                setCarpetasDestruccion(list.filter(c => c.tipo === 'PERMISO_DESTRUCCION'));
            }

            const metaId = getPerfilId();
            if (metaId) {
                const resEv = await fetch(`${config.apiBaseUrl}/evidencias`, { credentials: 'include' });
                if (resEv.ok) {
                    const data = await resEv.json();
                    setEvidenciasList(data.data || data || []);
                }
            }

            const resBuro = await fetch(`${config.apiBaseUrl}/burocratas`, { credentials: 'include' });
            if (resBuro.ok) {
                const data = await resBuro.json();
                setBurocratasList(data.data || data || []);
            }
        } catch (err) {
            console.error('Error al cargar datos para el mapa:', err);
        } finally {
            setLoading(false);
        }
    }, [getPerfilId]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMapData();
        }
    }, [isAuthenticated, user, fetchMapData]);

    // Construir marcadores y círculos según permisos y datos cargados
    const { mapMarkers, mapCircles } = useMemo(() => {
        const markers = [];
        const circles = [];

        // 1. Metahumanos (si no es burócrata/admin, ocultar villanos)
        metahumanosList.forEach(m => {
            if (!isBurocrata && m.tipoMeta === 'villano') return;
            if (m.latitud && m.longitud) {
                const esHeroe = m.tipoMeta === 'heroe' || m.tipoMeta === 'heróe';
                const esVillano = m.tipoMeta === 'villano';
                const emoji = esHeroe ? '🦸‍♂️' : esVillano ? '🦹' : '👤';
                const colorEstado = esHeroe ? '#3b82f6' : esVillano ? '#ef4444' : '#10b981';
                const labelEstado = esHeroe ? '🦸‍♂️ HÉROE' : esVillano ? '🦹 VILLANO' : '👤 METAHUMANO';

                markers.push({
                    id: `meta-${m.id}`,
                    lat: Number(m.latitud),
                    lng: Number(m.longitud),
                    emoji,
                    popupHtml: `
                        <div style="font-family: sans-serif; color: #333; min-width: 140px; padding: 2px;">
                            <strong style="font-size: 13px;">${escapeHtml(m.alias || 'Metahumano')}</strong><br/>
                            <span style="font-size: 11px; color: #666;">Nombre: ${escapeHtml(m.nombre)}</span><br/>
                            <span style="font-size: 11px; font-weight: bold; color: ${colorEstado}">
                                ${labelEstado}
                            </span>
                        </div>
                    `
                });
            }
        });

        // 2. Burócratas (solo visibles para burócratas y admin)
        if (isBurocrata) {
            burocratasList.forEach(b => {
                if (b.latitud && b.longitud) {
                    markers.push({
                        id: `buro-${b.id}`,
                        lat: Number(b.latitud),
                        lng: Number(b.longitud),
                        emoji: '👨‍💼',
                        popupHtml: `
                            <div style="font-family: sans-serif; color: #333; min-width: 160px; padding: 2px;">
                                <strong style="font-size: 13px; color: #1e293b;">Burócrata ID: ${b.id}</strong><br/>
                                <hr style="margin: 4px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
                                <span style="font-size: 11px; color: #475569;">
                                    👨‍💼 <b>Nombre:</b> ${escapeHtml(b.nombre)}
                                </span>
                            </div>
                        `
                    });
                }
            });
        }

        // 3. Evidencias
        evidenciasList.forEach(ev => {
            if (ev.latitud && ev.longitud) {
                const fechaFormateada = new Date(ev.fechaRecoleccion).toLocaleDateString("es-AR", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                markers.push({
                    id: `ev-${ev.id}`,
                    lat: Number(ev.latitud),
                    lng: Number(ev.longitud),
                    emoji: '🔍',
                    popupHtml: `
                        <div style="font-family: sans-serif; color: #333; min-width: 160px; padding: 2px;">
                            <strong style="font-size: 13px; color: #1e293b;">Evidencia ID: ${ev.id}</strong><br/>
                            <hr style="margin: 4px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
                            <span style="font-size: 11px; color: #475569;">
                                📅 <b>Fecha:</b> ${fechaFormateada}
                            </span><br/>
                            <span style="font-size: 11px; color: #475569;">
                                📂 <b>Carpeta:</b> ${escapeHtml(ev.carpeta?.descripcion || 'Sin descripción')} (ID: ${ev.carpeta?.id || 'N/A'})
                            </span>
                        </div>
                    `
                });
            }
        });

        // 4. Zonas de Destrucción y sus radios
        carpetasDestruccion.forEach(c => {
            if (c.latitud && c.longitud) {
                const lat = Number(c.latitud);
                const lng = Number(c.longitud);
                const colorEstado = c.estado === 'APROBADA' ? '#10b981' : c.estado === 'PENDIENTE' ? '#f59e0b' : '#ef4444';

                markers.push({
                    id: `dest-${c.id}`,
                    lat,
                    lng,
                    emoji: '💥',
                    popupHtml: `
                        <div style="font-family: sans-serif; color: #333; min-width: 180px; padding: 2px;">
                            <strong style="font-size: 13px; color: #ef4444;">💥 ZONA DE DESTRUCCIÓN</strong><br/>
                            <hr style="margin: 4px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
                            <span style="font-size: 11px; color: #475569;">
                                📂 <b>Trámite ID:</b> ${c.id}
                            </span><br/>
                            <span style="font-size: 11px; color: #475569;">
                                📝 <b>Descripción:</b> ${escapeHtml(c.descripcion || 'Sin descripción')}
                            </span><br/>
                            <span style="font-size: 11px; color: #475569;">
                                🎯 <b>Radio:</b> ${c.radio ? `${escapeHtml(c.radio)} metros` : 'No especificado'}
                            </span><br/>
                            <span style="font-size: 11px; font-weight: bold; color: ${colorEstado}">
                                ⚖️ <b>Estado:</b> ${escapeHtml(c.estado)}
                            </span>
                        </div>
                    `
                });

                if (c.radio) {
                    circles.push({
                        id: `circle-${c.id}`,
                        lat,
                        lng,
                        radius: Number(c.radio),
                        color: '#ef4444',
                        fillColor: '#ef4444',
                        fillOpacity: 0.15,
                        weight: 1.5,
                        dashArray: '5, 5'
                    });
                }
            }
        });

        return { mapMarkers: markers, mapCircles: circles };
    }, [metahumanosList, burocratasList, evidenciasList, carpetasDestruccion, isBurocrata]);

    return (
        <LayoutComponent hideFooter={true} fullScreen={true}>
            <div className="px-4 h-full flex flex-col">
                {/* Encabezado */}
                <section className="text-white mb-4 flex justify-center items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Vigilar Mundo Metahumano</h1>
                    </div>
                </section>

                {/* Contenedor del Mapa de pantalla completa */}
                <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950">
                    {/* Botón flotante Actualizar */}
                    <div className="absolute top-4 right-4 z-[1000] flex gap-2">
                        <button
                            onClick={fetchMapData}
                            disabled={loading}
                            className={`px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-1.5 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            <span className={loading ? "animate-spin inline-block" : "inline-block"}>🔄</span>
                            {loading ? "Actualizando..." : "Actualizar"}
                        </button>
                    </div>

                    {isAuthenticated && (
                        <MapView
                            center={[-32.9468, -60.6393]}
                            zoom={15}
                            readOnly={true}
                            markers={mapMarkers}
                            circles={mapCircles}
                            height="100%"
                        />
                    )}
                </div>
            </div>
        </LayoutComponent>
    );
}