import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { getPoderes } from '../../../api/poderes';
import { api } from '../../../api/client';

const GestionarPoderes = () => {
  const navigate = useNavigate();
  const [poderes, setPoderes] = useState([]);
  const [metapoderes, setMetapoderes] = useState([]);
  const [loadingPoderes, setLoadingPoderes] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  // Por defecto, mostrar solo las solicitudes pendientes (SOLICITADO)
  const [filtroEstado, setFiltroEstado] = useState('SOLICITADO');

  const categorias = [
    { value: 'Físico', label: 'Físico', icon: '💪' },
    { value: 'Mental', label: 'Mental', icon: '🧠' },
    { value: 'Elemental', label: 'Elemental', icon: '🔥' },
    { value: 'Tecnológico', label: 'Tecnológico', icon: '🤖' },
    { value: 'Mágico', label: 'Mágico', icon: '✨' },
    { value: 'Psíquico', label: 'Psíquico', icon: '🔮' },
    { value: 'Temporal', label: 'Temporal', icon: '⏰' },
    { value: 'Espacial', label: 'Espacial', icon: '🌌' },
    { value: 'Otro', label: 'Otro', icon: '⚡' }
  ];

  useEffect(() => {
    cargarPoderes();
    cargarMetapoderes();
  }, []);

  const cargarPoderes = async () => {
    try {
      setLoadingPoderes(true);
      const response = await getPoderes();
      setPoderes(response.data || response || []);
    } catch (error) {
      console.error('Error al cargar poderes:', error);
    } finally {
      setLoadingPoderes(false);
    }
  };

  const cargarMetapoderes = async () => {
    try {
      setLoadingPoderes(true);
      let metapoderesData = [];
      try {
        const res = await api.get('/metapoderes');
        metapoderesData = res.data?.data || res.data || [];
      } catch {
        const response = await fetch('http://localhost:3000/api/metapoderes', { credentials: 'include' });
        const data = await response.json();
        metapoderesData = data.data || data || [];
      }

      // Ordenar por fecha o ID (más reciente primero)
      const ordenados = metapoderesData.sort((a, b) => {
        const fechaA = new Date(a.fechaAdquisicion || a.createdAt || 0);
        const fechaB = new Date(b.fechaAdquisicion || b.createdAt || 0);
        if (fechaB - fechaA !== 0) return fechaB - fechaA;
        return (b.id || 0) - (a.id || 0);
      });

      setMetapoderes(ordenados);
    } catch (error) {
      console.error('Error al cargar metapoderes:', error);
      setMetapoderes([]);
    } finally {
      setLoadingPoderes(false);
    }
  };

  const getCategoriaInfo = (categoriaValue) => {
    return categorias.find(c => c.value?.toLowerCase() === categoriaValue?.toLowerCase()) || { label: categoriaValue || 'General', icon: '⚡' };
  };

  const handleAprobarPoder = async (metapoderId) => {
    if (window.confirm('¿Estás seguro de que quieres aprobar este poder?')) {
      try {
        try {
          await api.put(`/metapoderes/${metapoderId}`, { estado: 'APROBADO' });
        } catch {
          await fetch(`http://localhost:3000/api/metapoderes/${metapoderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ estado: 'APROBADO' })
          });
        }
        setMetapoderes(prev => prev.map(mp => mp.id === metapoderId ? { ...mp, estado: 'APROBADO' } : mp));
      } catch (error) {
        console.error('Error al aprobar poder:', error);
        alert('Error al aprobar el poder: ' + error.message);
        await cargarMetapoderes();
      }
    }
  };

  const handleRechazarPoder = async (metapoderId) => {
    if (window.confirm('¿Estás seguro de que quieres rechazar esta solicitud de poder?')) {
      try {
        try {
          await api.put(`/metapoderes/${metapoderId}`, { estado: 'RECHAZADO' });
        } catch {
          await fetch(`http://localhost:3000/api/metapoderes/${metapoderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ estado: 'RECHAZADO' })
          });
        }
        setMetapoderes(prev => prev.map(mp => mp.id === metapoderId ? { ...mp, estado: 'RECHAZADO' } : mp));
      } catch (error) {
        console.error('Error al rechazar poder:', error);
        alert('Error al rechazar el poder: ' + error.message);
        await cargarMetapoderes();
      }
    }
  };

  const metapoderesFiltrados = metapoderes.filter(metapoder => {
    const poder = metapoder.poder || poderes.find(p => p.id === metapoder.poderId);
    
    const coincideBusqueda = !busqueda || 
      poder?.nomPoder?.toLowerCase().includes(busqueda.toLowerCase()) ||
      metapoder.metahumano?.alias?.toLowerCase().includes(busqueda.toLowerCase()) ||
      metapoder.metahumano?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      metapoder.id?.toString().includes(busqueda);

    const coincideCategoria = filtroCategoria === 'todos' || poder?.categoria?.toLowerCase() === filtroCategoria?.toLowerCase();
    const coincideEstado = filtroEstado === 'todos' || metapoder.estado?.toUpperCase() === filtroEstado?.toUpperCase();

    return coincideBusqueda && coincideCategoria && coincideEstado;
  });

  const totalSolicitudes = metapoderes.length;
  const solicitudesPendientes = metapoderes.filter(mp => mp.estado === 'SOLICITADO').length;
  const solicitudesAprobadas = metapoderes.filter(mp => mp.estado === 'APROBADO').length;
  const solicitudesRechazadas = metapoderes.filter(mp => mp.estado === 'RECHAZADO').length;

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'SOLICITADO':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'APROBADO':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'RECHAZADO':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border border-slate-600';
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
        return '•';
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
    <AdminLayout title="Gestionar Poderes">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Minimalista */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>⚡</span> Gestión de Poderes Metahumanos
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Revisión y aprobación de solicitudes de habilidades para héroes y villanos
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
              onClick={() => { cargarPoderes(); cargarMetapoderes(); }}
              disabled={loadingPoderes}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span>🔄</span> Refrescar
            </button>
          </div>
        </div>

        {/* Métricas Minimalistas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
            <p className="text-xs font-medium text-slate-400">Total Solicitudes</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{totalSolicitudes}</p>
          </div>
          <div 
            onClick={() => setFiltroEstado('SOLICITADO')}
            className={`bg-slate-900/60 border rounded-xl p-3.5 cursor-pointer transition-all ${
              filtroEstado === 'SOLICITADO' ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-medium text-amber-400 flex items-center justify-between">
              <span>Pendientes</span>
              <span>⏳</span>
            </p>
            <p className="text-2xl font-bold text-amber-300 mt-1">{solicitudesPendientes}</p>
          </div>
          <div 
            onClick={() => setFiltroEstado('APROBADO')}
            className={`bg-slate-900/60 border rounded-xl p-3.5 cursor-pointer transition-all ${
              filtroEstado === 'APROBADO' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-medium text-emerald-400 flex items-center justify-between">
              <span>Aprobados</span>
              <span>✅</span>
            </p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">{solicitudesAprobadas}</p>
          </div>
          <div 
            onClick={() => setFiltroEstado('RECHAZADO')}
            className={`bg-slate-900/60 border rounded-xl p-3.5 cursor-pointer transition-all ${
              filtroEstado === 'RECHAZADO' ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-medium text-rose-400 flex items-center justify-between">
              <span>Rechazados</span>
              <span>❌</span>
            </p>
            <p className="text-2xl font-bold text-rose-300 mt-1">{solicitudesRechazadas}</p>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar por poder, metahumano o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700/70 text-sm text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full md:w-auto">
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800/80 border border-slate-700/70 text-xs font-semibold text-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
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
              className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800/80 border border-slate-700/70 text-xs font-semibold text-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="SOLICITADO">⏳ Solo Pendientes</option>
              <option value="todos">📋 Todas las Solicitudes</option>
              <option value="APROBADO">✅ Aprobados</option>
              <option value="RECHAZADO">❌ Rechazados</option>
            </select>
            <div className="flex items-center px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-slate-400">
              <span>Resultados: <strong className="text-slate-200 font-mono ml-1">{metapoderesFiltrados.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Listado de Solicitudes Minimalistas */}
        {loadingPoderes ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent mx-auto mb-3"></div>
            <p className="text-slate-400 text-xs font-medium">Cargando solicitudes de poderes...</p>
          </div>
        ) : metapoderesFiltrados.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">
              {filtroEstado === 'SOLICITADO' ? 'No hay solicitudes de poderes pendientes' : 'No se encontraron solicitudes'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {filtroEstado === 'SOLICITADO'
                ? 'Todas las solicitudes de poderes han sido procesadas. Cambia el filtro a "Todas" para revisar el historial.'
                : 'Intenta ajustando el filtro de categoría o la búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metapoderesFiltrados.map((metapoder) => {
              const poder = metapoder.poder || poderes.find(p => p.id === metapoder.poderId);
              const categoriaInfo = poder ? getCategoriaInfo(poder.categoria) : { label: 'Desconocido', icon: '❓' };
              const meta = metapoder.metahumano;

              return (
                <div
                  key={metapoder.id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/90 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 shadow-sm"
                >
                  <div>
                    {/* Top Bar: ID + Fecha + Status */}
                    <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-300">Solicitud #{metapoder.id}</span>
                        <span className="text-[11px] text-slate-500">•</span>
                        <span className="text-[11px] text-slate-400">
                          {formatearFecha(metapoder.fechaAdquisicion || metapoder.createdAt)}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide flex items-center gap-1 ${getEstadoBadge(metapoder.estado)}`}>
                        <span>{getEstadoIcon(metapoder.estado)}</span>
                        <span>{metapoder.estado}</span>
                      </span>
                    </div>

                    {/* Metahumano Info */}
                    <div className="flex items-center justify-between gap-2 mb-3 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800/60">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-slate-400 font-medium">Metahumano Solicitante</p>
                        <p className="text-sm font-bold text-slate-100 truncate">
                          {meta?.alias || meta?.nombre || `ID: ${metapoder.metahumanoId || 'N/A'}`}
                        </p>
                      </div>
                      {meta?.dni && (
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                          DNI: {meta.dni}
                        </span>
                      )}
                    </div>

                    {/* Detalle del Poder */}
                    <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-lg mb-3 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{categoriaInfo.icon}</span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-white truncate">
                            {poder ? poder.nomPoder : (metapoder.poderId ? `Poder #${metapoder.poderId}` : 'Poder No Identificado')}
                          </h4>
                          <span className="text-[11px] text-cyan-400 font-medium">
                            {categoriaInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Métricas de Dominio / Control */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-xs">
                        <div>
                          <span className="text-slate-400 text-[11px] block">Dominio</span>
                          <span className="text-slate-200 font-semibold">{metapoder.dominio || 'Estándar'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">Nivel de Control</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-cyan-400 rounded-full" 
                                style={{ width: `${Math.min(metapoder.nivelControl || 0, 100)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-cyan-300 font-bold">{metapoder.nivelControl || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Descripción & Debilidad */}
                    {poder && (
                      <div className="space-y-1.5 text-xs mb-3">
                        {poder.descPoder && (
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Habilidad:</span>
                            <p className="text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">{poder.descPoder}</p>
                          </div>
                        )}
                        {poder.debilidad && (
                          <div className="pt-1 text-[11px] text-rose-300/90 flex items-start gap-1">
                            <span>⚠️</span>
                            <span>Debilidad: <strong className="text-rose-200">{poder.debilidad}</strong></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="pt-2 border-t border-slate-800/80">
                    {metapoder.estado === 'SOLICITADO' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleRechazarPoder(metapoder.id)}
                          className="py-1.5 px-3 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>✕</span>
                          <span>Rechazar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAprobarPoder(metapoder.id)}
                          className="py-1.5 px-3 bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>✓</span>
                          <span>Aprobar</span>
                        </button>
                      </div>
                    ) : (
                      <div className={`p-2 rounded-lg text-center text-xs font-medium ${
                        metapoder.estado === 'APROBADO' 
                          ? 'bg-emerald-950/20 text-emerald-300 border border-emerald-800/30' 
                          : 'bg-rose-950/20 text-rose-300 border border-rose-800/30'
                      }`}>
                        {metapoder.estado === 'APROBADO' ? '✅ Poder aprobado y asignado' : '❌ Solicitud rechazada'}
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

export default GestionarPoderes;