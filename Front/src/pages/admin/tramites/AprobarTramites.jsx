import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { getAllCarpetasRequest, patchCarpetaEstadoRequest } from '../../../api/carpetas';

const AprobarTramites = () => {
  const navigate = useNavigate();
  const [carpetas, setCarpetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('PENDIENTE');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => {
    cargarCarpetas();
  }, []);

  const cargarCarpetas = async () => {
    try {
      setLoading(true);
      const response = await getAllCarpetasRequest();
      const carpetasData = response.data?.data || response.data || [];
      
      // Ordenar por ID descendente
      const ordenadas = carpetasData.sort((a, b) => b.id - a.id);
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
        
        // Actualización instantánea local
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
      c.metahumano?.nombre?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado = filtroEstado === 'todos' || c.estado?.toUpperCase() === filtroEstado.toUpperCase();
    const coincideTipo = filtroTipo === 'todos' || c.tipo === filtroTipo;

    return coincideBusqueda && coincideEstado && coincideTipo;
  });

  return (
    <AdminLayout title="Aprobar / Rechazar Trámites">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              📋 Aprobar / Rechazar Trámites
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Revisa y aprueba solicitudes de rehabilitaciones, daños colaterales, asignación de enemigos y capturas de villanos.
            </p>
          </div>
          <button
            onClick={cargarCarpetas}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-650 disabled:bg-gray-650 rounded-lg text-white font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Buscador y Filtros */}
        <div className="bg-[#1e293b] rounded-lg p-6 border border-slate-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busqueda */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por descripción o metahumano..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none placeholder-gray-400 text-sm"
              />
            </div>

            {/* Filtro Estado */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none text-sm cursor-pointer"
              >
                <option value="PENDIENTE">⏳ Pendientes</option>
                <option value="APROBADA">✅ Aprobadas</option>
                <option value="RECHAZADA">❌ Rechazadas</option>
                <option value="activa">📁 Activas (General)</option>
                <option value="cerrada">🔒 Cerradas</option>
                <option value="todos">Todos</option>
              </select>
            </div>

            {/* Filtro Tipo */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Tipo de Trámite
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none text-sm cursor-pointer"
              >
                <option value="todos">Todos los tipos</option>
                <option value="TRAMITE_REHABILITACION">🕊️ Rehabilitación de Villanos</option>
                <option value="PERMISO_DESTRUCCION">💥 Daños Colaterales / Destrucción</option>
                <option value="SOLICITUD_ENEMIGO">🎯 Asignación de Enemigos (Héroes)</option>
                <option value="CAPTURA_VILLANO">🚔 Captura de Villanos (Burócratas)</option>
                <option value="general">Carpeta General</option>
                <option value="penal">Carpeta Penal</option>
                <option value="civil">Carpeta Civil</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listado de Carpetas */}
        {loading && carpetas.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        ) : carpetasFiltradas.length === 0 ? (
          <div className="bg-[#1e293b] rounded-lg p-12 text-center border border-slate-650">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-white mb-2">No se encontraron trámites</h3>
            <p className="text-gray-400">No hay carpetas o trámites que coincidan con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {carpetasFiltradas.map((c) => {
              const tipoUpper = (c.tipo || '').toUpperCase();
              let badgeColor = 'bg-gray-700 text-gray-300';
              let titleEmoji = '📁';
              
              if (tipoUpper === 'TRAMITE_REHABILITACION') {
                badgeColor = 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/20';
                titleEmoji = '🕊️';
              } else if (tipoUpper === 'PERMISO_DESTRUCCION') {
                badgeColor = 'bg-amber-600/20 text-amber-300 border border-amber-500/20';
                titleEmoji = '💥';
              } else if (tipoUpper === 'SOLICITUD_ENEMIGO') {
                badgeColor = 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20';
                titleEmoji = '🎯';
              } else if (tipoUpper === 'CAPTURA_VILLANO') {
                badgeColor = 'bg-rose-600/20 text-rose-300 border border-rose-500/20';
                titleEmoji = '🚔';
              }

              return (
                <div
                  key={c.id}
                  className="bg-[#1e293b] border border-slate-650 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{titleEmoji}</span>
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeColor}`}>
                          {c.tipo}
                        </span>
                        <span className="text-xs text-gray-500 ml-2 font-mono">ID: #{c.id}</span>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      c.estado === 'APROBADA' ? 'bg-green-600/20 text-green-300 border border-green-500/30' :
                      c.estado === 'RECHAZADA' ? 'bg-red-600/20 text-red-300 border border-red-500/30' :
                      c.estado === 'PENDIENTE' || c.estado === 'pendiente' ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-slate-700 text-gray-300'
                    }`}>
                      {c.estado}
                    </span>
                  </div>

                  <p className="text-white text-base font-medium mb-4 leading-relaxed bg-slate-900/40 p-4 rounded-lg border border-slate-800">
                    {c.descripcion}
                  </p>

                  {/* Evidencias de la carpeta */}
                  {c.evidencias && c.evidencias.length > 0 && (
                    <div className="mt-4 border-t border-slate-700 pt-4 mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        🔍 Evidencias Adjuntas ({c.evidencias.length})
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {c.evidencias.map((ev) => (
                          <div key={ev.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-2">
                            <p className="text-white text-sm font-medium">{ev.descripcion}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                              <span>📅 {new Date(ev.fechaRecoleccion).toLocaleDateString()}</span>
                              {ev.latitud && ev.longitud && (
                                <span className="text-amber-400">📍 Lat: {Number(ev.latitud).toFixed(4)}, Lng: {Number(ev.longitud).toFixed(4)}</span>
                              )}
                            </div>
                            {ev.imagen && (
                              <div className="mt-2">
                                <a href={ev.imagen} target="_blank" rel="noopener noreferrer" className="inline-block" title="Ver imagen en tamaño completo">
                                  <img src={ev.imagen} alt="Evidencia" className="max-h-24 rounded border border-slate-700 object-contain hover:scale-[1.02] transition-transform" />
                                </a>
                              </div>
                            )}
                            
                            {/* Multas asociadas a la evidencia */}
                            {ev.multas && ev.multas.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-800/85">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">💰 Multas de la Evidencia</p>
                                <div className="space-y-1">
                                  {ev.multas.map((m) => (
                                    <div key={m.id} className="flex justify-between items-center text-xs bg-slate-950/40 p-1.5 rounded border border-slate-800/50">
                                      <span className="text-gray-300 font-medium truncate">{m.motivoMulta}</span>
                                      <span className="text-amber-300 font-bold ml-2">${m.montoMulta}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-gray-400">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {c.metahumano && (
                        <div>
                          Metahumano: <strong className="text-gray-200">{c.metahumano.alias}</strong> <span className="text-xs">({c.metahumano.nombre})</span>
                        </div>
                      )}
                      {c.burocrata && (
                        <div>
                          Burócrata Creador: <strong className="text-gray-200">{c.burocrata.nombre}</strong>
                        </div>
                      )}
                      {c.createdAt && (
                        <div>
                          Creado: <strong className="text-gray-200">{new Date(c.createdAt).toLocaleDateString()}</strong>
                        </div>
                      )}
                    </div>

                    {(c.estado === 'PENDIENTE' || c.estado === 'pendiente') && (
                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleResolverTramite(c.id, 'RECHAZADA')}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          ✕ Rechazar
                        </button>
                        <button
                          onClick={() => handleResolverTramite(c.id, 'APROBADA')}
                          className="px-5 py-2 bg-green-600/20 hover:bg-green-600 text-green-200 hover:text-white border border-green-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          ✓ Aprobar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AprobarTramites;
