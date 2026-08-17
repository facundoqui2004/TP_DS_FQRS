import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { getAllCarpetasRequest, patchCarpetaEstadoRequest } from '../../../api/carpetas';

// ── Componente de Mapa Dinámico ─────────────────────────────────────────────
const MapaZonaDestruccion = ({ latitud, longitud, radio, descripcion, carpetaId }) => {
  const mapInstanceRef = useRef(null);
  const mapId = `mapa-dest-${carpetaId}`;

  useEffect(() => {
    const lat = parseFloat(latitud);
    const lng = parseFloat(longitud);
    const radioMetros = radio ? parseInt(radio) : 500;
    if (isNaN(lat) || isNaN(lng)) return;

    import('leaflet').then((L) => {
      import('leaflet/dist/leaflet.css').catch(() => {});

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const container = document.getElementById(mapId);
      if (!container) return;

      if (container._leaflet_id) {
        delete container._leaflet_id;
      }

      let map;
      try {
        map = L.map(mapId, {
          center: [lat, lng],
          zoom: 14,
          scrollWheelZoom: false,
          zoomControl: true,
        });
      } catch {
        return;
      }

      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      const iconoDestruccion = L.divIcon({
        html: `<div style="font-size:26px;filter:drop-shadow(0 0 8px rgba(251,146,60,0.9));text-align:center;line-height:1;">💥</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        className: '',
      });

      L.marker([lat, lng], { icon: iconoDestruccion })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;min-width:160px;">
            <p style="font-weight:bold;color:#f97316;margin:0 0 4px 0;">⚠️ Zona de Impacto</p>
            <p style="margin:0 0 2px 0;font-size:12px;color:#374151;">${descripcion || 'Sin descripción'}</p>
            <p style="margin:0;font-size:11px;color:#6b7280;">📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}</p>
            <p style="margin:2px 0 0 0;font-size:11px;color:#ef4444;">🔴 Radio: ${radioMetros}m</p>
          </div>`,
          { maxWidth: 220 }
        )
        .openPopup();

      L.circle([lat, lng], {
        radius: radioMetros,
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '6, 4',
      }).addTo(map);

      map.fitBounds(
        L.circle([lat, lng], { radius: radioMetros * 1.6 }).getBounds(),
        { padding: [20, 20] }
      );
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitud, longitud, radio, mapId]);

  return (
    <div
      id={mapId}
      style={{ height: '260px', width: '100%', zIndex: 0 }}
      className="rounded-b-xl overflow-hidden"
    />
  );
};

// ── Componente wrapper con botón "Ver mapa" ───────────────────────────────────
const ZonaDestruccionCard = ({ c }) => {
  const [mapaVisible, setMapaVisible] = useState(false);

  return (
    <div className="mb-3.5 border border-amber-500/20 rounded-xl overflow-hidden bg-slate-950/40">
      <div className="bg-amber-950/20 border-b border-amber-500/20 px-3.5 py-2 flex items-center justify-between flex-wrap gap-2">
        <span className="text-amber-400 text-xs font-bold flex items-center gap-1.5">
          <span>🗺️</span> Zona de Destrucción Proyectada
        </span>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs text-amber-300/80">
            <span>📍 {parseFloat(c.latitud).toFixed(4)}, {parseFloat(c.longitud).toFixed(4)}</span>
            {c.radio && (
              <span className="bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-semibold text-amber-300">
                Radio: {c.radio}m
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMapaVisible(v => !v)}
            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            {mapaVisible ? 'Ocultar mapa' : 'Ver mapa'}
          </button>
        </div>
      </div>

      {mapaVisible && (
        <>
          <MapaZonaDestruccion
            latitud={c.latitud}
            longitud={c.longitud}
            radio={c.radio}
            descripcion={c.descripcion}
            carpetaId={c.id}
          />
          {(c.estado === 'PENDIENTE' || c.estado === 'pendiente') && (
            <div className="bg-rose-950/30 border-t border-rose-500/20 px-3.5 py-2 flex items-center gap-2">
              <span className="text-rose-400 text-xs">⚠️</span>
              <p className="text-rose-300 text-xs">
                Al aprobar este permiso, se autoriza la destrucción en el área marcada.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Componente Principal ─────────────────────────────────────────────────────
const AprobarTramites = () => {
  const navigate = useNavigate();
  const [carpetas, setCarpetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  // Por defecto, mostrar solo los PENDIENTES
  const [filtroEstado, setFiltroEstado] = useState('PENDIENTE');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Preview de fotos de evidencias
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    cargarCarpetas();
  }, []);

  const cargarCarpetas = async () => {
    try {
      setLoading(true);
      const response = await getAllCarpetasRequest();
      const carpetasData = response.data?.data || response.data || [];
      
      // Ordenar por fecha / ID descendente (más recientes primero)
      const ordenadas = carpetasData.sort((a, b) => {
        const fechaA = new Date(a.createdAt || 0);
        const fechaB = new Date(b.createdAt || 0);
        if (fechaB - fechaA !== 0) return fechaB - fechaA;
        return (b.id || 0) - (a.id || 0);
      });

      setCarpetas(ordenadas);
    } catch (error) {
      console.error('Error al cargar carpetas:', error);
      setCarpetas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolverTramite = async (id, nuevoEstado) => {
    const accion = nuevoEstado === 'APROBADA' ? 'aprobar' : 'rechazar';
    if (window.confirm(`¿Estás seguro de que quieres ${accion} este trámite?`)) {
      try {
        setLoading(true);
        await patchCarpetaEstadoRequest(id, nuevoEstado);
        setCarpetas(prev => prev.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
      } catch (error) {
        console.error(`Error al ${accion} trámite:`, error);
        alert(`Error al ${accion} el trámite: ` + (error.response?.data?.message || error.message));
        await cargarCarpetas();
      } finally {
        setLoading(false);
      }
    }
  };

  const carpetasFiltradas = carpetas.filter(c => {
    const coincideBusqueda = !busqueda ||
      c.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.tipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.metahumano?.alias?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.metahumano?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.id?.toString().includes(busqueda);

    const coincideEstado = filtroEstado === 'todos' || c.estado?.toUpperCase() === filtroEstado.toUpperCase();
    const coincideTipo = filtroTipo === 'todos' || c.tipo?.toLowerCase() === filtroTipo.toLowerCase();
    
    return coincideBusqueda && coincideEstado && coincideTipo;
  });

  const getTipoInfo = (tipo) => {
    const tipoUpper = (tipo || '').toUpperCase();
    if (tipoUpper === 'TRAMITE_REHABILITACION') {
      return { label: 'Rehabilitación de Villano', icon: '🕊️', badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
    } else if (tipoUpper === 'PERMISO_DESTRUCCION') {
      return { label: 'Permiso de Destrucción', icon: '💥', badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
    } else if (tipoUpper === 'SOLICITUD_ENEMIGO') {
      return { label: 'Asignación de Enemigo', icon: '🎯', badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' };
    } else if (tipoUpper === 'CAPTURA_VILLANO') {
      return { label: 'Captura de Villano', icon: '🚔', badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
    }
    return { label: tipo || 'Carpeta General', icon: '📁', badgeColor: 'bg-slate-700/50 text-slate-300 border-slate-600' };
  };

  const getEstadoBadge = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'APROBADA':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'RECHAZADA':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
      case 'PENDIENTE':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border border-slate-600';
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <AdminLayout title="Aprobar / Rechazar Trámites">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Minimalista */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>📋</span> Aprobación de Trámites y Permisos
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Revisión y validación de solicitudes de rehabilitación, permisos de destrucción y asignaciones
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/admin/tramites')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span>←</span> Volver
            </button>
            <button
              onClick={cargarCarpetas}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span>🔄</span> Refrescar
            </button>
          </div>
        </div>

        {/* Filtros Minimalistas */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar por descripción, metahumano o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700/70 text-sm text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full md:w-auto">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800/80 border border-slate-700/70 text-xs font-semibold text-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="PENDIENTE">⏳ Solo Pendientes</option>
              <option value="todos">📋 Todos los Estados</option>
              <option value="APROBADA">✅ Aprobadas</option>
              <option value="RECHAZADA">❌ Rechazadas</option>
              <option value="activa">📁 Activas</option>
              <option value="cerrada">🔒 Cerradas</option>
            </select>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800/80 border border-slate-700/70 text-xs font-semibold text-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="todos">Todos los Tipos</option>
              <option value="TRAMITE_REHABILITACION">🕊️ Rehabilitación</option>
              <option value="PERMISO_DESTRUCCION">💥 Destrucción</option>
              <option value="SOLICITUD_ENEMIGO">🎯 Asignación Enemigo</option>
              <option value="CAPTURA_VILLANO">🚔 Captura Villano</option>
              <option value="general">Carpeta General</option>
            </select>
            <div className="flex items-center px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-slate-400">
              <span>Resultados: <strong className="text-slate-200 font-mono ml-1">{carpetasFiltradas.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Listado de Trámites Minimalista */}
        {loading && carpetas.length === 0 ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-3"></div>
            <p className="text-slate-400 text-xs font-medium">Cargando trámites...</p>
          </div>
        ) : carpetasFiltradas.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">
              {filtroEstado === 'PENDIENTE' ? 'No hay trámites pendientes de resolución' : 'No se encontraron trámites'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {filtroEstado === 'PENDIENTE'
                ? 'Todos los trámites han sido procesados. Cambia el filtro a "Todos" para revisar el historial.'
                : 'Intenta ajustando el término de búsqueda o los filtros seleccionados.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {carpetasFiltradas.map((c) => {
              const tipoInfo = getTipoInfo(c.tipo);
              const tipoUpper = (c.tipo || '').toUpperCase();
              const esPermisoDestruccion = tipoUpper === 'PERMISO_DESTRUCCION';
              const tieneUbicacion = esPermisoDestruccion && c.latitud != null && c.longitud != null;
              const esPendiente = c.estado?.toUpperCase() === 'PENDIENTE';

              return (
                <div
                  key={c.id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all shadow-sm space-y-4"
                >
                  {/* Top Bar: Tipo + ID + Fecha + Estado */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xl">{tipoInfo.icon}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${tipoInfo.badgeColor}`}>
                        {tipoInfo.label}
                      </span>
                      <span className="font-mono text-xs text-slate-500">Expediente #{c.id}</span>
                      {c.createdAt && (
                        <span className="text-xs text-slate-400">
                          • {formatearFecha(c.createdAt)}
                        </span>
                      )}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${getEstadoBadge(c.estado)}`}>
                      {c.estado}
                    </span>
                  </div>

                  {/* Descripción del Trámite */}
                  <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/80">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Descripción / Solicitud</p>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {c.descripcion || 'Sin descripción'}
                    </p>
                  </div>

                  {/* Zona de Destrucción / Mapa si aplica */}
                  {tieneUbicacion && <ZonaDestruccionCard c={c} />}

                  {/* Evidencias si contiene */}
                  {c.evidencias && c.evidencias.length > 0 && (
                    <div className="border-t border-slate-800/80 pt-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <span>🔍</span> Evidencias Adjuntas ({c.evidencias.length})
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {c.evidencias.map((ev) => (
                          <div key={ev.id} className="bg-slate-950/50 border border-slate-800/90 rounded-lg p-3 space-y-2">
                            <p className="text-xs text-slate-200 font-medium">{ev.descripcion}</p>
                            <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                              <span>📅 {formatearFecha(ev.fechaRecoleccion)}</span>
                              {ev.latitud && ev.longitud && (
                                <span className="text-amber-400">📍 Lat: {Number(ev.latitud).toFixed(4)}, Lng: {Number(ev.longitud).toFixed(4)}</span>
                              )}
                            </div>
                            {ev.imagen && (
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(ev.imagen)}
                                  className="group relative inline-block rounded-lg overflow-hidden border border-slate-700/80 cursor-pointer"
                                >
                                  <img 
                                    src={ev.imagen} 
                                    alt="Evidencia" 
                                    className="max-h-24 rounded object-contain group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-cyan-300 font-bold">
                                    🔍 Ampliar
                                  </div>
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer: Metahumano info + Acciones */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {c.metahumano && (
                        <div>
                          Metahumano: <strong className="text-slate-200">{c.metahumano.alias || c.metahumano.nombre}</strong>
                          {c.metahumano.nombre && c.metahumano.alias && <span className="text-slate-400 ml-1">({c.metahumano.nombre})</span>}
                        </div>
                      )}
                      {c.burocrata && (
                        <div>Burócrata: <strong className="text-slate-200">{c.burocrata.nomBurocrata || c.burocrata.nombre}</strong></div>
                      )}
                    </div>

                    {esPendiente && (
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleResolverTramite(c.id, 'RECHAZADA')}
                          className="px-3.5 py-1.5 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>✕</span>
                          <span>Rechazar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolverTramite(c.id, 'APROBADA')}
                          className="px-4 py-1.5 bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>✓</span>
                          <span>Aprobar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Lightbox de Foto Ampliada */}
        {previewImage && (
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-rose-400 text-xl font-bold bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 cursor-pointer"
              >
                ✕ Cerrar
              </button>
              <img 
                src={previewImage} 
                alt="Evidencia Ampliada" 
                className="max-h-[85vh] max-w-full rounded-xl border border-slate-700 shadow-2xl object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AprobarTramites;
