import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { getAllMultasRequest, updateMultaRequest } from '../../../api/multas';

const GestionarMultas = () => {
  const navigate = useNavigate();
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    console.log('Iniciando carga de multas...');
    cargarMultas();
  }, []);

  const cargarMultas = async () => {
    try {
      setLoading(true);
      console.log('Obteniendo multas del backend...');
      
      const response = await getAllMultasRequest();
      const multasData = response.data?.data || response.data || [];
      
      // Ordenar multas
      const multasOrdenadas = multasData.sort((a, b) => {
        const fechaA = new Date(a.fechaEmision || a.createdAt || 0);
        const fechaB = new Date(b.fechaEmision || b.createdAt || 0);
        return fechaA - fechaB;
      });
      
      setMultas(multasOrdenadas);
      console.log('Multas cargadas y ordenadas:', multasOrdenadas);
      console.log('Total de multas:', multasOrdenadas.length);
      console.log('Pendientes:', multasOrdenadas.filter(m => m.estado === 'PENDIENTE').length);
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
        // Actualización instantánea local
        setMultas(prev => prev.map(m => m.id === multaId ? { ...m, estado: 'APROBADA' } : m));
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
        // Actualización instantánea local
        setMultas(prev => prev.map(m => m.id === multaId ? { ...m, estado: 'RECHAZADA' } : m));
      } catch (error) {
        console.error('Error al rechazar multa:', error);
        const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Error desconocido';
        alert('Error al rechazar la multa: ' + errMsg);
        await cargarMultas();
      }
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

  const getEstadoColor = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return 'bg-yellow-600 text-yellow-100';
      case 'APROBADA':
        return 'bg-green-600 text-green-100';
      case 'RECHAZADA':
        return 'bg-red-600 text-red-100';
      case 'PAGADA':
        return 'bg-blue-600 text-blue-100';
      default:
        return 'bg-gray-600 text-gray-100';
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
        return '❓';
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
    // El campo correcto es "montoMulta" según tu backend
    const monto = multa?.montoMulta || multa?.monto;
    
    if (!monto && monto !== 0) return 'N/A';
    
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(monto);
  };

  return (
    <AdminLayout title="Gestionar Multas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Gestión de Multas</h2>
            <p className="text-gray-400">Aprueba o rechaza multas de metahumanos</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/tramites')}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>←</span>
              Volver
            </button>
            <button
              onClick={cargarMultas}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>🔄</span>
              Refrescar
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Multas</p>
                <p className="text-3xl font-bold text-white mt-1">{totalMultas}</p>
              </div>
              <div className="text-4xl opacity-80">📋</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-white mt-1">{multasPendientes}</p>
              </div>
              <div className="text-4xl opacity-80">⏳</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Aprobadas</p>
                <p className="text-3xl font-bold text-white mt-1">{multasAprobadas}</p>
              </div>
              <div className="text-4xl opacity-80">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Rechazadas</p>
                <p className="text-3xl font-bold text-white mt-1">{multasRechazadas}</p>
              </div>
              <div className="text-4xl opacity-80">❌</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-600">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar por motivo, metahumano, DNI, burócrata o ID..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#334155] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <span className="absolute left-3 top-3.5 text-gray-400 text-xl">🔍</span>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="flex-1 md:flex-none px-4 py-3 bg-[#334155] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="todos">Todos los Estados</option>
                <option value="PENDIENTE">⏳ Pendientes</option>
                <option value="APROBADA">✅ Aprobadas</option>
                <option value="RECHAZADA">❌ Rechazadas</option>
                <option value="PAGADA">💰 Pagadas</option>
              </select>

              <div className="flex items-center gap-2 px-4 py-3 bg-[#334155] border border-slate-600 rounded-lg">
                <span className="text-gray-400 text-sm">Resultados:</span>
                <span className="text-white font-bold">{multasFiltradas.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Multas */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-600 overflow-hidden">
          <div className="p-6 border-b border-slate-600 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <span>💰</span>
              Multas ({multasFiltradas.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>📅</span>
              <span>Ordenadas por fecha (más antigua → más nueva)</span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400 text-lg">Cargando multas...</p>
            </div>
          ) : multasFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl block mb-4">💰</span>
              <h3 className="text-xl font-medium text-white mb-2">
                {busqueda || filtroEstado !== 'todos'
                  ? 'No se encontraron multas' 
                  : 'No hay multas registradas'}
              </h3>
              <p className="text-gray-400 mb-4">
                {busqueda || filtroEstado !== 'todos'
                  ? 'Intenta con otros filtros de búsqueda'
                  : 'Las multas aparecerán aquí cuando se generen'}
              </p>
              {multas.length > 0 && (
                <div className="mt-4 p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg inline-block">
                  <p className="text-blue-200 text-sm">
                    ℹ️ Hay {multas.length} multas totales, pero no coinciden con los filtros actuales
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {multasFiltradas.map((multa) => (
                  <div 
                    key={multa.id} 
                    className="bg-[#334155] rounded-xl border border-slate-600 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💰</span>
                          <div>
                            <h4 className="font-bold text-white">Multa #{multa.id}</h4>
                            <p className="text-gray-300 text-xs">
                              {formatearFecha(multa.fechaEmision || multa.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getEstadoColor(multa.estado)}`}>
                          {getEstadoIcon(multa.estado)} {multa.estado}
                        </span>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-4 space-y-3">
                      {/* METAHUMANO */}
                      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-2 border-blue-600/50 rounded-lg p-3">
                        <p className="text-blue-200 text-xs font-bold mb-2 flex items-center gap-1">
                          <span>🦸</span>
                          METAHUMANO INFRACTOR
                        </p>
                        {multa.evidencia?.carpeta?.metahumano ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🦸</span>
                              <div className="flex-1">
                                <p className="text-white font-bold">
                                  {multa.evidencia.carpeta.metahumano.alias || 'Sin alias'}
                                </p>
                                <p className="text-gray-300 text-sm">
                                  {multa.evidencia.carpeta.metahumano.nombre || 'Sin nombre'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/50 rounded p-2">
                              {multa.evidencia.carpeta.metahumano.dni && (
                                <div>
                                  <p className="text-gray-400">DNI:</p>
                                  <p className="text-white font-medium">{multa.evidencia.carpeta.metahumano.dni}</p>
                                </div>
                              )}
                              {multa.evidencia.carpeta.metahumano.edad && (
                                <div>
                                  <p className="text-gray-400">Edad:</p>
                                  <p className="text-white font-medium">{multa.evidencia.carpeta.metahumano.edad} años</p>
                                </div>
                              )}
                              {multa.evidencia.carpeta.metahumano.nacionalidad && (
                                <div className="col-span-2">
                                  <p className="text-gray-400">Nacionalidad:</p>
                                  <p className="text-white font-medium">{multa.evidencia.carpeta.metahumano.nacionalidad}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-900/30 border border-yellow-600/50 rounded p-3">
                            <p className="text-yellow-200 text-sm">
                              ⚠️ No se encontró información del metahumano
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Monto */}
                      <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-600/30 rounded-lg p-3">
                        <p className="text-amber-200 text-xs font-medium mb-1">MONTO</p>
                        <p className="text-2xl font-bold text-amber-100">
                          {formatearMonto(multa)}
                        </p>
                      </div>

                      {/* Motivo/Descripción */}
                      <div>
                        <p className="text-gray-400 text-xs mb-1 font-medium">MOTIVO DE LA MULTA</p>
                        <p className="text-gray-200 text-sm">
                          {multa.motivoMulta || multa.descripcion || 'Sin descripción'}
                        </p>
                      </div>

                      {/* Info de la carpeta */}
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-gray-400 text-xs font-medium mb-1">CARPETA ASOCIADA</p>
                        {multa.evidencia?.carpeta ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-purple-400">📁</span>
                              <span className="text-white text-sm">
                                #{multa.evidencia.carpeta.id} - {multa.evidencia.carpeta.descripcion || 'Sin descripción'}
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs">
                              Estado: <span className="text-gray-300 capitalize">{multa.evidencia.carpeta.estado}</span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-xs">No disponible</p>
                        )}
                      </div>

                      {/* Burócrata y Evidencia */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Burócrata */}
                        {multa.burocrata && (
                          <div className="bg-slate-800 rounded-lg p-2">
                            <p className="text-gray-400 text-[10px] font-semibold mb-1">EMITIDA POR</p>
                            <div className="flex items-center gap-1">
                              <span className="text-sm">👨‍💼</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium truncate">
                                  {multa.burocrata.nomBurocrata || `ID: ${multa.burociataId}`}
                                </p>
                                <p className="text-gray-400 text-[10px] truncate">
                                  {multa.burocrata.cargo || 'Burócrata'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Evidencia */}
                        {multa.evidencia && (
                          <div className="bg-slate-800 rounded-lg p-2">
                            <p className="text-gray-400 text-[10px] font-semibold mb-1">EVIDENCIA</p>
                            <div className="flex items-center gap-1">
                              <span className="text-sm">🔍</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs truncate">
                                  {multa.evidencia.descripcion || 'Sin descripción'}
                                </p>
                                <p className="text-gray-400 text-[10px]">
                                  {formatearFecha(multa.evidencia.fechaRecoleccion)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Fechas */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {multa.fechaLimite && (
                          <div>
                            <p className="text-gray-400 font-medium">Fecha Límite:</p>
                            <p className="text-white">{formatearFecha(multa.fechaLimite)}</p>
                          </div>
                        )}
                        {multa.fechaPago && (
                          <div>
                            <p className="text-gray-400 font-medium">Fecha Pago:</p>
                            <p className="text-white">{formatearFecha(multa.fechaPago)}</p>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      {multa.estado?.toUpperCase() === 'PENDIENTE' && (
                        <div className="flex gap-2 pt-3">
                          <button
                            onClick={() => handleAprobarMulta(multa.id)}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all transform hover:scale-105 text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <span>✅</span>
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleRechazarMulta(multa.id)}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all transform hover:scale-105 text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <span>❌</span>
                            Rechazar
                          </button>
                        </div>
                      )}

                      {/* Estado procesado */}
                      {multa.estado?.toUpperCase() !== 'PENDIENTE' && (
                        <div className={`p-3 rounded-lg border ${
                          multa.estado?.toUpperCase() === 'APROBADA' || multa.estado?.toUpperCase() === 'PAGADA'
                            ? 'bg-green-900/30 border-green-600/50 text-green-200' 
                            : 'bg-red-900/30 border-red-600/50 text-red-200'
                        }`}>
                          <p className="text-sm font-medium text-center">
                            {multa.estado?.toUpperCase() === 'APROBADA' && '✅ Multa aprobada'}
                            {multa.estado?.toUpperCase() === 'PAGADA' && '💰 Multa pagada'}
                            {multa.estado?.toUpperCase() === 'RECHAZADA' && '❌ Multa rechazada'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default GestionarMultas;
