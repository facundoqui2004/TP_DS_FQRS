import { FaPhoneAlt, FaEnvelope, FaHeadset, FaQuestionCircle } from "react-icons/fa";
import { MdSupportAgent, MdOutlineForum, MdSecurity } from "react-icons/md";
import AdminLayout from "../../components/layouts/AdminLayout";

export default function Soporte() {
  return (
    <AdminLayout title="Centro de Soporte">
      {/* 🏛️ Encabezado */}
      <section className="text-center text-white mt-8 mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          🛠️ Centro de Soporte Administrativo
        </h1>
        <p className="opacity-90 text-base">
          Accedé a ayuda técnica, contactate con el equipo de desarrollo o consultá las guías de administración.
        </p>
      </section>

      {/* 📦 Contenedor principal */}
      <div className="max-w-3xl mx-auto bg-[#1e293b]/80 backdrop-blur-md rounded-2xl p-8 text-white shadow-xl border border-slate-600 space-y-10">
        
        {/* Sección de contacto directo */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#0891b2]">
            <MdSupportAgent className="text-2xl" /> Contacto directo
          </h2>
          <p className="text-white/80 mb-4">
            Si necesitás asistencia inmediata o tenés problemas críticos con el sistema, podés comunicarte con nosotros por los siguientes medios:
          </p>

          <div className="bg-white/10 p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <FaPhoneAlt className="text-[#0891b2] text-lg" />
              <p><strong>Teléfono prioritario:</strong> +54 11 4321-7788 (Opción 1 - Administradores)</p>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-[#0891b2] text-lg" />
              <p><strong>Email:</strong> admin-soporte@metagov.org</p>
            </div>
            <div className="flex items-center gap-3">
              <FaHeadset className="text-[#0891b2] text-lg" />
              <p><strong>Horario de atención:</strong> 24/7 para administradores del sistema</p>
            </div>
            <div className="flex items-center gap-3">
              <MdSecurity className="text-[#0891b2] text-lg" />
              <p><strong>Emergencias de seguridad:</strong> +54 11 9999-0000 (Línea directa)</p>
            </div>
          </div>
        </section>

        {/* Preguntas frecuentes para administradores */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#0891b2]">
            <FaQuestionCircle className="text-2xl" /> Preguntas frecuentes (Admin)
          </h2>
          <ul className="space-y-4">
            <li className="bg-white/10 p-5 rounded-xl hover:bg-white/15 transition">
              <strong>¿Cómo puedo dar de alta un nuevo usuario?</strong>
              <p className="text-white/70 text-sm mt-1">
                Accedé a "Gestionar Usuarios" desde el panel principal, hacé clic en "Crear Usuario" y completá el formulario con los datos requeridos. El sistema asignará automáticamente las credenciales.
              </p>
            </li>
            <li className="bg-white/10 p-5 rounded-xl hover:bg-white/15 transition">
              <strong>¿Cómo gestiono los permisos de burócratas y metahumanos?</strong>
              <p className="text-white/70 text-sm mt-1">
                Desde las secciones "Gestionar Burócratas" o "Gestionar Metahumanos" podés editar, activar, desactivar o eliminar perfiles. Los cambios se aplican inmediatamente.
              </p>
            </li>
            <li className="bg-white/10 p-5 rounded-xl hover:bg-white/15 transition">
              <strong>¿Qué hago si el sistema presenta un error crítico?</strong>
              <p className="text-white/70 text-sm mt-1">
                Contactá inmediatamente al equipo técnico a través de la línea de emergencias. Registrá el error con capturas de pantalla, hora exacta y pasos para reproducirlo.
              </p>
            </li>
            <li className="bg-white/10 p-5 rounded-xl hover:bg-white/15 transition">
              <strong>¿Cómo puedo ver los logs del sistema?</strong>
              <p className="text-white/70 text-sm mt-1">
                Los administradores tienen acceso a los logs del sistema a través de la sección "Monitoreo" (en desarrollo). Para logs más detallados, solicitá acceso al panel de backend.
              </p>
            </li>
            <li className="bg-white/10 p-5 rounded-xl hover:bg-white/15 transition">
              <strong>¿Puedo modificar los poderes de los metahumanos?</strong>
              <p className="text-white/70 text-sm mt-1">
                Sí, desde "Trámites" → "Gestionar Poderes" podés crear, editar o eliminar poderes del catálogo. Los cambios afectarán a todos los metahumanos que tengan ese poder asignado.
              </p>
            </li>
          </ul>
        </section>

        {/* Recursos para administradores */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#0891b2]">
            <MdOutlineForum className="text-2xl" /> Recursos administrativos
          </h2>
          <p className="text-white/80 mb-4">
            Accedé a recursos exclusivos para administradores del sistema.
          </p>
          <div className="bg-white/10 p-5 rounded-xl space-y-3">
            <p>
              📘 <strong>Manual de administración:</strong>{" "}
              <a href="#" className="text-[#0891b2] underline hover:text-[#0ea5e9]">
                https://docs.metagov.org/admin
              </a>
            </p>
            <p>
              🔐 <strong>Panel de seguridad:</strong>{" "}
              <a href="#" className="text-[#0891b2] underline hover:text-[#0ea5e9]">
                https://security.metagov.org
              </a>
            </p>
            <p>
              📊 <strong>Dashboard de monitoreo:</strong>{" "}
              <a href="#" className="text-[#0891b2] underline hover:text-[#0ea5e9]">
                https://monitor.metagov.org
              </a>
            </p>
            <p>
              💬 <strong>Chat de administradores:</strong>{" "}
              Canal <span className="text-[#0891b2] font-semibold">#admin-support</span> (Slack/Discord)
            </p>
            <p>
              📮 <strong>Sistema de tickets:</strong>{" "}
              <a href="#" className="text-[#0891b2] underline hover:text-[#0ea5e9]">
                https://tickets.metagov.org
              </a>
            </p>
          </div>
        </section>

        {/* Información importante */}
        <section className="bg-yellow-500/10 border border-yellow-500/30 p-5 rounded-xl">
          <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
            ⚠️ Información importante
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>• Como administrador, sos responsable de mantener la seguridad e integridad del sistema.</li>
            <li>• Todas las acciones administrativas quedan registradas en los logs del sistema.</li>
            <li>• No compartas tus credenciales de administrador con nadie.</li>
            <li>• Ante cualquier actividad sospechosa, contactá inmediatamente al equipo de seguridad.</li>
          </ul>
        </section>
      </div>

      {/* Pie de página */}
      <p className="text-center text-white/60 mt-12">
        Última actualización del centro de soporte: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </p>
    </AdminLayout>
  );
}
