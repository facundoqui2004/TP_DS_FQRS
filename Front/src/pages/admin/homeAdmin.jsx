import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';

export default function HomeAdmin() {
  const navigate = useNavigate();
  
  return (
    <AdminLayout title="Panel de Administración">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">👑 Portal Administrador</h1>
        <p className="text-gray-400 mb-6">Bienvenido al panel de control para administradores del sistema.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de Gestionar Usuarios */}
        <div 
          className="bg-[#1e293b] rounded-lg p-6 shadow-lg border border-slate-600 cursor-pointer hover:bg-[#334155] transition-colors group"
          onClick={() => navigate('/admin/usuarios')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
              Gestionar Usuarios
            </h3>
            <div className="w-10 h-10 bg-[#0891b2] rounded-full flex items-center justify-center group-hover:bg-[#0ea5e9] transition-colors">
              <span className="text-white font-bold text-xl">👥</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            Administra y gestiona todos los usuarios del sistema
          </p>
          <div className="mt-3 flex items-center text-blue-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Ver todos los usuarios</span>
            <span className="ml-2">→</span>
          </div>
        </div>

        {/* Card de Gestionar Metahumanos */}
        <div 
          className="bg-[#1e293b] rounded-lg p-6 shadow-lg border border-slate-600 cursor-pointer hover:bg-[#334155] transition-colors group"
          onClick={() => navigate('/admin/metahumanos')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
              Gestionar Metahumanos
            </h3>
            <div className="w-10 h-10 bg-[#06b6d4] rounded-full flex items-center justify-center group-hover:bg-[#0891b2] transition-colors">
              <span className="text-white font-bold text-xl">⚡</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            Supervisa y administra todos los metahumanos registrados
          </p>
          <div className="mt-3 flex items-center text-cyan-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Ver todos los metahumanos</span>
            <span className="ml-2">→</span>
          </div>
        </div>

        {/* Card de Gestionar Burócratas */}
        <div 
          className="bg-[#1e293b] rounded-lg p-6 shadow-lg border border-slate-600 cursor-pointer hover:bg-[#334155] transition-colors group"
          onClick={() => navigate('/admin/burocratas')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-500 transition-colors">
              Gestionar Burócratas
            </h3>
            <div className="w-10 h-10 bg-[#0ea5e9] rounded-full flex items-center justify-center group-hover:bg-[#0284c7] transition-colors">
              <span className="text-white font-bold text-xl">🏢</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            Gestiona el personal burocrático del sistema
          </p>
          <div className="mt-3 flex items-center text-blue-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Ver todos los burócratas</span>
            <span className="ml-2">→</span>
          </div>
        </div>

        {/* Card de Mi Perfil */}
        <div 
          className="bg-[#1e293b] rounded-lg p-6 shadow-lg border border-slate-600 cursor-pointer hover:bg-[#334155] transition-colors group"
          onClick={() => navigate('/admin/perfil')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
              Mi Perfil
            </h3>
            <div className="w-10 h-10 bg-[#a855f7] rounded-full flex items-center justify-center group-hover:bg-[#9333ea] transition-colors">
              <span className="text-white font-bold text-xl">👤</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            Visualiza y edita tu información personal
          </p>
          <div className="mt-3 flex items-center text-purple-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Ver mi perfil</span>
            <span className="ml-2">→</span>
          </div>
        </div>

        {/* Card de Trámites */}
        <div 
          className="bg-[#1e293b] rounded-lg p-6 shadow-lg border border-slate-600 cursor-pointer hover:bg-[#334155] transition-colors group"
          onClick={() => navigate('/admin/tramites')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
              Trámites
            </h3>
            <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center group-hover:bg-[#059669] transition-colors">
              <span className="text-white font-bold text-xl">📋</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            Gestiona poderes, multas y otros trámites administrativos
          </p>
          <div className="mt-3 flex items-center text-green-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Ver trámites</span>
            <span className="ml-2">→</span>
          </div>
        </div>

        {/* Card de Soporte */}
        <div 
          className="bg-[#1e293b] rounded-lg p-6 shadow-lg border border-slate-600 cursor-pointer hover:bg-[#334155] transition-colors group"
          onClick={() => navigate('/admin/soporte')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
              Soporte
            </h3>
            <div className="w-10 h-10 bg-[#f97316] rounded-full flex items-center justify-center group-hover:bg-[#ea580c] transition-colors">
              <span className="text-white font-bold text-xl">�</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            Centro de ayuda y asistencia técnica
          </p>
          <div className="mt-3 flex items-center text-orange-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Acceder a soporte</span>
            <span className="ml-2">→</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
