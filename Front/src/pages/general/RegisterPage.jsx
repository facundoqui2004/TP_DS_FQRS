import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/footer';
import Sidebar from '../../components/shared/SidebarUser';
import { useAuth } from '../../context/AuthContext';
import UserLayout from "../../components/layouts/UserLayout";

export default function RegistroForm() {
  const [selectedRole, setSelectedRole] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm();
  const { signup, login, error, isAuthenticated, user, getHomeRouteByRole } = useAuth();
  const navigate = useNavigate();

  const password = watch('password');
  
  useEffect(() => { 
    console.log('useEffect Register - isAuthenticated:', isAuthenticated, 'user:', user);
    if (isAuthenticated && user) {
      console.log('Usuario registrado y autenticado, obteniendo ruta...');
      const homeRoute = getHomeRouteByRole();
      console.log('Navegando a:', homeRoute);
      navigate(homeRoute);
    }
  }, [isAuthenticated, user, navigate, getHomeRouteByRole]);

  const registerAndLogin = async (payload, rol) => {
    try {
      console.log('Iniciando registro para rol:', rol);
      console.log('Datos del payload:', payload);
      
      // registrar usuario
      const userType = rol === 'METAHUMANO' ? 'metahumano' : 'burocrata';
      const registerResult = await signup(payload, userType);
      
      if (registerResult.success) {
        console.log('Registro exitoso:', registerResult.data);
        
        // login automatico
        const loginResult = await login({
          email: payload.email,
          password: payload.password
        });
        
        if (loginResult.success) {
          console.log('Login automático exitoso:', loginResult.data);

          // redireccion en el useEffect
          return { success: true, data: loginResult.data };
        } else {
          console.error('Error en login automático:', loginResult.error);
          // Si el registro es exitoso pero el login falla, redirigir a login manual
          navigate('/login');
          return { success: false, error: 'Cuenta creada. Por favor, inicia sesión manualmente.' };
        }
      } else {
        console.error('Error en registro:', registerResult.error);
        return registerResult;
      }
    } catch (error) {
      console.error('Error en registerAndLogin:', error);
      return { success: false, error: error.message || 'Error desconocido' };
    }
  };

  const onSubmit = async (data) => {
    console.log('Intentando registro con:', data);
    
    // Validar que las contraseñas coincidan
    if (data.password !== data.confirmPassword) {
      console.error('Las contraseñas no coinciden');
      return;
    }
    
    // preparar datos según backend
    const backendData = {
      email: data.email,
      telefono: data.telefono,
      password: data.password,
      nombre: data.nombre,
      alias: data.alias || data.nombre,
      origen: data.origen || "Registro Web"
    };
    
    const result = await registerAndLogin(backendData, selectedRole);
    console.log('Resultado del proceso completo:', result);
    
    if (!result.success) {
      console.error('Error en el proceso:', result.error);
    }
  };

  // Campos de rol
  const getRoleSpecificFields = () => {
    if (!selectedRole) return null;
    
    return (
      <>
        <div>
          <label htmlFor="alias" className="block text-sm font-medium text-gray-300 mb-2">
            Alias {selectedRole === 'METAHUMANO' ? '(nombre héroe)' : '(nombre profesional)'}
          </label>
          <input
            id="alias"
            type="text"
            {...register('alias', {
              required: 'El alias es requerido',
              minLength: {
                value: 2,
                message: 'El alias debe tener al menos 2 caracteres'
              }
            })}
            className={`w-full px-3 py-3 bg-[#262837] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec7c6a] ${
              errors.alias ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder={selectedRole === 'METAHUMANO' ? 'Ej: Súper Facundo' : 'Ej: Dr. Facundo'}
          />
          {errors.alias && (
            <p className="mt-1 text-sm text-red-400">{errors.alias.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="origen" className="block text-sm font-medium text-gray-300 mb-2">
            Origen {selectedRole === 'METAHUMANO' ? '(origen de poderes)' : '(departamento/institución)'}
          </label>
          <input
            id="origen"
            type="text"
            {...register('origen', {
              required: 'El origen es requerido',
              minLength: {
                value: 3,
                message: 'El origen debe tener al menos 3 caracteres'
              }
            })}
            className={`w-full px-3 py-3 bg-[#262837] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec7c6a] ${
              errors.origen ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder={selectedRole === 'METAHUMANO' ? 'Ej: Laboratorio de Testing' : 'Ej: Departamento de Testing'}
          />
          {errors.origen && (
            <p className="mt-1 text-sm text-red-400">{errors.origen.message}</p>
          )}
        </div>
      </>
    );
  };

  return (
    <UserLayout>
      <main className="bg-[#262837] min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#1F1D2B] rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#ec7c6a] rounded-full flex items-center justify-center mx-auto mb-4">
              <img
                src="/Images/super-heroe.png"
                alt="Register"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Registro</h1>
            <p className="text-gray-400">Únete a El Súper Gestor</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Selector de Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Selecciona tu rol
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('METAHUMANO');
                    reset();
                  }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedRole === 'METAHUMANO'
                      ? 'border-[#ec7c6a] bg-[#ec7c6a]/10 text-[#ec7c6a]'
                      : 'border-gray-600 bg-[#262837] text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🦸‍♂️</div>
                    <div className="font-medium">Metahumano</div>
                    <div className="text-xs opacity-75">Individuo con poderes</div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('BUROCRATA');
                    reset();
                  }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedRole === 'BUROCRATA'
                      ? 'border-[#ec7c6a] bg-[#ec7c6a]/10 text-[#ec7c6a]'
                      : 'border-gray-600 bg-[#262837] text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">📋</div>
                    <div className="font-medium">Burócrata</div>
                    <div className="text-xs opacity-75">Funcionario del gobierno</div>
                  </div>
                </button>
              </div>
              {!selectedRole && (
                <p className="mt-2 text-sm text-yellow-400">⚠️ Selecciona un rol para continuar</p>
              )}
            </div>

            {/* formulario */}
            {selectedRole && (
              <>
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre completo
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    {...register('nombre', {
                      required: 'El nombre es requerido',
                      minLength: {
                        value: 2,
                        message: 'El nombre debe tener al menos 2 caracteres'
                      }
                    })}
                    className={`w-full px-3 py-3 bg-[#262837] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec7c6a] ${
                      errors.nombre ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Ingresa tu nombre completo"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-400">{errors.nombre.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'El correo electrónico es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Formato de correo electrónico inválido'
                      }
                    })}
                    className={`w-full px-3 py-3 bg-[#262837] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec7c6a] ${
                      errors.email ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="ejemplo@correo.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    {...register('telefono', {
                      required: 'El teléfono es requerido',
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: 'Formato de teléfono inválido (ej: +1-555-000-0000)'
                      }
                    })}
                    className={`w-full px-3 py-3 bg-[#262837] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec7c6a] ${
                      errors.telefono ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="+1-555-000-0000"
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-red-400">{errors.telefono.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 8,
                        message: 'La contraseña debe tener al menos 8 caracteres'
                      }
                    })}
                    className={`w-full px-3 py-3 bg-[#262837] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec7c6a] ${
                      errors.password ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Mínimo 8 caracteres"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword', {
                      required: 'La confirmación de contraseña es requerida',
                      validate: (value) => value === password || 'Las contraseñas no coinciden'
                    })}
                    className={`w-full px-3 py-3 bg-[#262837] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec7c6a] ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Confirma tu contraseña"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* campos de rol */}
                {getRoleSpecificFields()}

                {/* submit */}
                <button
                  type="submit"
                  className="w-full bg-[#ec7c6a] text-white py-3 px-4 rounded-lg hover:bg-[#d66b59] focus:outline-none focus:ring-2 focus:ring-[#ec7c6a] focus:ring-offset-2 transition duration-200 font-medium transform hover:scale-105 active:scale-95"
                >
                  🚀 Crear Cuenta como {selectedRole}
                </button>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <a href="/login" className="text-[#ec7c6a] hover:text-[#d66b59] font-medium">
                Iniciar sesión
              </a>
            </p>
          </div>
        </div>
      </main>
    </UserLayout>
  );
}