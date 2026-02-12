import React, { useState } from 'react';
import { getAccessToken } from '../../utils/authStorage';
import { CONFIG } from '../../config/config';
import { authFetch } from "../../utils/authFetch";

interface UserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'RESTAURANTE' | 'REPARTIDOR';
}

const AdminUsers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'REPARTIDOR'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor completa todos los campos');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getAccessToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('Enviando datos:', token);
      const response = await authFetch(`${CONFIG.API_URL}/auth/register/admin`, {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`¡${formData.role.toLowerCase()} registrado exitosamente!`);
        
        // Limpiar formulario
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          role: 'REPARTIDOR'
        });

        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        // Manejar errores del backend
        const errorMessage = data.message || data.error || 'Error en el registro';
        setError(errorMessage);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error en la conexión al servidor');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Registro de Usuarios</h1>
        <p className="text-gray-600 mt-2">
          Registra nuevos restaurantes o repartidores en la plataforma
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 p-6">
          <h2 className="text-2xl font-semibold text-white">
            Nuevo Usuario
          </h2>
          <p className="text-slate-200 text-sm mt-1">
            Completa los datos para registrar un nuevo usuario
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-6">
                {/* Campo Email */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center">
                      <svg 
                        className="w-5 h-5 text-slate-600 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" 
                        />
                      </svg>
                      Email
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="ejemplo@correo.com"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Campo Contraseña */}
                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center">
                      <svg 
                        className="w-5 h-5 text-slate-600 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                        />
                      </svg>
                      Contraseña
                    </div>
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="Mínimo 6 caracteres"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-6">
                {/* Campo Tipo de Usuario */}
                <div>
                  <label 
                    htmlFor="role" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center">
                      <svg 
                        className="w-5 h-5 text-slate-600 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                        />
                      </svg>
                      Tipo de Usuario
                    </div>
                  </label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent transition-all duration-200 outline-none bg-white"
                    required
                    disabled={loading}
                  >
                    <option value="REPARTIDOR">Repartidor</option>
                    <option value="RESTAURANTE">Restaurante</option>
                  </select>
                </div>

                {/* Campo Confirmar Contraseña */}
                <div>
                  <label 
                    htmlFor="confirmPassword" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center">
                      <svg 
                        className="w-5 h-5 text-slate-600 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                        />
                      </svg>
                      Confirmar Contraseña
                    </div>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="Repite la contraseña"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Botón de Registro */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-slate-900 text-white py-3 px-8 rounded-lg font-medium hover:bg-slate-800 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <svg 
                      className="w-5 h-5 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    Registrar Usuario
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Mensajes de feedback */}
          <div className="mt-6 space-y-4">
            {/* Mensaje de éxito */}
            {success && (
              <div className="animate-fade-in">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                  <svg 
                    className="w-5 h-5 mr-2 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <span className="text-sm">{success}</span>
                </div>
              </div>
            )}

            {/* Mensaje de error */}
            {error && (
              <div className="animate-fade-in">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <svg 
                    className="w-5 h-5 mr-2 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Información importante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg 
                    className="w-5 h-5 text-blue-600 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                    />
                  </svg>
                  <span className="font-medium text-blue-700">Restaurante</span>
                </div>
                <p className="text-sm text-blue-600">
                  Podrá gestionar su menú y recibir órdenes de clientes
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg 
                    className="w-5 h-5 text-green-600 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                    />
                  </svg>
                  <span className="font-medium text-green-700">Repartidor</span>
                </div>
                <p className="text-sm text-green-600">
                  Podrá ver y aceptar pedidos disponibles para entrega
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;