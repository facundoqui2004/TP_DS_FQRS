import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { getAllMultasRequest, updateMultaRequest } from '../../../api/multas';
import { getCarpetaByIdRequest } from '../../../api/carpetas';

const GestionarMultas = () => {
  const navigate = useNavigate();
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  // Por defecto, mostrar solo las PENDIENTES
  const [filtroEstado, setFiltroEstado] = useState('PENDIENTE');

  // Estado para el modal de visualización de Carpeta / Expediente
  const [selectedMulta, setSelectedMulta] = useState(null);
  const [carpetaData, setCarpetaData] = useState(null);
  const [loadingCarpeta, setLoadingCarpeta] = useState(false);
  const [showCarpetaModal, setShowCarpetaModal] = useState(false);

  // Estado para zoom de imagen / lightbox
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    cargarMultas();
  }, []);

  const cargarMultas = async () => {
    try {
      setLoading(true);
      const response = await getAllMultasRequest();
      const multasData = response.data?.data || response.data || [];

      // Ordenar por fecha (más reciente o por fecha de emisión)
      const multasOrdenadas = multasData.sort((a, b) => {
        const fechaA = new Date(a.fechaEmision || a.createdAt || 0);
        const fechaB = new Date(b.fechaEmision || b.createdAt || 0);
        return fechaB - fechaA; // Orden cronológico descendente
      });

      setMultas(multasOrdenadas);
    } catch (error) {
      console.error('Error al cargar multas:', error);
      setMultas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobarMulta = async (multaId) => {
    if (window.confirm('¿Estás seguro de que quieres aprobar esta multa?')) {
      try {
        await updateMultaRequest(multaId, { estado: 'APROBADA' });
        setMultas(prev => prev.map(m => m.id === multaId ? { ...m, estado: 'APROBADA' } : m));
        if (selectedMulta && selectedMulta.id === multaId) {
          setSelectedMulta(prev => ({ ...prev, estado: 'APROBADA' }));
        }
      } catch (error) {
        console.error('Error al aprobar multa:', error);
        const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Error desconocido';
        alert('Error al aprobar la multa: ' + errMsg);
        await cargarMultas();
      }
    }
  };

  const handleRechazarMulta = async (multaId) => {
    if (window.confirm('¿Estás seguro de que quieres rechazar esta multa?')) {
      try {
        await updateMultaRequest(multaId, { estado: 'RECHAZADA' });
        setMultas(prev => prev.map(m => m.id === multaId ? { ...m, estado: 'RECHAZADA' } : m));
        if (selectedMulta && selectedMulta.id === multaId) {
          setSelectedMulta(prev => ({ ...prev, estado: 'RECHAZADA' }));
        }
      } catch (error) {
        console.error('Error al rechazar multa:', error);
        const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Error desconocido';
        alert('Error al rechazar la multa: ' + errMsg);
        await cargarMultas();
      }
    }
  };

  const handleAbrirCarpeta = async (multa) => {
    setSelectedMulta(multa);
    setShowCarpetaModal(true);
    setCarpetaData(null);

    const carpetaId = multa.evidencia?.carpeta?.id || multa.evidencia?.carpetaId;

    if (carpetaId) {
      try {
        setLoadingCarpeta(true);
        const res = await getCarpetaByIdRequest(carpetaId);
        const fetchedCarpeta = res.data?.data || res.data;
        setCarpetaData(fetchedCarpeta);
      } catch (err) {
        console.warn('No se pudo cargar la carpeta por ID, usando datos locales:', err);
        // Fallback usando los datos ya poblados en la multa
        setCarpetaData(multa.evidencia?.carpeta || null);
      } finally {
        setLoadingCarpeta(false);
      }
    } else if (multa.evidencia?.carpeta) {
      setCarpetaData(multa.evidencia.carpeta);
    }
  };

  const multasFiltradas = multas.filter(multa => {
    const coincideBusqueda = !busqueda ||
      multa.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      multa.motivoMulta?.toLowerCase().includes(busqueda.toLowerCase()) ||
      multa.metahumano?.alias?.toLowerCase().includes(busqueda.toLowerCase()) ||
      multa.metahumano?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      multa.evidencia?.carpeta?.metahumano?.alias?.toLowerCase().includes(busqueda.toLowerCase()) ||
      multa.evidencia?.carpeta?.metahumano?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      multa.evidencia?.carpeta?.metahumano?.dni?.toString().includes(busqueda) ||
      multa.burocrata?.nomBurocrata?.toLowerCase().includes(busqueda.toLowerCase()) ||
      multa.id?.toString().includes(busqueda);

    const coincideEstado = filtroEstado === 'todos' || multa.estado?.toUpperCase() === filtroEstado.toUpperCase();

    return coincideBusqueda && coincideEstado;
  });

  const totalMultas = multas.length;
  const multasPendientes = multas.filter(m => m.estado?.toUpperCase() === 'PENDIENTE').length;
  const multasAprobadas = multas.filter(m => m.estado?.toUpperCase() === 'APROBADA').length;
  const multasRechazadas = multas.filter(m => m.estado?.toUpperCase() === 'RECHAZADA').length;

  const getEstadoBadge = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'APROBADA':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'RECHAZADA':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
      case 'PAGADA':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border border-slate-600';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return '⏳';
      case 'APROBADA':
        return '✅';
      case 'RECHAZADA':
        return '❌';
      case 'PAGADA':
        return '💰';
      default:
        return '•';
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatearMonto = (multa) => {
    const monto = multa?.montoMulta || multa?.monto;
    if (!monto && monto !== 0) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(monto);
  };

  // Helper para metahumano
  const getMetahumanoInfo = (multa) => {
    return multa.evidencia?.carpeta?.metahumano || multa.metahumano || null;
  };

  return (
    <AdminLayout title="Gestionar Multas">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Minimalista */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>💰</span> Gestión de Multas
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Revisión, auditoría de expedientes y aprobación de infracciones por daños
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
              onClick={cargarMultas}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span>🔄</span> Refrescar
            </button>
          </div>
        </div>

        {/* Métricas Minimalistas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
            <p className="text-xs font-medium text-slate-400">Total Multas</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{totalMultas}</p>
          </div>
          <div 
            onClick={() => setFiltroEstado('PENDIENTE')}
            className={`bg-slate-900/60 border rounded-xl p-3.5 cursor-pointer transition-all ${
              filtroEstado === 'PENDIENTE' ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-medium text-amber-400 flex items-center justify-between">
              <span>Pendientes</span>
              <span>⏳</span>
            </p>
            <p className="text-2xl font-bold text-amber-300 mt-1">{multasPendientes}</p>
          </div>
          <div 
            onClick={() => setFiltroEstado('APROBADA')}
            className={`bg-slate-900/60 border rounded-xl p-3.5 cursor-pointer transition-all ${
              filtroEstado === 'APROBADA' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-medium text-emerald-400 flex items-center justify-between">
              <span>Aprobadas</span>
              <span>✅</span>
            </p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">{multasAprobadas}</p>
          </div>
          <div 
            onClick={() => setFiltroEstado('RECHAZADA')}
            className={`bg-slate-900/60 border rounded-xl p-3.5 cursor-pointer transition-all ${
              filtroEstado === 'RECHAZADA' ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-medium text-rose-400 flex items-center justify-between">
              <span>Rechazadas</span>
              <span>❌</span>
            </p>
            <p className="text-2xl font-bold text-rose-300 mt-1">{multasRechazadas}</p>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar por motivo, metahumano, DNI o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700/70 text-sm text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="flex gap-2.5 w-full md:w-auto">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3.5 py-2 bg-slate-800/80 border border-slate-700/70 text-xs font-semibold text-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="PENDIENTE">⏳ Solo Pendientes</option>
              <option value="todos">📋 Todas las Multas</option>
              <option value="APROBADA">✅ Aprobadas</option>
              <option value="RECHAZADA">❌ Rechazadas</option>
              <option value="PAGADA">💰 Pagadas</option>
            </select>
            <div className="flex items-center px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-slate-400">
              <span>Resultados: <strong className="text-slate-200 font-mono ml-1">{multasFiltradas.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Listado de Multas Minimalista */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-3"></div>
            <p className="text-slate-400 text-xs font-medium">Cargando multas...</p>
          </div>
        ) : multasFiltradas.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">
              {filtroEstado === 'PENDIENTE' ? 'No hay multas pendientes de revisión' : 'No se encontraron multas'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {filtroEstado === 'PENDIENTE' 
                ? 'Todas las infracciones han sido resueltas. Cambia el filtro a "Todas" para revisar el historial.'
                : 'Intenta ajustando el término de búsqueda o el estado seleccionado.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {multasFiltradas.map((multa) => {
              const meta = getMetahumanoInfo(multa);
              const evidencia = multa.evidencia;
              const tieneFoto = Boolean(evidencia?.imagen);

              return (
                <div 
                  key={multa.id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/90 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 shadow-sm group"
                >
                  {/* Top Bar: ID + Fecha + Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-300">#{multa.id}</span>
                        <span className="text-[11px] text-slate-500">•</span>
                        <span className="text-[11px] text-slate-400">
                          {formatearFecha(multa.fechaEmision || multa.createdAt)}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide flex items-center gap-1 ${getEstadoBadge(multa.estado)}`}>
                        <span>{getEstadoIcon(multa.estado)}</span>
                        <span>{multa.estado}</span>
                      </span>
                    </div>

                    {/* Metahumano row */}
                    <div className="flex items-start justify-between gap-3 mb-3 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800/60">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 font-medium">Metahumano Infractor</p>
                        <p className="text-sm font-bold text-slate-100 truncate">
                          {meta?.alias || meta?.nombre || 'Desconocido'}
                        </p>
                        {meta?.nombre && meta?.alias && (
                          <p className="text-xs text-slate-400 truncate">{meta.nombre}</p>
                        )}
                      </div>
                      {meta?.dni && (
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                          DNI: {meta.dni}
                        </span>
                      )}
                    </div>

                    {/* Monto & Motivo */}
                    <div className="mb-3">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Monto</span>
                        <span className="text-lg font-bold text-amber-300 font-mono">
                          {formatearMonto(multa)}
                        </span>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-lg">
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {multa.motivoMulta || multa.descripcion || 'Sin motivo detallado'}
                        </p>
                      </div>
                    </div>

                    {/* Metadata chips (Burócrata / Evidencia / Carpeta) */}
                    <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                      {multa.burocrata && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                          <span>👨‍💼</span>
                          <span className="truncate">Emitida por: <strong className="text-slate-300">{multa.burocrata.nomBurocrata || multa.burocrata.nombre}</strong></span>
                        </div>
                      )}
                      {evidencia?.descripcion && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                          <span>🔍</span>
                          <span className="truncate">Evidencia: <strong className="text-slate-300">{evidencia.descripcion}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    {/* Botón para Abrir Expediente / Carpeta */}
                    <button
                      type="button"
                      onClick={() => handleAbrirCarpeta(multa)}
                      className="w-full py-2 px-3 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/40 hover:border-cyan-600/60 text-cyan-300 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>📂</span>
                      <span>Ver Expediente & Evidencias</span>
                      {tieneFoto && (
                        <span className="text-[10px] bg-cyan-800/60 text-cyan-100 px-1.5 py-0.2 rounded font-mono">
                          📷 Foto
                        </span>
                      )}
                    </button>

                    {/* Botones de acción si es PENDIENTE */}
                    {multa.estado?.toUpperCase() === 'PENDIENTE' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleRechazarMulta(multa.id)}
                          className="py-1.5 px-3 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>✕</span>
                          <span>Rechazar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAprobarMulta(multa.id)}
                          className="py-1.5 px-3 bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
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

        {/* Modal de Carpeta & Evidencias del Metahumano */}
        {showCarpetaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl">
                    📁
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Expediente del Caso</span>
                      {carpetaData?.id && <span className="font-mono text-cyan-400 text-sm">#{carpetaData.id}</span>}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Revisión detallada de evidencias, pruebas fotográficas y multas vinculadas
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCarpetaModal(false);
                    setSelectedMulta(null);
                    setCarpetaData(null);
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                
                {loadingCarpeta ? (
                  <div className="py-16 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-xs text-slate-400">Cargando expediente y evidencias completas...</p>
                  </div>
                ) : (
                  <>
                    {/* Ficha Metahumano + Ficha Carpeta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Metahumano Info */}
                      {(() => {
                        const meta = carpetaData?.metahumano || selectedMulta?.evidencia?.carpeta?.metahumano || selectedMulta?.metahumano;
                        return (
                          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-xs uppercase tracking-wider font-bold text-cyan-400 flex items-center gap-1.5">
                                <span>🦸</span> Perfil del Metahumano
                              </span>
                              {meta?.tipoMeta && (
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                  meta.tipoMeta === 'villano' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                                }`}>
                                  {meta.tipoMeta}
                                </span>
                              )}
                            </div>
                            {meta ? (
                              <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Alias:</span>
                                  <span className="font-bold text-slate-100">{meta.alias || 'Sin alias'}</span>
                                </div>
                                {meta.nombre && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Nombre Real:</span>
                                    <span className="text-slate-200">{meta.nombre}</span>
                                  </div>
                                )}
                                {meta.dni && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">DNI:</span>
                                    <span className="font-mono text-slate-200">{meta.dni}</span>
                                  </div>
                                )}
                                {meta.edad && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Edad:</span>
                                    <span className="text-slate-200">{meta.edad} años</span>
                                  </div>
                                )}
                                {meta.recompensa != null && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Recompensa actual:</span>
                                    <span className="font-mono text-amber-300 font-bold">${meta.recompensa}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic">No hay datos asociados del metahumano</p>
                            )}
                          </div>
                        );
                      })()}

                      {/* Carpeta Header Info */}
                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs uppercase tracking-wider font-bold text-purple-400 flex items-center gap-1.5">
                            <span>📁</span> Datos de la Carpeta
                          </span>
                          {carpetaData?.estado && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {carpetaData.estado}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tipo de Trámite/Caso:</span>
                            <span className="font-semibold text-slate-200">{carpetaData?.tipo || selectedMulta?.evidencia?.carpeta?.tipo || 'General'}</span>
                          </div>
                          {carpetaData?.burocrata && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Burócrata a cargo:</span>
                              <span className="text-slate-200">{carpetaData.burocrata.nomBurocrata || carpetaData.burocrata.nombre}</span>
                            </div>
                          )}
                          {carpetaData?.createdAt && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Apertura:</span>
                              <span className="text-slate-200">{formatearFecha(carpetaData.createdAt)}</span>
                            </div>
                          )}
                          {carpetaData?.descripcion && (
                            <div className="pt-1">
                              <span className="text-slate-400 block mb-0.5">Descripción:</span>
                              <p className="text-slate-300 text-xs bg-slate-950/40 p-2 rounded border border-slate-800/80 line-clamp-3">
                                {carpetaData.descripcion}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sección de Evidencias y Fotos */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          <span>🔍</span> Evidencias y Pruebas Registradas
                        </h4>
                        <span className="text-xs text-slate-400">
                          {carpetaData?.evidencias?.length ? `${carpetaData.evidencias.length} evidencias adjuntas` : '1 evidencia'}
                        </span>
                      </div>

                      {/* Lista de Evidencias */}
                      {(() => {
                        const evidenciasList = carpetaData?.evidencias && carpetaData.evidencias.length > 0
                          ? carpetaData.evidencias
                          : (selectedMulta?.evidencia ? [selectedMulta.evidencia] : []);

                        if (evidenciasList.length === 0) {
                          return (
                            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                              No hay evidencias adjuntas a este expediente.
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 gap-4">
                            {evidenciasList.map((ev, idx) => {
                              const esLaMultaSeleccionada = selectedMulta?.evidencia?.id === ev.id;

                              return (
                                <div 
                                  key={ev.id || idx}
                                  className={`bg-slate-900/90 border rounded-xl p-4 transition-all ${
                                    esLaMultaSeleccionada ? 'border-cyan-500/40 bg-slate-900' : 'border-slate-800'
                                  }`}
                                >
                                  {/* Encabezado Evidencia */}
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 mb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs font-bold text-cyan-400">Evidencia #{ev.id || idx + 1}</span>
                                      {esLaMultaSeleccionada && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                                          Multa Actual
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-slate-400">
                                      📅 {formatearFecha(ev.fechaRecoleccion || ev.createdAt)}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                    
                                    {/* Info y Descripción */}
                                    <div className={`space-y-3 ${ev.imagen ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                                      <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Descripción del Hecho</p>
                                        <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                                          {ev.descripcion || 'Sin descripción'}
                                        </p>
                                      </div>

                                      {/* Coordenadas */}
                                      {ev.latitud && ev.longitud && (
                                        <div className="flex items-center gap-2 text-xs text-amber-300/90 bg-amber-500/5 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                                          <span>📍</span>
                                          <span>Ubicación: Lat {Number(ev.latitud).toFixed(4)}, Lng {Number(ev.longitud).toFixed(4)}</span>
                                        </div>
                                      )}

                                      {/* Multas asociadas a esta evidencia */}
                                      {ev.multas && ev.multas.length > 0 && (
                                        <div>
                                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Multas Asociadas ({ev.multas.length})
                                          </p>
                                          <div className="space-y-1.5">
                                            {ev.multas.map((m) => (
                                              <div 
                                                key={m.id}
                                                className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-slate-800 text-xs"
                                              >
                                                <div className="truncate mr-2">
                                                  <span className="font-bold text-slate-200">{m.motivoMulta || m.descripcion}</span>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getEstadoBadge(m.estado)}`}>
                                                    {m.estado}
                                                  </span>
                                                  <span className="font-mono font-bold text-amber-300">
                                                    ${m.montoMulta || m.monto}
                                                  </span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Fotografía / Adjunto */}
                                    {ev.imagen && (
                                      <div className="lg:col-span-5 flex flex-col justify-center">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                          📷 Fotografía de Evidencia
                                        </p>
                                        <div className="relative group rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950/60">
                                          <img 
                                            src={ev.imagen} 
                                            alt="Prueba de evidencia" 
                                            className="w-full h-44 object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                          />
                                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => setPreviewImage(ev.imagen)}
                                              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5"
                                            >
                                              <span>🔍</span>
                                              <span>Ampliar</span>
                                            </button>
                                          </div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1 text-center">
                                          Haz clic en Ampliar para ver la foto en tamaño completo
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-xs text-slate-400">
                  {selectedMulta && (
                    <span>Multa actual: <strong className="text-slate-200">#{selectedMulta.id}</strong> ({formatearMonto(selectedMulta)})</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  {selectedMulta?.estado?.toUpperCase() === 'PENDIENTE' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRechazarMulta(selectedMulta.id)}
                        className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        ✕ Rechazar Multa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAprobarMulta(selectedMulta.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg cursor-pointer"
                      >
                        ✓ Aprobar Multa
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCarpetaModal(false);
                      setSelectedMulta(null);
                      setCarpetaData(null);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

            </div>
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

export default GestionarMultas;
