import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { obtenerTodosLosUsuariosCombinados, eliminarUsuario } from '../../api/usuarios';

export default function GestionarBurocratas() {
  const [burocratas, setBurocratas] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar burócratas del backend
  const cargarBurocratas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando burócratas desde endpoints disponibles...');
      
      const response = await obtenerTodosLosUsuariosCombinados();
      console.log('Usuarios obtenidos:', response.data);
      
      const usuariosData = response.data || [];
      
      // solo burócratas
      const burocratazData = usuariosData.filter(usuario => usuario.rol === 'BUROCRATA');
      
      if (burocratazData.length === 0) {
        setError('No se encontraron burócratas en el sistema.');
      } else {
        setBurocratas(burocratazData);
        console.log(`🎉 Se cargaron ${burocratazData.length} burócratas exitosamente`);
      }
      
    } catch (error) {
      console.error('❌ Error al cargar burócratas:', error);
      
      let mensajeError = 'Error al cargar los burócratas.';
      if (error.code === 'ECONNREFUSED') {
        mensajeError += ' El backend no está disponible en http://localhost:3000';
      } else if (error.response?.status === 401) {
        mensajeError += ' No autorizado. Inicia sesión nuevamente.';
      } else if (error.response?.status === 500) {
        mensajeError += ' Error del servidor.';
      } else {
        mensajeError += ` ${error.message || 'Error desconocido'}`;
      }
      
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBurocratas();
  }, []);

  // eliminación de burócrata
  const handleEliminar = async (id, tipo) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este burócrata?')) {
      return;
    }

    try {
      await eliminarUsuario(id, tipo);
      await cargarBurocratas();
      alert('Burócrata eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar burócrata:', error);
      alert('Error al eliminar el burócrata');
    }
  };



  // Funciones auxiliares
  const obtenerNombreCompleto = (burocrata) => {
    return burocrata.nomBurocrata || 
           burocrata._original?.nomBurocrata || 
           burocrata._original?.nombreBuro ||
           burocrata._original?.nombre ||
           burocrata.nomUsuario || 
           'Sin nombre';
  };

  // Filtrar burócratas filtro
  const burocratazFiltrados = burocratas.filter(burocrata => {
    const nombreCompleto = obtenerNombreCompleto(burocrata);
    
    const coincideBusqueda = !busqueda || 
      burocrata.nomUsuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
      nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideFiltro = true;

    return coincideBusqueda && coincideFiltro;
  });

  if (loading) {
    return (
      <AdminLayout title="Gestionar Burócratas">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-white">Cargando burócratas...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestionar Burócratas">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1e293b] rounded-lg p-4 border border-slate-600">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🏢</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-400">Total Burócratas</p>
                <p className="text-2xl font-bold text-white">{burocratas.length}</p>
              </div>
            </div>
          </div>
          
        </div>

        {/* Controles de filtrado */}
        <div className="bg-[#1e293b] rounded-lg p-6 border border-slate-600">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {/* Buscador */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar burócratas..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="bg-[#334155] text-white px-4 py-2 rounded-lg pl-10 w-full md:w-80 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>

              {/* Filtros */}
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="bg-[#334155] text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <option value="todos">Todos</option>
              </select>
            </div>

            {/* Botón de recarga */}
            <button
              onClick={cargarBurocratas}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <span className="mr-2">🔄</span>
              Actualizar
            </button>
          </div>
        </div>

        {/* Tabla de burócratas */}
        <div className="bg-[#1e293b] rounded-lg border border-slate-600 overflow-hidden">
          <div className="p-6 border-b border-slate-600">
            <h3 className="text-lg font-semibold text-white">
              Lista de Burócratas ({burocratazFiltrados.length})
            </h3>
          </div>

          {error ? (
            <div className="p-6">
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-400 mr-3">⚠️</span>
                  <div>
                    <h4 className="font-medium text-red-400">Error al cargar burócratas</h4>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : burocratazFiltrados.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-400">
                {busqueda || filtro !== 'todos' 
                  ? 'No se encontraron burócratas que coincidan con los filtros.' 
                  : 'No hay burócratas registrados en el sistema.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#334155]">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-medium">Usuario</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Nombre Completo</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {burocratazFiltrados.map((burocrata, index) => {
                    const nombreCompleto = obtenerNombreCompleto(burocrata);
                    
                    return (
                      <tr key={burocrata.id || index} className="border-t border-slate-600 hover:bg-[#334155] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">🏢</span>
                            </div>
                            <div className="ml-3">
                              <p className="text-white font-medium">{burocrata.nomUsuario}</p>
                              <p className="text-gray-400 text-sm">ID: {burocrata.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-white">{nombreCompleto}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEliminar(burocrata.idUsuario, 'burocrata')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
