import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { getPoderes, createPoder, deletePoder } from '../../../api/poderes';

const CrearPoderes = () => {
  const navigate = useNavigate();
  const [poderes, setPoderes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPoderes, setLoadingPoderes] = useState(true);
  const [formData, setFormData] = useState({
    nomPoder: '',
    descPoder: '',
    categoria: '',
    debilidad: '',
    descDebilidad: '',
    costoMulta: 0
  });

  const tiposPoder = [
    'Físico',
    'Mental',
    'Elemental',
    'Tecnológico',
    'Mágico',
    'Psíquico',
    'Temporal',
    'Espacial',
    'Otro'
  ];

  // Cargar poderes desde API
  useEffect(() => {
    const cargarPoderes = async () => {
      try {
        setLoadingPoderes(true);
        const poderesData = await getPoderes();
        setPoderes(poderesData.data || poderesData || []);
      } catch (error) {
        console.error('Error al cargar poderes:', error);
        alert('Error al cargar los poderes');
      } finally {
        setLoadingPoderes(false);
      }
    };

    cargarPoderes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const nuevoPoderData = {
        nomPoder: formData.nomPoder,
        descPoder: formData.descPoder,
        categoria: formData.categoria,
        debilidad: formData.debilidad,
        descDebilidad: formData.descDebilidad,
        costoMulta: parseFloat(formData.costoMulta) || 0
      };

      const response = await createPoder(nuevoPoderData);
      
      setPoderes(prev => [...prev, response.data || response]);
      
      // Limpiar formulario
      setFormData({
        nomPoder: '',
        descPoder: '',
        categoria: '',
        debilidad: '',
        descDebilidad: '',
        costoMulta: 0
      });
      setShowForm(false);
      
      alert('Poder creado exitosamente');
    } catch (error) {
      console.error('Error al crear poder:', error);
      alert('Error al crear el poder: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este poder?')) {
      try {
        await deletePoder(id);
        setPoderes(prev => prev.filter(poder => poder.id !== id));
        alert('Poder eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar poder:', error);
        alert('Error al eliminar el poder: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  const getNivelColor = (categoria) => {
    const colors = {
      'Físico': 'bg-green-100 text-green-800',
      'Mental': 'bg-blue-100 text-blue-800',
      'Elemental': 'bg-yellow-100 text-yellow-800',
      'Tecnológico': 'bg-orange-100 text-orange-800',
      'Mágico': 'bg-red-100 text-red-800',
      'Psíquico': 'bg-purple-100 text-purple-800',
      'Temporal': 'bg-indigo-100 text-indigo-800',
      'Espacial': 'bg-pink-100 text-pink-800',
      'Otro': 'bg-gray-100 text-gray-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  const getTipoIcon = (categoria) => {
    const icons = {
      'Físico': '💪',
      'Mental': '🧠',
      'Elemental': '🔥',
      'Tecnológico': '🤖',
      'Mágico': '✨',
      'Psíquico': '🔮',
      'Temporal': '⏰',
      'Espacial': '🌌',
      'Otro': '❓'
    };
    return icons[categoria] || '⚡';
  };

  return (
    <>
      <AdminLayout title="Gestión de Poderes">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Gestión de Poderes
            </h1>
            <p className="text-lg text-gray-300">
              Crea y administra los poderes disponibles en el sistema
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/admin/tramites')}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Volver a Trámites
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <span className="mr-2">⚡</span>
              Crear Nuevo Poder
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1e293b] p-6 rounded-xl shadow-sm border border-slate-600">
            <div className="flex items-center">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Poderes</p>
                <p className="text-2xl font-bold text-white">{poderes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1e293b] p-6 rounded-xl shadow-sm border border-slate-600">
            <div className="flex items-center">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <span className="text-2xl">💪</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Poderes Físicos</p>
                <p className="text-2xl font-bold text-white">
                  {poderes.filter(p => p.categoria === 'Físico').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#1e293b] p-6 rounded-xl shadow-sm border border-slate-600">
            <div className="flex items-center">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <span className="text-2xl">🧠</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Poderes Mentales</p>
                <p className="text-2xl font-bold text-white">
                  {poderes.filter(p => p.categoria === 'Mental').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#1e293b] p-6 rounded-xl shadow-sm border border-slate-600">
            <div className="flex items-center">
              <div className="p-3 bg-red-600/20 rounded-lg">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Poderes Elementales</p>
                <p className="text-2xl font-bold text-white">
                  {poderes.filter(p => p.categoria === 'Elemental').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Poderes */}
        <div className="bg-[#1e293b] rounded-xl shadow-sm border border-slate-600">
          <div className="p-6 border-b border-slate-600">
            <h2 className="text-xl font-semibold text-white">Poderes Registrados</h2>
          </div>
          <div className="p-6">
            {loadingPoderes ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Cargando poderes...</p>
              </div>
            ) : poderes.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">⚡</span>
                <h3 className="text-lg font-medium text-white mb-2">No hay poderes registrados</h3>
                <p className="text-gray-400 mb-4">Comienza creando tu primer poder</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Crear Primer Poder
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {poderes.map((poder) => (
                  <div key={poder.id} className="border border-slate-600 rounded-lg p-6 hover:shadow-md transition-shadow bg-[#334155]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getTipoIcon(poder.categoria)}</span>
                        <div>
                          <h3 className="font-semibold text-white">{poder.nomPoder}</h3>
                          <span className="text-sm text-gray-400">{poder.categoria}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(poder.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {poder.descPoder}
                    </p>
                    
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Debilidad:</p>
                      <p className="text-gray-300 text-sm">{poder.debilidad}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getNivelColor(poder.categoria)}`}>
                        {poder.categoria}
                      </span>
                      {poder.costoMulta > 0 && (
                        <span className="text-yellow-400 text-sm font-medium">
                          ${poder.costoMulta}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>

      {/* Modal para crear poder */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] rounded-xl p-8 max-w-md w-full mx-4 border border-slate-600">
            <h2 className="text-2xl font-bold text-white mb-6">Crear Nuevo Poder</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del Poder
                </label>
                <input
                  type="text"
                  name="nomPoder"
                  value={formData.nomPoder}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-600 bg-[#334155] text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Super Velocidad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción del Poder
                </label>
                <textarea
                  name="descPoder"
                  value={formData.descPoder}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-600 bg-[#334155] text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe las capacidades de este poder..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-600 bg-[#334155] text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecciona una categoría</option>
                  {tiposPoder.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Debilidad
                </label>
                <input
                  type="text"
                  name="debilidad"
                  value={formData.debilidad}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-600 bg-[#334155] text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Kriptonita, agua, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción de la Debilidad
                </label>
                <textarea
                  name="descDebilidad"
                  value={formData.descDebilidad}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-600 bg-[#334155] text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Explica cómo afecta esta debilidad al poder..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Costo de Multa (opcional)
                </label>
                <input
                  type="number"
                  name="costoMulta"
                  value={formData.costoMulta}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-600 bg-[#334155] text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Poder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CrearPoderes;
