import { useState, useEffect } from "react";
import MetahumanoLayout from "../../components/layouts/MetahumanoLayout";
import { useAuth } from "../../context/AuthContext";
import { getAllNoticiasRequest } from "../../api/noticias";

const CLASIFICACION_CONFIG = {
  GENERAL:     { color: "bg-slate-500",   border: "border-slate-400", text: "text-slate-200",   icon: "📋", glow: ""                        },
  INFORMATIVA: { color: "bg-blue-600",    border: "border-blue-400",  text: "text-blue-200",    icon: "ℹ️",  glow: "shadow-blue-500/20"       },
  OFICIAL:     { color: "bg-emerald-700", border: "border-emerald-400", text: "text-emerald-200", icon: "🏛️", glow: "shadow-emerald-500/20"    },
  ALERTA:      { color: "bg-amber-600",   border: "border-amber-400", text: "text-amber-200",   icon: "⚠️", glow: "shadow-amber-500/20"       },
  URGENTE:     { color: "bg-red-700",     border: "border-red-400",   text: "text-red-200",     icon: "🚨", glow: "shadow-red-500/20 shadow-lg"},
};

export default function NoticiasMetahumano() {
  const { user } = useAuth();

  const [noticias, setNoticias]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  // Filtros
  const [busqueda, setBusqueda]           = useState("");
  const [filtroClasif, setFiltroClasif]   = useState("TODAS");

  // Modal detalle
  const [noticiaDetalle, setNoticiaDetalle] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await getAllNoticiasRequest();
        const publicadas = (data.data || []).filter((n) => n.estado === "PUBLICADA");
        setNoticias(publicadas);
      } catch {
        setError("No se pudieron cargar las noticias. Intentá más tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const noticiasFiltradas = noticias
    .filter((n) => filtroClasif === "TODAS" || n.clasificacion === filtroClasif)
    .filter(
      (n) =>
        busqueda.trim() === "" ||
        n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        n.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Orden cronológico general

  // Separo la noticia principal (la destacada más reciente), otras destacadas y el resto
  const destacadas = noticiasFiltradas.filter((n) => n.destacada);
  const noDestacadas = noticiasFiltradas.filter((n) => !n.destacada);

  const heroNews = destacadas.length > 0 ? destacadas[0] : (noDestacadas.length > 0 ? noDestacadas[0] : null);
  const secondaryNews = destacadas.length > 1 
    ? destacadas.slice(1, 4) 
    : (destacadas.length === 1 ? noDestacadas.slice(0, 3) : noDestacadas.slice(1, 4));

  const remainingNews = noticiasFiltradas.filter(
    (n) => n.id !== heroNews?.id && !secondaryNews.some((sn) => sn.id === n.id)
  );

  return (
    <MetahumanoLayout>
      <div className="min-h-screen bg-[#0b0c10] text-white font-sans">
        
        {/* Cabecera del Portal */}
        <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between py-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f1a035] rounded-lg flex items-center justify-center transform rotate-3">
                  <span className="text-2xl">📰</span>
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter uppercase text-white drop-shadow-md">
                    El Informante
                  </h1>
                  <p className="text-[#f1a035] text-xs font-bold tracking-widest uppercase">
                    Red Global Metahumana
                  </p>
                </div>
              </div>
              
              {/* Buscador minimalista */}
              <div className="relative w-full md:w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/50">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#f1a035] focus:ring-1 focus:ring-[#f1a035] transition-all"
                />
              </div>
            </div>

            {/* Categorías (Navegación estilo tabs) */}
            <nav className="flex space-x-1 overflow-x-auto py-3 no-scrollbar border-t border-white/5">
              <button
                onClick={() => setFiltroClasif("TODAS")}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                  filtroClasif === "TODAS"
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                Portada
              </button>
              {Object.keys(CLASIFICACION_CONFIG).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltroClasif(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                    filtroClasif === cat
                      ? `${CLASIFICACION_CONFIG[cat].color} text-white`
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm mb-8 text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-70">
              <div className="w-12 h-12 border-4 border-white/10 border-t-[#f1a035] rounded-full animate-spin mb-4" />
              <p className="tracking-widest uppercase text-xs font-bold text-white/50">Cargando servidor de noticias...</p>
            </div>
          ) : noticiasFiltradas.length === 0 ? (
            <div className="text-center py-32">
              <span className="text-6xl mb-4 block opacity-30">📭</span>
              <h2 className="text-2xl font-bold text-white/80 mb-2">No se encontraron noticias</h2>
              <p className="text-white/40">Intentá con otros términos de búsqueda o revisá más tarde.</p>
            </div>
          ) : (
            <div className="space-y-12">
              
              {/* SECCIÓN HERO (Noticia Principal) y SECONDARY (Otras Destacadas) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Hero News (toma 8 columnas en desktop) */}
                {heroNews && (
                  <article 
                    onClick={() => setNoticiaDetalle(heroNews)}
                    className="lg:col-span-8 relative rounded-2xl overflow-hidden cursor-pointer group min-h-[400px] flex items-end shadow-2xl border border-white/10"
                  >
                    {heroNews.imagen ? (
                      <img 
                        src={heroNews.imagen} 
                        alt={heroNews.titulo}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                        <span className="text-9xl opacity-20">{CLASIFICACION_CONFIG[heroNews.clasificacion]?.icon}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90"></div>
                    
                    <div className="relative p-6 sm:p-10 w-full">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-md text-white ${CLASIFICACION_CONFIG[heroNews.clasificacion]?.color || "bg-slate-500"}`}>
                          {heroNews.clasificacion}
                        </span>
                        {heroNews.destacada && (
                          <span className="bg-[#f1a035] text-black px-3 py-1 text-xs font-black uppercase tracking-wider rounded-md shadow-[0_0_15px_rgba(241,160,53,0.5)]">
                            Titular
                          </span>
                        )}
                        <span className="text-white/70 text-sm font-medium flex items-center gap-1.5">
                          <span>🕒</span> {new Date(heroNews.fecha).toLocaleDateString("es-AR")}
                        </span>
                      </div>
                      
                      <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4 group-hover:text-[#f1a035] transition-colors line-clamp-3">
                        {heroNews.titulo}
                      </h2>
                      <p className="text-white/80 text-base sm:text-lg line-clamp-2 max-w-3xl">
                        {heroNews.descripcion}
                      </p>
                    </div>
                  </article>
                )}

                {/* Secondary News (toma 4 columnas) */}
                {secondaryNews.length > 0 && (
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    {secondaryNews.map((news) => (
                      <article 
                        key={news.id} 
                        onClick={() => setNoticiaDetalle(news)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer group hover:bg-white/10 transition-colors flex flex-col sm:flex-row lg:flex-col"
                      >
                        {news.imagen ? (
                          <div className="h-32 sm:h-auto sm:w-1/3 lg:w-full lg:h-40 relative overflow-hidden shrink-0">
                            <img src={news.imagen} alt={news.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          </div>
                        ) : (
                          <div className="h-32 sm:h-auto sm:w-1/3 lg:w-full lg:h-40 bg-slate-800/50 flex items-center justify-center shrink-0">
                             <span className="text-4xl opacity-50">{CLASIFICACION_CONFIG[news.clasificacion]?.icon}</span>
                          </div>
                        )}
                        <div className="p-5 flex flex-col justify-center flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${CLASIFICACION_CONFIG[news.clasificacion]?.color || "bg-slate-500"}`}></span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">
                              {news.clasificacion}
                            </span>
                            <span className="text-[10px] text-white/40 ml-auto">
                              {new Date(news.fecha).toLocaleDateString("es-AR", { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white leading-snug group-hover:text-[#f1a035] transition-colors line-clamp-3">
                            {news.titulo}
                          </h3>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              {/* SECCIÓN GRILLA (Resto de las noticias) */}
              {remainingNews.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-xl font-black uppercase tracking-wider text-white">Últimas Actualizaciones</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {remainingNews.map((news) => (
                      <article 
                        key={news.id}
                        onClick={() => setNoticiaDetalle(news)}
                        className="bg-transparent group cursor-pointer"
                      >
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-white/10">
                          {news.imagen ? (
                            <img src={news.imagen} alt={news.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full bg-slate-800/30 flex items-center justify-center">
                              <span className="text-5xl opacity-20">{CLASIFICACION_CONFIG[news.clasificacion]?.icon}</span>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 flex gap-1">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-black/80 backdrop-blur-sm ${CLASIFICACION_CONFIG[news.clasificacion]?.text || "text-white"}`}>
                              {news.clasificacion}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-[11px] text-white/50 font-medium mb-1.5 uppercase tracking-wide">
                            <span>{new Date(news.fecha).toLocaleDateString("es-AR")}</span>
                            {news.autor?.nombre && (
                              <>
                                <span>•</span>
                                <span>Por {news.autor.nombre}</span>
                              </>
                            )}
                          </div>
                          <h4 className="text-lg font-bold text-white leading-tight mb-2 group-hover:text-[#f1a035] transition-colors line-clamp-2">
                            {news.titulo}
                          </h4>
                          <p className="text-white/50 text-sm line-clamp-2">
                            {news.descripcion}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL DETALLE DE NOTICIA */}
      {noticiaDetalle && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
          onClick={() => setNoticiaDetalle(null)}
        >
          <div 
            className="bg-[#111218] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setNoticiaDetalle(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
            >
              ✕
            </button>

            {/* Imagen Lateral (Desktop) o Superior (Mobile) */}
            {noticiaDetalle.imagen && (
              <div className="md:w-2/5 h-64 md:h-auto relative shrink-0">
                <img 
                  src={noticiaDetalle.imagen} 
                  alt={noticiaDetalle.titulo} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#111218] via-transparent to-transparent opacity-90 md:opacity-100"></div>
              </div>
            )}
            
            <div className={`p-6 sm:p-10 flex-1 ${!noticiaDetalle.imagen ? 'md:w-full' : ''}`}>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded text-white ${CLASIFICACION_CONFIG[noticiaDetalle.clasificacion]?.color || "bg-slate-500"}`}>
                  {noticiaDetalle.clasificacion}
                </span>
                {noticiaDetalle.destacada && (
                  <span className="bg-[#f1a035] text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded">
                    Titular Destacado
                  </span>
                )}
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
                {noticiaDetalle.titulo}
              </h2>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider text-white/40 mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span>🕒</span> {new Date(noticiaDetalle.fecha).toLocaleDateString("es-AR", { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                {noticiaDetalle.autor?.nombre && (
                  <div className="flex items-center gap-1.5">
                    <span>✍️</span> {noticiaDetalle.autor.nombre}
                  </div>
                )}
              </div>
              
              <div className="prose prose-invert prose-p:text-white/70 prose-p:leading-relaxed max-w-none">
                {noticiaDetalle.descripcion.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </MetahumanoLayout>
  );
}
