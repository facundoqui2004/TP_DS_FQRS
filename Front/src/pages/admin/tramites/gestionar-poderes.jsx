import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { getPoderes, createPoder, updatePoder, deletePoder } from '../../../api/poderes';

const GestionarPoderes = () => {
  const navigate = useNavigate();
  const [poderes, setPoderes] = useState([]);
  const [metapoderes, setMetapoderes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPoder, setSelectedPoder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPoderes, setLoadingPoderes] = useState(true);
  const [vistaActual, setVistaActual] = useState('solicitudes');
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [formData, setFormData] = useState({
    nomPoder: '',
    descPoder: '',
    categoria: '',
    debilidad: '',
    descDebilidad: '',
    costoMulta: 0
  });

  const categorias = [
    { value: 'Físico', label: 'Físico', icon: '💪', color: 'from-green-500 to-emerald-600' },
    { value: 'Mental', label: 'Mental', icon: '🧠', color: 'from-blue-500 to-cyan-600' },
    { value: 'Elemental', label: 'Elemental', icon: '🔥', color: 'from-orange-500 to-red-600' },
    { value: 'Tecnológico', label: 'Tecnológico', icon: '🤖', color: 'from-gray-500 to-slate-600' },
    { value: 'Mágico', label: 'Mágico', icon: '✨', color: 'from-purple-500 to-pink-600' },
    { value: 'Psíquico', label: 'Psíquico', icon: '🔮', color: 'from-violet-500 to-purple-600' },
    { value: 'Temporal', label: 'Temporal', icon: '⏰', color: 'from-indigo-500 to-blue-600' },
    { value: 'Espacial', label: 'Espacial', icon: '🌌', color: 'from-pink-500 to-rose-600' },
    { value: 'Otro', label: 'Otro', icon: '⚡', color: 'from-yellow-500 to-amber-600' }
  ];

  useEffect(() => {
    console.log('Iniciando carga de datos del panel de poderes...');
    cargarPoderes();
    cargarMetapoderes();
  }, []);

  const cargarPoderes = async () => {
    try {
      setLoadingPoderes(true);
      const response = await getPoderes();
      setPoderes(response.data || response || []);
      console.log('Poderes cargados:', response.data || response);
    } catch (error) {
      console.error('Error al cargar poderes:', error);
    } finally {
      setLoadingPoderes(false);
    }
  };

  const cargarMetapoderes = async () => {
    try {
      console.log('Iniciando carga de metapoderes...');
      const response = await fetch('http://localhost:3000/api/metapoderes', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener metapoderes');
      }
      
      const data = await response.json();
      const metapoderesData = data.data || data || [];
      
      if (metapoderesData.length > 0) {
        console.log('Estructura del primer metapoder:', metapoderesData[0]);
        console.log('Claves disponibles:', Object.keys(metapoderesData[0]));
        
        if (metapoderesData[0].poder) {
          console.log('Los metapoderes YA incluyen la información del poder');
        } else {
          console.log('Los metapoderes NO incluyen información del poder, solo tienen poderId:', metapoderesData[0].poderId);
        }
      }
      
      console.log('Pendientes:', metapoderesData.filter(mp => mp.estado === 'SOLICITADO').length);
      
      setMetapoderes(metapoderesData);
    } catch (error) {
      console.error('Error al cargar metapoderes:', error);
      setMetapoderes([]);
    }
  };

  const getCategoriaInfo = (categoriaValue) => {
    return categorias.find(c => c.value === categoriaValue) || categorias[categorias.length - 1];
  };

  const handleAprobarPoder = async (metapoderId) => {
    if (window.confirm('¿Estás seguro de que quieres aprobar este poder?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/metapoderes/${metapoderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            estado: 'APROBADO'
          }),
        });

        if (!response.ok) {
          throw new Error('Error al aprobar el poder');
        }

        alert('Poder aprobado exitosamente');
        await cargarMetapoderes();
      } catch (error) {
        console.error('Error al aprobar poder:', error);
        alert('Error al aprobar el poder: ' + error.message);
      }
    }
  };

  const handleRechazarPoder = async (metapoderId) => {
    if (window.confirm('¿Estás seguro de que quieres rechazar este poder?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/metapoderes/${metapoderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            estado: 'RECHAZADO'
          }),
        });

        if (!response.ok) {
          throw new Error('Error al rechazar el poder');
        }

        alert('Poder rechazado exitosamente');
        await cargarMetapoderes();
      } catch (error) {
        console.error('Error al rechazar poder:', error);
        alert('Error al rechazar el poder: ' + error.message);
      }
    }
  };

  const metapoderesFiltrados = metapoderes.filter(metapoder => {
    // Obtener el poder
    const poder = metapoder.poder || poderes.find(p => p.id === metapoder.poderId);
    
    if (!poder && metapoder.poderId) {
      console.warn(`No se encontró poder con ID ${metapoder.poderId} para metapoder ${metapoder.id}`);
      console.log('Poderes disponibles:', poderes.map(p => ({ id: p.id, nombre: p.nomPoder })));
    }
    
    if (!metapoder.poderId) {
      console.error(`Metapoder ${metapoder.id} NO tiene poderId definido:`, metapoder);
    }
    
    const coincideBusqueda = !busqueda || 
      poder?.nomPoder?.toLowerCase().includes(busqueda.toLowerCase()) ||
      metapoder.metahumano?.alias?.toLowerCase().includes(busqueda.toLowerCase()) ||
      metapoder.estado?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCategoria = filtroCategoria === 'todos' || poder?.categoria === filtroCategoria;
    const coincideEstado = filtroEstado === 'todos' || metapoder.estado === filtroEstado;

    return coincideBusqueda && coincideCategoria && coincideEstado;
  });

  // Log para debugging
  console.log('Metapoderes totales:', metapoderes.length);
  console.log('Metapoderes filtrados:', metapoderesFiltrados.length);
  console.log('Poderes disponibles:', poderes.length);
  
  if (metapoderes.length > 0) {
    console.log('Primer metapoder completo:', metapoderes[0]);
  }

  const totalSolicitudes = metapoderes.length;
  const solicitudesPendientes = metapoderes.filter(mp => mp.estado === 'SOLICITADO').length;
  const solicitudesAprobadas = metapoderes.filter(mp => mp.estado === 'APROBADO').length;
  const solicitudesRechazadas = metapoderes.filter(mp => mp.estado === 'RECHAZADO').length;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'SOLICITADO':
        return 'bg-yellow-600 text-yellow-100';
      case 'APROBADO':
        return 'bg-green-600 text-green-100';
      case 'RECHAZADO':
        return 'bg-red-600 text-red-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'SOLICITADO':
        return '⏳';
      case 'APROBADO':
        return '✅';
      case 'RECHAZADO':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <AdminLayout title="Gestionar Poderes">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Gestión de Poderes Metahumanos</h2>
            <p className="text-gray-400">Aprueba o rechaza solicitudes de poderes</p>
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
              onClick={cargarMetapoderes}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>🔄</span>
              Refrescar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Solicitudes</p>
                <p className="text-3xl font-bold text-white mt-1">{totalSolicitudes}</p>
              </div>
              <div className="text-4xl opacity-80">📋</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-white mt-1">{solicitudesPendientes}</p>
              </div>
              <div className="text-4xl opacity-80">⏳</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Aprobadas</p>
                <p className="text-3xl font-bold text-white mt-1">{solicitudesAprobadas}</p>
              </div>
              <div className="text-4xl opacity-80">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Rechazadas</p>
                <p className="text-3xl font-bold text-white mt-1">{solicitudesRechazadas}</p>
              </div>
              <div className="text-4xl opacity-80">❌</div>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-600">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar por poder, metahumano o estado..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#334155] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <span className="absolute left-3 top-3.5 text-gray-400 text-xl">🔍</span>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="flex-1 md:flex-none px-4 py-3 bg-[#334155] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="todos">Todas las Categorías</option>
                {categorias.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="flex-1 md:flex-none px-4 py-3 bg-[#334155] border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="todos">Todos los Estados</option>
                <option value="SOLICITADO">⏳ Pendientes</option>
                <option value="APROBADO">✅ Aprobados</option>
                <option value="RECHAZADO">❌ Rechazados</option>
              </select>

              <div className="flex items-center gap-2 px-4 py-3 bg-[#334155] border border-slate-600 rounded-lg">
                <span className="text-gray-400 text-sm">Resultados:</span>
                <span className="text-white font-bold">{metapoderesFiltrados.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-600 overflow-hidden">
          <div className="p-6 border-b border-slate-600 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <span>📋</span>
              Solicitudes de Poderes ({metapoderesFiltrados.length})
            </h3>
          </div>

          {loadingPoderes ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400 text-lg">Cargando solicitudes...</p>
            </div>
          ) : metapoderesFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl block mb-4">📋</span>
              <h3 className="text-xl font-medium text-white mb-2">
                {busqueda || filtroCategoria !== 'todos' || filtroEstado !== 'todos'
                  ? 'No se encontraron solicitudes' 
                  : 'No hay solicitudes de poderes'}
              </h3>
              <p className="text-gray-400 mb-4">
                {busqueda || filtroCategoria !== 'todos' || filtroEstado !== 'todos'
                  ? 'Intenta con otros filtros de búsqueda'
                  : 'Las solicitudes aparecerán aquí cuando los metahumanos soliciten poderes'}
              </p>
              {metapoderes.length > 0 && (
                <div className="mt-4 p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg inline-block">
                  <p className="text-blue-200 text-sm">
                    ℹ️ Hay {metapoderes.length} solicitudes totales, pero no coinciden con los filtros actuales
                  </p>
                </div>
              )}
              <div className="mt-6 text-xs text-gray-500">
                <p>Debug: {metapoderes.length} metapoderes cargados | {poderes.length} poderes disponibles</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {metapoderesFiltrados.map((metapoder) => {
                  let poder = null;
                  
                  // metapoder información del poder
                  if (metapoder.poder) {
                    poder = metapoder.poder;
                    console.log('✅ Usando poder incluido en metapoder:', poder);
                  } 
                  // si no, buscar en el array de poderes con poderId
                  else if (metapoder.poderId) {
                    poder = poderes.find(p => p.id === metapoder.poderId);
                    if (poder) {
                      console.log('Encontrado poder en array local:', poder);
                    } else {
                      console.warn(`No se encontró poder con ID ${metapoder.poderId}`);
                    }
                  }
                  
                  const categoriaInfo = poder ? getCategoriaInfo(poder.categoria) : { icon: '❓', color: 'from-gray-500 to-slate-600' };
                  
                  return (
                    <div 
                      key={metapoder.id} 
                      className="bg-[#334155] rounded-xl border border-slate-600 overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-white text-lg">
                              {metapoder.metahumano?.alias || `Metahumano ID: ${metapoder.metahumanoId}`}
                            </h4>
                            <p className="text-gray-300 text-sm">
                              Solicitud #{metapoder.id}
                              {metapoder.poderId && ` • Poder ID: ${metapoder.poderId}`}
                              {poder && ` • ${poder.nomPoder}`}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getEstadoColor(metapoder.estado)}`}>
                            {getEstadoIcon(metapoder.estado)} {metapoder.estado}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                          <span className="text-3xl">{categoriaInfo.icon}</span>
                          <div className="flex-1">
                            <h5 className="font-bold text-white">
                              {poder ? poder.nomPoder : (metapoder.poderId ? `Poder ID: ${metapoder.poderId}` : 'Poder no identificado')}
                            </h5>
                            <span className="text-gray-400 text-sm">
                              {poder ? poder.categoria : 'Categoría desconocida'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400 font-medium">Dominio:</p>
                            <p className="text-white">{metapoder.dominio || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Control:</p>
                            <p className="text-white">{metapoder.nivelControl || 0}%</p>
                          </div>
                        </div>

                        {poder && (
                          <div>
                            <p className="text-gray-400 text-xs mb-1 font-medium">DESCRIPCIÓN DEL PODER</p>
                            <p className="text-gray-300 text-sm">{poder.descPoder}</p>
                          </div>
                        )}

                        {!poder && (
                          <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3">
                            <p className="text-yellow-200 text-xs font-medium mb-1">
                              ⚠️ Información del poder no disponible
                            </p>
                            <p className="text-yellow-100 text-xs">
                              {metapoder.poderId 
                                ? `El poder con ID ${metapoder.poderId} no se encuentra en el catálogo` 
                                : 'Esta solicitud no tiene un poderId asignado'}
                              {' • '}Poderes cargados: {poderes.length}
                            </p>
                          </div>
                        )}

                        {metapoder.fechaAdquisicion && (
                          <div>
                            <p className="text-gray-400 text-xs mb-1 font-medium">FECHA DE SOLICITUD</p>
                            <p className="text-gray-300 text-sm">
                              {new Date(metapoder.fechaAdquisicion).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        )}

                        {metapoder.estado === 'SOLICITADO' && (
                          <div className="flex gap-2 pt-3">
                            <button
                              onClick={() => handleAprobarPoder(metapoder.id)}
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all transform hover:scale-105 text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <span>✅</span>
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleRechazarPoder(metapoder.id)}
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all transform hover:scale-105 text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <span>❌</span>
                              Rechazar
                            </button>
                          </div>
                        )}

                        {metapoder.estado !== 'SOLICITADO' && (
                          <div className={`p-3 rounded-lg border ${
                            metapoder.estado === 'APROBADO' 
                              ? 'bg-green-900/30 border-green-600/50 text-green-200' 
                              : 'bg-red-900/30 border-red-600/50 text-red-200'
                          }`}>
                            <p className="text-sm font-medium text-center">
                              {metapoder.estado === 'APROBADO' 
                                ? '✅ Este poder ha sido aprobado' 
                                : '❌ Esta solicitud fue rechazada'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default GestionarPoderes;