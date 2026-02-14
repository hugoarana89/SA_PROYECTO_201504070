import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { restaurantService } from '../../services/restaurant.service';
import type { Restaurant, CreateRestaurantDto } from '../../types/restaurant.types';
import { getUser } from '../../utils/authStorage';
import Spinner from '../../components/Spinner';

const AdminRestaurants: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState<CreateRestaurantDto>({
    name: '',
    description: '',
    address: '',
    phone: '',
    opening_time: '08:00',
    closing_time: '22:00',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const user = getUser();

  useEffect(() => {
    loadRestaurants();
  }, [searchTerm, showInactive]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurants({
        search: searchTerm || undefined,
        onlyActive: !showInactive,
        limit: 50,
      });
      setRestaurants(data.restaurants);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRestaurant) {
        await restaurantService.updateRestaurant(editingRestaurant.id, formData);
      } else {
        await restaurantService.createRestaurant(formData);
      }
      setShowModal(false);
      resetForm();
      loadRestaurants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar restaurante');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este restaurante?')) return;
    
    try {
      await restaurantService.deleteRestaurant(id);
      loadRestaurants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar restaurante');
    }
  };

  const handleToggleActive = async (restaurant: Restaurant) => {
    try {
      await restaurantService.updateRestaurant(restaurant.id, {
        is_active: !restaurant.is_active,
      });
      loadRestaurants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      opening_time: '08:00',
      closing_time: '22:00',
    });
    setEditingRestaurant(null);
  };

  const openEditModal = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      phone: restaurant.phone,
      opening_time: restaurant.opening_time,
      closing_time: restaurant.closing_time,
    });
    setShowModal(true);
  };

  const defaultImage = 'https://placehold.jp/24/3d4070/ffffff/400x200.png?text=Restaurante';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
              Gestión de Restaurantes
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Nuevo Restaurante
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Buscar restaurante
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre del restaurante..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showInactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="showInactive" className="ml-2 block text-sm text-gray-900">
                Mostrar restaurantes inactivos
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        )}

        {/* Lista de restaurantes */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {restaurants.map((restaurant) => (
                <li key={restaurant.id} className="px-6 py-5 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    {/* <div className="flex-shrink-0">
                      <img
                        className="h-16 w-16 rounded-lg object-cover"
                        src={defaultImage}
                        alt={restaurant.name}
                      />
                    </div> */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {restaurant.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            restaurant.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {restaurant.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                          <button
                            onClick={() => openEditModal(restaurant)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(restaurant.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{restaurant.description}</p>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500">
                        <span>📍 {restaurant.address}</span>
                        <span>📞 {restaurant.phone}</span>
                        <span>🕒 {restaurant.opening_time} - {restaurant.closing_time}</span>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleToggleActive(restaurant)}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                          restaurant.is_active
                            ? 'text-red-700 bg-red-100 hover:bg-red-200'
                            : 'text-green-700 bg-green-100 hover:bg-green-200'
                        }`}
                      >
                        {restaurant.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal de creación/edición */}
        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {editingRestaurant ? 'Editar Restaurante' : 'Nuevo Restaurante'}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                        <input
                          type="text"
                          required
                          placeholder='Ingrese el nombre del restaurante'
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea
                          value={formData.description}
                          placeholder='Ingrese una descripción del restaurante'
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Dirección *</label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          placeholder='Ingrese la dirección completa (calle, ciudad, estado, país)'
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
                        <input
                          type="text"
                          required
                          value={formData.phone}
                          placeholder='Ingrese el número de teléfono'
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Hora apertura *</label>
                          <input
                            type="time"
                            required
                            value={formData.opening_time}
                            onChange={(e) => setFormData({...formData, opening_time: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Hora cierre *</label>
                          <input
                            type="time"
                            required
                            value={formData.closing_time}
                            onChange={(e) => setFormData({...formData, closing_time: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {editingRestaurant ? 'Actualizar' : 'Crear'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRestaurants;