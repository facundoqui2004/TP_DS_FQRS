import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { obtenerTodosLosUsuariosCombinados, eliminarUsuario } from '../../api/usuarios';

export default function GestionarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuarios del backend
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Cargando usuarios desde endpoints disponibles...');

      // Usar directamente la función combinada que sabemos que funciona
      const response = await obtenerTodosLosUsuariosCombinados();
      console.log('✅ Usuarios obtenidos:', response.data);

      const usuariosData = response.data || [];

      if (usuariosData.length === 0) {
        setError('No se encontraron usuarios en el sistema. Los endpoints están disponibles pero no hay datos.');
      } else {
        setUsuarios(usuariosData);

        // Mostrar información de qué tipos de usuarios se encontraron
        const metahumanos = usuariosData.filter(u => u.rol === 'METAHUMANO').length;
        const burocratas = usuariosData.filter(u => u.rol === 'BUROCRATA').length;

        console.log(`🎉 Se cargaron ${usuariosData.length} usuarios exitosamente:`);
        console.log(`   - Metahumanos: ${metahumanos}`);
        console.log(`   - Burócratas: ${burocratas}`);

        if (burocratas === 0) {
          console.log('ℹ️ No se encontraron burócratas en la BD. El endpoint /api/Burocratas está vacío.');
        }
      }

    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);

      let mensajeError = 'Error al cargar los usuarios.';
      if (error.code === 'ECONNREFUSED') {
        mensajeError += ' El backend no está disponible en http://localhost:3000';
      } else if (error.response?.status === 401) {
        mensajeError += ' No tienes autorización para ver esta información.';
      } else if (error.response?.status === 403) {
        mensajeError += ' No tienes permisos suficientes.';
      } else if (error.response?.status === 404) {
        mensajeError += ' Los endpoints no están disponibles.';
      } else if (error.response?.data?.message) {
        mensajeError += ` ${error.response.data.message}`;
      }

      setError(mensajeError);

      // Sin datos de ejemplo - mostrar error real
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      // Intentar parsear la fecha
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        return 'Fecha inválida';
      }
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = usuario.nomUsuario.toLowerCase().includes(busqueda.toLowerCase());

    if (filtro === 'todos') return coincideBusqueda;
    return coincideBusqueda && usuario.rol === filtro;
  });

  const getRolColor = (rol) => {
    switch (rol) {
      case 'METAHUMANO': return 'bg-[#06b6d4] text-white';
      case 'BUROCRATA': return 'bg-[#0ea5e9] text-white';
      case 'admin': return 'bg-[#0891b2] text-white';
      default: return 'bg-gray-500 text-white';
    }
  };



  const handleEliminarUsuario = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        // Eliminar en el backend
        await eliminarUsuario(id);

        // Actualizar localmente si la petición fue exitosa
        setUsuarios(usuarios.filter(usuario => usuario.idUsuario !== id));

        console.log(`Usuario ${id} eliminado exitosamente`);
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar el usuario. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <AdminLayout title="Gestionar Usuarios">
      {/* Mensaje de error si hay problemas de conexión */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">!</span>
            </div>
            <div>
              <p className="text-red-200 font-medium">Error de conexión</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={cargarUsuarios}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-[#1e293b] rounded-lg p-6 shadow-lg border border-slate-600 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="bg-[#334155] border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los roles</option>
              <option value="METAHUMANO">Metahumanos</option>
              <option value="BUROCRATA">Burócratas</option>
              <option value="admin">Administradores</option>
            </select>

            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-[#334155] border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>

          <div className="text-white flex items-center gap-4">
            <button
              onClick={cargarUsuarios}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Cargando...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Refrescar
                </>
              )}
            </button>
            <div>
              <span className="text-gray-400">Total: </span>
              <span className="font-bold">{usuariosFiltrados.length}</span> usuarios
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-[#1e293b] rounded-lg shadow-lg border border-slate-600 overflow-hidden">
        <div className="p-6 border-b border-slate-600">
          <h3 className="text-lg font-semibold text-white">Lista de Usuarios</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#334155]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Usuario (ID)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600">
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-[#334155] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {usuario.nomUsuario.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">{usuario.nomUsuario}</div>
                          <div className="text-sm text-gray-400">ID Usuario: {usuario.idUsuario}</div>
                          <div className="text-xs text-gray-500">ID Rol: {usuario.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRolColor(usuario.rol)}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatearFecha(usuario.fechaCreacion || usuario.createdAt || usuario.fecha_registro)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEliminarUsuario(usuario.idUsuario)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {usuariosFiltrados.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <div className="mb-4">
                  <span className="text-4xl">👥</span>
                </div>
                <p className="text-lg font-medium mb-2">No se encontraron usuarios que coincidan con los filtros</p>
                {filtro === 'BUROCRATA' && usuarios.filter(u => u.rol === 'BUROCRATA').length === 0 && (
                  <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-600/30">
                    <p className="text-blue-300 text-sm">
                      <strong>Nota:</strong> No hay burócratas en la base de datos.
                      El endpoint <code>/api/Burocratas</code> está disponible pero no contiene datos.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-[#1e293b] rounded-lg p-6 shadow-lg border border-slate-600">
          <h4 className="text-lg font-semibold text-white mb-2">Metahumanos</h4>
          <p className="text-2xl font-bold text-blue-400">
            {usuarios.filter(u => u.rol === 'METAHUMANO').length}
          </p>
        </div>

        <div className="bg-[#1e293b] rounded-lg p-6 shadow-lg border border-slate-600">
          <h4 className="text-lg font-semibold text-white mb-2">Burócratas</h4>
          <p className="text-2xl font-bold text-green-400">
            {usuarios.filter(u => u.rol === 'BUROCRATA').length}
          </p>
        </div>

        <div className="bg-[#1e293b] rounded-lg p-6 shadow-lg border border-slate-600">
          <h4 className="text-lg font-semibold text-white mb-2">Total de Usuarios</h4>
          <p className="text-2xl font-bold text-purple-400">
            {usuarios.length}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
