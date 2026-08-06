import { useState, useEffect, useRef } from "react";
import BurocrataLayout from "../../components/layouts/BurocrataLayout";
import { useAuth } from "../../context/AuthContext";
import { getMe } from "../../api/usuarios";
import { getBurocrataByIdRequest } from "../../api/burocratas";
import {
  getAllNoticiasRequest,
  createNoticiaRequest,
  updateNoticiaRequest,
  deleteNoticiaRequest,
  patchNoticiaRequest,
} from "../../api/noticias";

const CLASIFICACIONES = ["GENERAL", "INFORMATIVA", "OFICIAL", "ALERTA", "URGENTE"];
const ESTADOS = ["BORRADOR", "PUBLICADA", "ARCHIVADA"];

const CLASIFICACION_CONFIG = {
  GENERAL:     { color: "bg-slate-500",   icon: "📋" },
  INFORMATIVA: { color: "bg-blue-500",    icon: "ℹ️"  },
  OFICIAL:     { color: "bg-emerald-600", icon: "🏛️" },
  ALERTA:      { color: "bg-amber-500",   icon: "⚠️" },
  URGENTE:     { color: "bg-red-600",     icon: "🚨" },
};

const ESTADO_CONFIG = {
  BORRADOR:  { color: "bg-slate-600 text-slate-200",   label: "Borrador"  },
  PUBLICADA: { color: "bg-emerald-700 text-emerald-100", label: "Publicada" },
  ARCHIVADA: { color: "bg-orange-700 text-orange-100",  label: "Archivada" },
};

const EMPTY_FORM = {
  titulo: "",
  descripcion: "",
  imagen: "",
  fecha: new Date().toISOString().slice(0, 10),
  clasificacion: "GENERAL",
  estado: "BORRADOR",
  destacada: false,
};

// ── Convierte imagen a base64 ──────────────────────────────────────────────
function toBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

export default function GestionNoticias() {
  const { isAuthenticated } = useAuth();

  const [burocrataId, setBurocrataId] = useState(null);
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  // Modal form
  const [showModal, setShowModal]       = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState("");
  const [imgPreview, setImgPreview]     = useState("");

  // Confirmación borrado
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);

  // Filtros
  const [filtroClasif, setFiltroClasif] = useState("TODAS");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [busqueda, setBusqueda]         = useState("");

  const fileRef = useRef();

  // ── Carga inicial ────────────────────────────────────────────────────────
  const fetchBurocrataId = async () => {
    try {
      const { data } = await getMe();
      const id = data.data.perfilId;
      setBurocrataId(id);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNoticias = async () => {
    setLoading(true);
    try {
      const { data } = await getAllNoticiasRequest();
      setNoticias(data.data || []);
    } catch (e) {
      setError("No se pudieron cargar las noticias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBurocrataId();
      fetchNoticias();
    }
  }, [isAuthenticated]);

  // ── Filtrado ─────────────────────────────────────────────────────────────
  const noticiasFiltradas = noticias
    .filter((n) => filtroClasif === "TODAS" || n.clasificacion === filtroClasif)
    .filter((n) => filtroEstado === "TODOS" || n.estado === filtroEstado)
    .filter((n) =>
      busqueda.trim() === "" ||
      n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  // ── Manejo de imagen ─────────────────────────────────────────────────────
  const handleImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setForm((f) => ({ ...f, imagen: b64 }));
    setImgPreview(b64);
  };

  // ── Abrir modal ──────────────────────────────────────────────────────────
  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImgPreview("");
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (n) => {
    setEditingId(n.id);
    setForm({
      titulo:       n.titulo,
      descripcion:  n.descripcion,
      imagen:       n.imagen || "",
      fecha:        n.fecha ? n.fecha.slice(0, 10) : new Date().toISOString().slice(0, 10),
      clasificacion: n.clasificacion,
      estado:       n.estado,
      destacada:    n.destacada || false,
    });
    setImgPreview(n.imagen || "");
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImgPreview("");
    setFormError("");
  };

  // ── Guardar ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.titulo.trim() || !form.descripcion.trim() || !form.fecha) {
      setFormError("Título, descripción y fecha son obligatorios.");
      return;
    }

    if (!burocrataId) {
      setFormError("No se pudo identificar tu perfil de burócrata.");
      return;
    }

    const payload = {
      titulo:        form.titulo.trim(),
      descripcion:   form.descripcion.trim(),
      autorId:       burocrataId,
      imagen:        form.imagen || undefined,
      fecha:         form.fecha,
      clasificacion: form.clasificacion,
      estado:        form.estado,
      destacada:     form.destacada,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateNoticiaRequest(editingId, payload);
        setSuccess("✅ Noticia actualizada correctamente.");
      } else {
        await createNoticiaRequest(payload);
        setSuccess("✅ Noticia creada correctamente.");
      }
      closeModal();
      fetchNoticias();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Error al guardar la noticia."
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteNoticiaRequest(confirmDelete);
      setNoticias((prev) => prev.filter((n) => n.id !== confirmDelete));
      setSuccess("🗑️ Noticia eliminada.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError("Error al eliminar la noticia.");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  // ── Toggle destacada (acción rápida) ─────────────────────────────────────
  const toggleDestacada = async (n) => {
    try {
      await patchNoticiaRequest(n.id, {
        autorId:   n.autor?.id,
        destacada: !n.destacada,
      });
      setNoticias((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, destacada: !x.destacada } : x))
      );
    } catch (e) {
      setError("No se pudo actualizar la noticia.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <BurocrataLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Encabezado */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              📰 Gestión de Noticias
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Creá, editá y publicá noticias para los metahumanos.
            </p>
          </div>
          <button
            onClick={openNew}
            className="cursor-pointer flex items-center gap-2 bg-[#f1a035] hover:bg-[#d98e2b] text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            ✏️ Nueva Noticia
          </button>
        </div>

        {/* Alertas globales */}
        {success && (
          <div className="mb-4 bg-emerald-900/60 border border-emerald-600 text-emerald-200 px-4 py-3 rounded-xl text-sm font-medium animate-fadeIn">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-900/60 border border-red-600 text-red-200 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Búsqueda */}
          <input
            type="text"
            placeholder="🔍 Buscar por título o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="bg-black/30 border border-white/20 text-white placeholder-white/40 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:border-[#f1a035] transition"
          />
          {/* Clasificación */}
          <select
            value={filtroClasif}
            onChange={(e) => setFiltroClasif(e.target.value)}
            className="cursor-pointer bg-black/30 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f1a035] transition"
          >
            <option value="TODAS">Todas las clasificaciones</option>
            {CLASIFICACIONES.map((c) => (
              <option key={c} value={c}>
                {CLASIFICACION_CONFIG[c].icon} {c}
              </option>
            ))}
          </select>
          {/* Estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="cursor-pointer bg-black/30 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f1a035] transition"
          >
            <option value="TODOS">Todos los estados</option>
            {ESTADOS.map((s) => (
              <option key={s} value={s}>
                {ESTADO_CONFIG[s].label}
              </option>
            ))}
          </select>
          {/* Contador */}
          <div className="flex items-center text-white/50 text-xs font-medium px-2">
            {noticiasFiltradas.length} resultado{noticiasFiltradas.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Tabla / Cards de noticias */}
        {loading ? (
          <div className="flex justify-center items-center py-24 text-white/60 text-lg gap-3">
            <div className="w-6 h-6 border-2 border-white/30 border-t-[#f1a035] rounded-full animate-spin" />
            Cargando noticias...
          </div>
        ) : noticiasFiltradas.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-medium">No hay noticias que coincidan con los filtros.</p>
            <button
              onClick={openNew}
              className="cursor-pointer mt-4 text-[#f1a035] underline text-sm hover:text-[#d98e2b]"
            >
              Crear la primera noticia
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {noticiasFiltradas.map((n) => {
              const clasif = CLASIFICACION_CONFIG[n.clasificacion] || CLASIFICACION_CONFIG.GENERAL;
              const estado = ESTADO_CONFIG[n.estado] || ESTADO_CONFIG.BORRADOR;
              return (
                <div
                  key={n.id}
                  className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 hover:border-[#f1a035]/40 transition-all duration-200 group"
                >
                  {/* Imagen */}
                  {n.imagen ? (
                    <img
                      src={n.imagen}
                      alt={n.titulo}
                      className="w-full sm:w-28 h-28 object-cover rounded-xl flex-shrink-0 border border-white/10"
                    />
                  ) : (
                    <div className="w-full sm:w-28 h-28 bg-white/5 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 border border-white/10">
                      {clasif.icon}
                    </div>
                  )}

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Clasificación */}
                      <span className={`${clasif.color} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                        {clasif.icon} {n.clasificacion}
                      </span>
                      {/* Estado */}
                      <span className={`${estado.color} text-xs font-bold px-2 py-0.5 rounded-full`}>
                        {estado.label}
                      </span>
                      {/* Destacada */}
                      {n.destacada && (
                        <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-xs font-bold px-2 py-0.5 rounded-full">
                          ⭐ Destacada
                        </span>
                      )}
                    </div>

                    <h2 className="text-white font-bold text-base leading-tight mb-1 truncate">
                      {n.titulo}
                    </h2>
                    <p className="text-white/55 text-sm line-clamp-2 mb-2">{n.descripcion}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40">
                      <span>📅 {new Date(n.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                      {n.autor?.nombre && <span>👤 {n.autor.nombre}</span>}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex sm:flex-col gap-2 justify-end flex-shrink-0">
                    {/* Destacar */}
                    <button
                      onClick={() => toggleDestacada(n)}
                      title={n.destacada ? "Quitar de destacadas" : "Marcar como destacada"}
                      className={`cursor-pointer p-2 rounded-lg border transition-all duration-200 ${
                        n.destacada
                          ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30"
                          : "bg-white/5 border-white/10 text-white/40 hover:text-yellow-300 hover:border-yellow-500/50"
                      }`}
                    >
                      ⭐
                    </button>
                    {/* Editar */}
                    <button
                      onClick={() => openEdit(n)}
                      className="cursor-pointer p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/40 transition-all duration-200"
                    >
                      ✏️
                    </button>
                    {/* Eliminar */}
                    <button
                      onClick={() => setConfirmDelete(n.id)}
                      className="cursor-pointer p-2 rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/40 transition-all duration-200"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal: Crear / Editar ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1e1c2a] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Cabecera modal */}
            <div className="sticky top-0 bg-[#1e1c2a] border-b border-white/10 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-white font-bold text-xl flex items-center gap-2">
                {editingId ? "✏️ Editar Noticia" : "📰 Nueva Noticia"}
              </h2>
              <button
                onClick={closeModal}
                className="cursor-pointer text-white/50 hover:text-white text-2xl transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
              {formError && (
                <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-xl text-sm">
                  {formError}
                </div>
              )}

              {/* Título */}
              <div>
                <label className="block text-white/70 text-sm font-semibold mb-1">
                  Título <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Título de la noticia"
                  className="w-full bg-black/30 border border-white/15 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f1a035] transition placeholder-white/30"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-white/70 text-sm font-semibold mb-1">
                  Descripción <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={5}
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Cuerpo completo de la noticia..."
                  className="w-full bg-black/30 border border-white/15 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f1a035] transition placeholder-white/30 resize-none"
                />
              </div>

              {/* Fecha + Clasificación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm font-semibold mb-1">
                    Fecha <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                    className="cursor-pointer w-full bg-black/30 border border-white/15 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f1a035] transition"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-semibold mb-1">
                    Clasificación
                  </label>
                  <select
                    value={form.clasificacion}
                    onChange={(e) => setForm((f) => ({ ...f, clasificacion: e.target.value }))}
                    className="cursor-pointer w-full bg-black/30 border border-white/15 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f1a035] transition"
                  >
                    {CLASIFICACIONES.map((c) => (
                      <option key={c} value={c} className="bg-slate-800">
                        {CLASIFICACION_CONFIG[c].icon} {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estado + Destacada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm font-semibold mb-1">
                    Estado editorial
                  </label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
                    className="cursor-pointer w-full bg-black/30 border border-white/15 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f1a035] transition"
                  >
                    {ESTADOS.map((s) => (
                      <option key={s} value={s} className="bg-slate-800">
                        {ESTADO_CONFIG[s].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => setForm((f) => ({ ...f, destacada: !f.destacada }))}
                      className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 relative cursor-pointer ${
                        form.destacada ? "bg-yellow-500" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md absolute transition-all duration-300 ${
                          form.destacada ? "left-6" : "left-0.5"
                        }`}
                      />
                    </div>
                    <span className="text-white/70 text-sm font-semibold select-none">
                      ⭐ Marcar como destacada
                    </span>
                  </label>
                </div>
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-white/70 text-sm font-semibold mb-1">
                  Imagen (opcional)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 text-sm font-medium px-4 py-2.5 rounded-xl transition"
                  >
                    📷 Seleccionar imagen
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFile}
                  />
                  {imgPreview && (
                    <div className="relative group">
                      <img
                        src={imgPreview}
                        alt="Preview"
                        className="h-20 w-32 object-cover rounded-xl border border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImgPreview("");
                          setForm((f) => ({ ...f, imagen: "" }));
                        }}
                        className="cursor-pointer absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500 transition"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 justify-end pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="cursor-pointer px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer px-6 py-2.5 rounded-xl bg-[#f1a035] hover:bg-[#d98e2b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : editingId ? (
                    "💾 Guardar Cambios"
                  ) : (
                    "📰 Crear Noticia"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Confirmar eliminación ──────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1c2a] border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="text-5xl mb-3">🗑️</div>
            <h3 className="text-white font-bold text-lg mb-2">¿Eliminar noticia?</h3>
            <p className="text-white/50 text-sm mb-6">
              Esta acción es irreversible. La noticia será eliminada permanentemente.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmDelete(null)}
                className="cursor-pointer px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="cursor-pointer px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-sm transition flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Sí, eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </BurocrataLayout>
  );
}
