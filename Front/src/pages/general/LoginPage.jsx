import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaSignInAlt, FaHome } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import UserLayout from "../../components/layouts/UserLayout";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, user, getHomeRouteByRole, login, error } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    console.log('LoginPage useEffect - isAuthenticated:', isAuthenticated);
    console.log('LoginPage useEffect - user:', user);
    if (isAuthenticated && user) {
      console.log('Usuario autenticado, obteniendo ruta...');
      const homeRoute = getHomeRouteByRole();
      console.log('Navegando a:', homeRoute);
      console.log('Rol del usuario para redirección:', user.role);
      navigate(homeRoute);
    } else {
      console.log('No se puede redirigir - isAuthenticated:', isAuthenticated, 'user:', user);
    }
  }, [isAuthenticated, user, navigate, getHomeRouteByRole]);

  const onSubmit = async (data) => {
    console.log('LoginPage - Intentando login con:', data);
    const result = await login({
      email: data.email,
      password: data.password
    });
    
    console.log('LoginPage - Resultado del login:', result);
    
    if (result.success) {
      console.log('LoginPage - Login exitoso:', result.data);
      console.log('LoginPage - Rol asignado:', result.data?.role);
    } else {
      console.error('LoginPage - Error en login:', result.error);
    }
  };

  return (
    <UserLayout>
      <main className="bg-[#262837] min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#1F1D2B] rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#ec7c6a] rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSignInAlt className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Iniciar Sesión</h1>
            <p className="text-gray-400">Accede a tu cuenta en El Súper Gestor</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-900 bg-opacity-50 border border-red-500 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
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
                  className={`w-full pl-10 pr-4 py-3 bg-[#262837] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec7c6a] ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="ejemplo@correo.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
                  })}
                  className={`w-full pl-10 pr-12 py-3 bg-[#262837] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec7c6a] ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#ec7c6a] text-white py-3 px-4 rounded-lg hover:bg-[#d66b59] focus:outline-none focus:ring-2 focus:ring-[#ec7c6a] focus:ring-offset-2 transition duration-200 font-medium transform hover:scale-105 active:scale-95"
            >
              <FaSignInAlt className="inline mr-2" />
              Iniciar Sesión
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link 
                to="/register" 
                className="text-sm text-gray-400 hover:text-[#ec7c6a] transition-colors duration-200"
              >
                ¿No tienes cuenta? <span className="text-[#ec7c6a] font-medium">Crear una nueva</span>
              </Link>
            </div>
            
            <div className="text-center border-t border-gray-700 pt-4">
              <Link 
                to="/" 
                className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FaHome className="mr-2" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </main>
    </UserLayout>
  );
};

export default LoginPage;
