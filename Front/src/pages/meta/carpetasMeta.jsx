import React, { useState, useCallback, useEffect } from "react";
import { getMetaId, getUserFromCookie}  from "../../utils/cookies";
import { FaFolder, FaExclamationCircle, FaSearch } from "react-icons/fa";
import { getBurocrataByIdRequest } from "../../api/burocratas";
import { crearPreferenciaMPRequest, verificarPagoMPRequest } from "../../api/multas";
import MetahumanoLayout from "../../components/layouts/MetahumanoLayout";
import { useAuth } from "../../context/AuthContext";


function Home() {
  const [showMenu, setShowMenu] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [carpetas, setCarpetas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCarpetas, setExpandedCarpetas] = useState({});
  const [expandedMultas, setExpandedMultas] = useState({});
  const [burocrataNombre, setBurocrataNombre] = useState(null);
  const [payingMulta, setPayingMulta] = useState(null);
  const [pendingVerification, setPendingVerification] = useState(null); // multaId esperando confirmación de MP
  const { user } = useAuth();

 

  
    // Función para obtener carpetas del backend
    const fetchCarpetas = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            
            // Obtener todas las carpetas del metahumano específico
            const response = await fetch(`http://localhost:3000/api/carpetas/idMetahumano/${getMetaId()}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Error al obtener las carpetas');
            }
            
            const data = await response.json();
            const carpetasData = data.data || [];
            setCarpetas(carpetasData);
            
        } catch (error) {
            console.error('Error fetching carpetas:', error);
            setError(error.message || 'Error al cargar las carpetas');
            setCarpetas([]);
        } finally {
            setLoading(false);
        }
    }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        if (getMetaId()) {
          await fetchCarpetas();
        }
        const user = getUserFromCookie();
        const burocrataId = user?.perfilId;

        if (burocrataId) {
          const res = await getBurocrataByIdRequest(burocrataId);
          setBurocrataNombre(res.data.data.nombre);
          console.log("nombre del burócrata:", res.data.data.nombre);
        } else {
          console.warn("No se encontró perfilId en la cookie");
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    }

    fetchData();
  }, [fetchCarpetas]);

  // Detectar retorno desde MercadoPago y confirmar pago verificando con la API de MP
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const multaId = params.get('multa_id');

    if (status === 'success' && multaId) {
      // Limpiar los query params de la URL sin recargar la página
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      // Verificar con la API de MP que el pago realmente fue aprobado antes de marcarlo como PAGADA
      verificarPagoMPRequest(Number(multaId))
        .then(() => {
          alert(`✅ ¡Pago confirmado por Mercado Pago!\nLa Multa #${multaId} ha sido registrada como PAGADA.`);
          fetchCarpetas();
        })
        .catch((err) => {
          console.error('Error al verificar pago tras retorno de MP:', err);
          alert('Mercado Pago indicó éxito, pero no se pudo verificar el pago. Intentá confirmar manualmente o contactá a soporte.');
        });
    } else if (status === 'failure' && multaId) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      alert(`❌ El pago de la Multa #${multaId} fue rechazado por Mercado Pago.`);
    } else if (status === 'pending' && multaId) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      alert(`⏳ El pago de la Multa #${multaId} está pendiente de acreditación en Mercado Pago.`);
    }
  }, [fetchCarpetas]);

  // Polling automático: consulta MP cada 4 seg mientras haya un pago pendiente de confirmar
  useEffect(() => {
    if (!pendingVerification) return;

    const interval = setInterval(async () => {
      try {
        await verificarPagoMPRequest(pendingVerification);
        // Pago aprobado detectado automáticamente
        clearInterval(interval);
        setPendingVerification(null);
        await fetchCarpetas();
      } catch {
        // 400 = pago aún no registrado en MP, seguir esperando
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [pendingVerification, fetchCarpetas]);



    const toggleMenu = () => setShowMenu(!showMenu);
    const toggleUser = () => setShowUser(!showUser);
    const closeUser = () => setShowUser(false);
    
    // alternar la visibilidad de las multas de una carpeta
    const toggleMultas = (carpetaId) => {
        setExpandedCarpetas(prev => ({
            ...prev,
            [carpetaId]: !prev[carpetaId]
        }));
    };

    // alternar detalles de una multa
    const toggleDetallesMulta = (multaId) => {
        setExpandedMultas(prev => ({
            ...prev,
            [multaId]: !prev[multaId]
        }));
    };
    
    // Función para iniciar el pago de una multa con Mercado Pago
    const handlePagarMulta = (multa) => {
      setPayingMulta(multa);
    };

    // Procesar pago con Mercado Pago (Checkout Pro)
    const procesarPagoMercadoPago = async () => {
      if (!payingMulta) return;
      try {
        setLoading(true);
        const resPref = await crearPreferenciaMPRequest(payingMulta.id);
        const checkoutUrl = resPref.data?.data?.checkoutUrl;

        if (checkoutUrl) {
          const multaId = payingMulta.id;
          setPayingMulta(null);
          setPendingVerification(multaId); // quedar esperando confirmación
          window.open(checkoutUrl, '_blank');
        } else {
          alert('No se pudo generar el link de pago. Intentá de nuevo.');
        }
      } catch (err) {
        console.error("Error al procesar pago con Mercado Pago:", err);
        alert("Error al procesar con Mercado Pago: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };


    // todas las multas de una carpeta
  const obtenerMultasDeCarpeta = (carpeta) => {
    const totalMultas = [];
    console.log("CARPETA:", carpeta)
    if (carpeta.evidencias && Array.isArray(carpeta.evidencias)) {
      console.log("EVIDENCIAS: ", carpeta.evidencias)
      for (const evidencia of carpeta.evidencias) {
        if (evidencia.multas && Array.isArray(evidencia.multas)) {
          totalMultas.push(...evidencia.multas);
        }
      }
    }

    return totalMultas;
  };

    // obtener la evidencia correspondiente a una multa
    const obtenerEvidenciaDeMulta = (carpeta, multaId) => {
        if (carpeta.evidencias) {
            for (const evidencia of carpeta.evidencias) {
                if (evidencia.multas && evidencia.multas.some(multa => multa.id === multaId)) {
                    return evidencia;
                }
            }
        }
        return null;
    };

  const containerBg = 'bg-[#296588]';

  return (
    <MetahumanoLayout>
        {/* Contenido principal */}
        <div
          className={`p-4 ${containerBg} text-white rounded-lg shadow-lg h-full hover:shadow-xl transition-all duration-500
            ${showUser ? "lg:col-span-6" : "lg:col-span-8"}
            ${showUser ? "opacity-90" : "opacity-100"}`}
        >
          <div className="flex-1 min-h-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Mis Carpetas</h1>
                <p className="text-gray-300">Gestiona tus carpetas y documentación de metahumano.</p>
              </div>
              <button 
                onClick={fetchCarpetas}
                disabled={loading}
                className="px-4 py-2 bg-[#ec7c6a] hover:bg-[#d66b59] disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>
            
            {/* Estado de carga */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-gray-300">Cargando carpetas...</p>
              </div>
            )}

            {/* Estado de error */}
            {error && !loading && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <FaExclamationCircle className="text-red-400 mr-2" />
                  <p className="text-red-200">Error: {error}</p>
                </div>
                <button 
                  onClick={fetchCarpetas}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Contenido de carpetas */}
            {!loading && !error && (
              <>
                {/* 🔍 Buscador de carpetas */}
                {carpetas.length > 0 && (
                  <div className="mb-6 relative max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar carpeta por ID, tipo, estado o descripción..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#1F1D2B] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ec7c6a] transition text-sm"
                    />
                  </div>
                )}

                {carpetas.length === 0 ? (
                  <div className="text-center py-12">
                    <FaFolder className="text-6xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No tienes carpetas</h3>
                    <p className="text-gray-400 mb-6">Aún no se han creado carpetas para tu perfil de metahumano.</p>
                  </div>
                ) : carpetas.filter((c) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.trim().toLowerCase();
                    return (
                      c.id?.toString().includes(q) ||
                      c.descripcion?.toLowerCase().includes(q) ||
                      c.tipo?.toLowerCase().includes(q) ||
                      c.estado?.toLowerCase().includes(q)
                    );
                  }).length === 0 ? (
                  <div className="text-center py-8 bg-[#1F1D2B] rounded-lg border border-gray-700">
                    <p className="text-gray-300 font-medium">No se encontraron carpetas que coincidan con "{searchQuery}"</p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-3 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {carpetas
                      .filter((c) => {
                        if (!searchQuery.trim()) return true;
                        const q = searchQuery.trim().toLowerCase();
                        return (
                          c.id?.toString().includes(q) ||
                          c.descripcion?.toLowerCase().includes(q) ||
                          c.tipo?.toLowerCase().includes(q) ||
                          c.estado?.toLowerCase().includes(q)
                        );
                      })
                      .map((carpeta) => {
                      const multas = obtenerMultasDeCarpeta(carpeta);
                      const multasPendientes = multas.filter(m => m.estado === 'PENDIENTE').length;
                      const isExpanded = expandedCarpetas[carpeta.id];

                      return (
                        <div
                          key={carpeta.id}
                          className={`bg-[#1F1D2B] rounded-lg p-6 border border-gray-700 hover:border-gray-600 hover:bg-[#2A2738] transition-all duration-300 
                            ${isExpanded ? 'col-span-2' : ''}`}
                        >
                          {/* Cabecera de la carpeta */}
                          <div className="flex items-start justify-between mb-4">
                            <FaFolder className="text-2xl text-[#ec7c6a]" />
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                                carpeta.estado?.toLowerCase() === 'activa' || carpeta.estado?.toLowerCase() === 'aprobada'
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : carpeta.estado?.toLowerCase() === 'pendiente'
                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                  : carpeta.estado?.toLowerCase() === 'rechazada'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              }`}
                            >
                              {carpeta.estado || 'Sin estado'}
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold text-white mb-2">
                            Carpeta #{carpeta.id}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3">
                            {carpeta.descripcion || 'Sin descripción disponible'}
                          </p>

                          {/* Resumen de multas */}
                          <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-300">Total de multas:</span>
                              <span className="text-white font-medium">{multas.length}</span>
                            </div>
                            {multas.filter(m => m.estado === 'APROBADA').length > 0 && (
                              <div className="flex justify-between items-center text-sm mt-1">
                                <span className="text-yellow-300">Por pagar (Aprobadas):</span>
                                <span className="text-yellow-400 font-bold">{multas.filter(m => m.estado === 'APROBADA').length}</span>
                              </div>
                            )}
                            {multas.filter(m => m.estado === 'PENDIENTE').length > 0 && (
                              <div className="flex justify-between items-center text-sm mt-1">
                                <span className="text-orange-300">Pendientes de aprobación:</span>
                                <span className="text-orange-400 font-medium">{multas.filter(m => m.estado === 'PENDIENTE').length}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-gray-500 mb-3">
                            <p>
                              Creada:{' '}
                              {carpeta.fecha_creacion
                                ? new Date(carpeta.fecha_creacion).toLocaleDateString()
                                : 'Fecha no disponible'}
                            </p>
                            {carpeta.burocrata && (
                              <p>Asignada al Burócrata: {burocrataNombre}</p>
                            )}
                          </div>

                          {/* Botón para expandir contenido de la carpeta */}
                          <button
                            onClick={() => toggleMultas(carpeta.id)}
                            disabled={!carpeta.evidencias || carpeta.evidencias.length === 0}
                            className="w-full px-4 py-2 bg-[#ec7c6a] hover:bg-[#d66b59] disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors text-sm mb-2"
                          >
                            {!carpeta.evidencias || carpeta.evidencias.length === 0
                              ? 'Sin Evidencias ni Multas'
                              : isExpanded
                              ? 'Ocultar Contenido'
                              : `Ver ${carpeta.evidencias.length} Evidencia${carpeta.evidencias.length !== 1 ? 's' : ''} y Multas`}
                          </button>

                          {/* Sección expandible de evidencias y multas */}
                          {isExpanded && (
                            <div className="mt-4 border-t border-gray-700 pt-4 space-y-4">
                              <h4 className="text-lg font-bold text-white mb-3">
                                📋 Evidencias y Cargos Presentados
                              </h4>

                              {!carpeta.evidencias || carpeta.evidencias.length === 0 ? (
                                <p className="text-gray-400 text-sm">
                                  No hay evidencias registradas en esta carpeta.
                                </p>
                              ) : (
                                <div className="space-y-4">
                                  {carpeta.evidencias.map((ev) => (
                                    <div key={ev.id} className="bg-[#2A2738] rounded-lg p-4 border border-gray-750">
                                      <div className="mb-3 border-b border-gray-700/50 pb-3">
                                        <p className="font-semibold text-white text-base">🔍 Evidencia: {ev.descripcion}</p>
                                        <p className="text-xs text-gray-400 mt-1">Recopilada el: {new Date(ev.fechaRecoleccion).toLocaleDateString()}</p>
                                        {ev.imagen && (
                                          <div className="mt-3">
                                            <p className="text-xs text-gray-400 mb-1">Archivo Adjunto:</p>
                                            <a href={ev.imagen} target="_blank" rel="noopener noreferrer" title="Clic para abrir en tamaño completo">
                                              <img
                                                src={ev.imagen}
                                                alt="Evidencia"
                                                className="max-h-40 rounded border border-gray-600 object-contain hover:scale-[1.01] transition-all cursor-zoom-in"
                                              />
                                            </a>
                                          </div>
                                        )}
                                      </div>

                                      {/* Multas asociadas a esta evidencia */}
                                      <div className="pl-2">
                                        <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Multas Aplicadas:</h5>
                                        {!ev.multas || ev.multas.length === 0 ? (
                                          <p className="text-xs text-gray-500">Ninguna multa asociada a esta evidencia.</p>
                                        ) : (
                                          <div className="grid grid-cols-1 gap-4 mt-3">
                                            {ev.multas.map((m) => {
                                              const statusConfig = {
                                                PAGADA: { bg: 'from-green-900/40 to-emerald-900/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20', icon: '✅' },
                                                APROBADA: { bg: 'from-yellow-900/40 to-amber-900/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20', icon: '⚠️' },
                                                PENDIENTE: { bg: 'from-orange-900/40 to-amber-900/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20', icon: '⏳' },
                                                RECHAZADA: { bg: 'from-red-900/40 to-rose-900/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20', icon: '❌' },
                                                ACTIVA: { bg: 'from-blue-900/40 to-indigo-900/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/20', icon: 'ℹ️' },
                                                CERRADA: { bg: 'from-gray-900/40 to-slate-900/10', border: 'border-gray-500/30', text: 'text-gray-400', badge: 'bg-gray-500/20', icon: '📁' }
                                              };
                                              const s = statusConfig[m.estado?.toUpperCase()] || statusConfig.RECHAZADA;
                                              
                                              return (
                                                <div 
                                                  key={m.id} 
                                                  className={`relative overflow-hidden bg-gradient-to-br ${s.bg} border ${s.border} p-5 rounded-xl shadow-lg hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-md group`}
                                                >
                                                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none"></div>
                                                  
                                                  <div className="flex flex-col md:flex-row justify-between gap-5 relative z-10">
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-3 mb-3">
                                                        <h6 className="text-lg font-bold text-white tracking-wide">{m.motivoMulta}</h6>
                                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm ${s.badge} ${s.text} border ${s.border}`}>
                                                          <span>{s.icon}</span> <span>{m.estado}</span>
                                                        </span>
                                                      </div>
                                                      
                                                      <div className="grid grid-cols-2 gap-4 mt-4 bg-black/20 p-3 rounded-lg border border-white/5">
                                                        <div>
                                                          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Monto a Pagar</p>
                                                          <p className="text-2xl font-black text-white drop-shadow-md">
                                                            $<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                                                              {m.montoMulta?.toLocaleString()}
                                                            </span>
                                                          </p>
                                                        </div>
                                                        <div>
                                                          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Lugar de Pago</p>
                                                          <p className="text-sm font-medium text-gray-200">{m.lugarDePago}</p>
                                                        </div>
                                                      </div>
                                                      
                                                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 pt-3 border-t border-white/10 text-xs text-gray-400 font-medium">
                                                        <div className="flex items-center gap-1.5">
                                                          <svg className="w-4 h-4 opacity-70 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                          </svg>
                                                          Emisión: <span className="text-gray-300">{new Date(m.fechaEmision).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                          <svg className="w-4 h-4 opacity-70 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                          </svg>
                                                          Vence: <span className={new Date(m.fechaVencimiento) < new Date() && m.estado !== 'PAGADA' ? 'text-red-400 font-bold' : 'text-gray-300'}>{new Date(m.fechaVencimiento).toLocaleDateString()}</span>
                                                        </div>
                                                      </div>

                                                      {m.estado === 'PAGADA' && m.formaPago && (
                                                        <div className="mt-3 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
                                                          <span>💳</span>
                                                          <span>Forma de Pago: <strong className="text-white">{m.formaPago}</strong></span>
                                                        </div>
                                                      )}
                                                    </div>

                                                    {(m.estado === 'APROBADA') && (
                                                      <div className="flex items-center md:items-end justify-center md:justify-end border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                                                        <button
                                                          onClick={() => handlePagarMulta(m)}
                                                          className="w-full md:w-auto relative inline-flex items-center justify-center px-6 py-3 font-bold text-white transition-all duration-300 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg hover:from-emerald-400 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 focus:ring-offset-[#1F1D2B] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 overflow-hidden group/btn"
                                                        >
                                                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                                                          <span className="mr-2 text-xl drop-shadow-md">💳</span>
                                                          <span>Pagar Ahora</span>
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
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal de Pago con Mercado Pago */}
        {payingMulta && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="bg-[#1F1D2B] border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-fadeIn text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                  💙 Pagar con Mercado Pago
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Multa #{payingMulta.id}
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-4">
                El pago será procesado y acreditado en la cuenta de Mercado Pago oficial.
              </p>

              <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 mb-5 space-y-1">
                <p className="text-xs text-gray-400">Motivo: <span className="text-white font-medium">{payingMulta.motivoMulta}</span></p>
                <p className="text-xs text-gray-400">Monto total: <span className="text-emerald-400 font-bold text-base">${payingMulta.montoMulta?.toLocaleString()} ARS</span></p>
              </div>

              {/* Botón de Mercado Pago */}
              <button
                type="button"
                onClick={procesarPagoMercadoPago}
                disabled={loading}
                className="w-full mb-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer border border-cyan-400/30"
              >
                <div className="w-6 h-6 rounded-full bg-white text-sky-600 flex items-center justify-center font-black text-xs">
                  MP
                </div>
                <span>{loading ? 'Generando Preferencia...' : 'Abrir Mercado Pago (Checkout Pro)'}</span>
              </button>



              <div className="flex gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPayingMulta(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition-colors cursor-pointer text-xs"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación post-pago MP */}
        {pendingVerification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="bg-[#1F1D2B] border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                💙 Esperando pago en Mercado Pago
              </h3>
              <p className="text-gray-400 text-sm mb-5">
                Completá el pago en la pestaña de Mercado Pago. Cuando lo confirmemos, el estado se actualizará automáticamente.
              </p>

              {/* Spinner animado */}
              <div className="flex items-center justify-center gap-3 bg-black/30 rounded-xl py-4 mb-5">
                <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <span className="text-cyan-300 text-sm font-medium">Verificando con Mercado Pago cada 4 segundos...</span>
              </div>

              <p className="text-xs text-gray-500 text-center mb-4">Multa #{pendingVerification}</p>

              <button
                type="button"
                onClick={() => setPendingVerification(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-600 text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors cursor-pointer text-xs"
              >
                Cancelar (no voy a pagar ahora)
              </button>
            </div>
          </div>
        )}
    </MetahumanoLayout>
  );
}

export default Home;
