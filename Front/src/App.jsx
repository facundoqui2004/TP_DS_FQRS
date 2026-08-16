import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// PAGES
import {
  // Generales
  Home,
  LoginPage,
  RegisterPage,

  // Admin
  HomeAdmin,
  GestionarUsuarios,
  GestionarMetahumanos,
  GestionarBurocratas,
  Tramites,
  MiPerfil as MiPerfilAdmin,
  Soporte as SoporteAdmin,
  AprobarTramites,

  // Metahumanos
  HomeMeta,
  TramitesMetaHumano,
  CarpetasMeta,
  CrearPoderes,
  SoporteMeta,
  VigilarMundo,

  // Burócratas
  HomeBurocrata,
  CarpetasList,
  CrearCarpeta,
  CarpetaDetalle,
  SoporteBuro,
  GestionNoticias,

  // Metahumanos extra
  NoticiasMetahumano,

} from './pages';
import MiPerfilBuro from './pages/burocrata/MiPerfil';
import MiPerfilMeta from './pages/meta/PerfilMeta';
// Importar componentes adicionales
import GestionarPoderes from './pages/admin/tramites/gestionar-poderes';
import GestionarMultas from './pages/admin/tramites/gestionar-multas';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Generales (Públicas) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin (Protegidas: ADMIN) */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><HomeAdmin /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={['ADMIN']}><GestionarUsuarios /></ProtectedRoute>} />
          <Route path="/admin/metahumanos" element={<ProtectedRoute allowedRoles={['ADMIN']}><GestionarMetahumanos /></ProtectedRoute>} />
          <Route path="/admin/burocratas" element={<ProtectedRoute allowedRoles={['ADMIN']}><GestionarBurocratas /></ProtectedRoute>} />
          <Route path="/admin/tramites" element={<ProtectedRoute allowedRoles={['ADMIN']}><Tramites /></ProtectedRoute>} />
          <Route path="/admin/tramites/crear-poderes" element={<ProtectedRoute allowedRoles={['ADMIN']}><CrearPoderes /></ProtectedRoute>} />
          <Route path="/admin/tramites/gestionar-poderes" element={<ProtectedRoute allowedRoles={['ADMIN']}><GestionarPoderes /></ProtectedRoute>} />
          <Route path="/admin/tramites/gestionar-multas" element={<ProtectedRoute allowedRoles={['ADMIN']}><GestionarMultas /></ProtectedRoute>} />
          <Route path="/admin/tramites/aprobar-tramites" element={<ProtectedRoute allowedRoles={['ADMIN']}><AprobarTramites /></ProtectedRoute>} />
          <Route path="/admin/perfil" element={<ProtectedRoute allowedRoles={['ADMIN']}><MiPerfilAdmin /></ProtectedRoute>} />
          <Route path="/admin/soporte" element={<ProtectedRoute allowedRoles={['ADMIN']}><SoporteAdmin /></ProtectedRoute>} />

          {/* Metahumanos (Protegidas: METAHUMANO, ADMIN) */}
          <Route path="/metahumano" element={<ProtectedRoute allowedRoles={['METAHUMANO', 'ADMIN']}><HomeMeta /></ProtectedRoute>} />
          <Route path="/metahumano/tramites" element={<ProtectedRoute allowedRoles={['METAHUMANO', 'ADMIN']}><TramitesMetaHumano /></ProtectedRoute>} />
          <Route path="/metahumano/carpetas" element={<ProtectedRoute allowedRoles={['METAHUMANO', 'ADMIN']}><CarpetasMeta /></ProtectedRoute>} />
          <Route path="/metahumano/poderes/crear" element={<ProtectedRoute allowedRoles={['METAHUMANO', 'ADMIN']}><CrearPoderes /></ProtectedRoute>} />
          <Route path="/metahumano/soporte" element={<ProtectedRoute allowedRoles={['METAHUMANO', 'ADMIN']}><SoporteMeta /></ProtectedRoute>} />
          <Route path="/metahumano/perfil" element={<ProtectedRoute allowedRoles={['METAHUMANO', 'ADMIN']}><MiPerfilMeta /></ProtectedRoute>} />
          <Route path="/metahumano/vigilar-mundo" element={<ProtectedRoute allowedRoles={['METAHUMANO', 'ADMIN']}><VigilarMundo /></ProtectedRoute>} />
          <Route path="/metahumano/noticias" element={<ProtectedRoute allowedRoles={['METAHUMANO', 'ADMIN']}><NoticiasMetahumano /></ProtectedRoute>} />

          {/* Burócratas (Protegidas: BUROCRATA, ADMIN) */}
          <Route path="/burocrata" element={<ProtectedRoute allowedRoles={['BUROCRATA', 'ADMIN']}><HomeBurocrata /></ProtectedRoute>} />
          <Route path="/burocrata/carpetas" element={<ProtectedRoute allowedRoles={['BUROCRATA', 'ADMIN']}><CarpetasList /></ProtectedRoute>} />
          <Route path="/burocrata/carpeta/crear" element={<ProtectedRoute allowedRoles={['BUROCRATA', 'ADMIN']}><CrearCarpeta /></ProtectedRoute>} />
          <Route path="/burocrata/carpeta/:id" element={<ProtectedRoute allowedRoles={['BUROCRATA', 'ADMIN']}><CarpetaDetalle /></ProtectedRoute>} />
          <Route path="/burocrata/perfil" element={<ProtectedRoute allowedRoles={['BUROCRATA', 'ADMIN']}><MiPerfilBuro /></ProtectedRoute>} />
          <Route path="/burocrata/soporte" element={<ProtectedRoute allowedRoles={['BUROCRATA', 'ADMIN']}><SoporteBuro /></ProtectedRoute>} />
          <Route path="/burocrata/noticias" element={<ProtectedRoute allowedRoles={['BUROCRATA', 'ADMIN']}><GestionNoticias /></ProtectedRoute>} />
          <Route path="/burocrata/vigilar-mundo" element={<ProtectedRoute allowedRoles={['BUROCRATA', 'ADMIN']}><VigilarMundo /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
