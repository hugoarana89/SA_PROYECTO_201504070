import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { restaurantService, menuService } from '../../services/restaurant.service';
import type { Restaurant, MenuItem, CreateMenuItemDto } from '../../types/restaurant.types';
import { getUser } from '../../utils/authStorage';
import Spinner from '../../components/Spinner';

const ManageMenu: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<CreateMenuItemDto>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    is_available: true,
  });
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const user = getUser();

  // Cargar restaurantes al iniciar
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Cargar menú cuando se selecciona un restaurante
  useEffect(() => {
    if (selectedRestaurantId) {
      loadMenuItems();
    } else {
      setMenuItems([]);
    }
  }, [selectedRestaurantId, showOnlyAvailable]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurants({
        onlyActive: true,
        limit: 100, // Cargar suficientes restaurantes
      });
      setRestaurants(data.restaurants);
      
      // Si hay restaurantes, seleccionar el primero por defecto
      if (data.restaurants.length > 0) {
        setSelectedRestaurantId(data.restaurants[0].id);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    if (!selectedRestaurantId) return;
    
    try {
      setLoadingMenu(true);
      const data = await menuService.getMenuItems(selectedRestaurantId, {
        onlyAvailable: showOnlyAvailable,
        limit: 50,
      });
      setMenuItems(data.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el menú');
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRestaurantId) {
      setError('Debes seleccionar un restaurante');
      return;
    }
    
    try {
      if (editingItem) {
        await menuService.updateMenuItem(editingItem.id, {
          ...formData,
          restaurant_id: selectedRestaurantId,
        });
      } else {
        await menuService.createMenuItem(selectedRestaurantId, formData);
      }
      setShowModal(false);
      resetForm();
      loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedRestaurantId) return;
    if (!window.confirm('¿Estás seguro de eliminar este item del menú?')) return;
    
    try {
      await menuService.deleteMenuItem(id, selectedRestaurantId);
      loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar item');
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    if (!selectedRestaurantId) return;
    
    try {
      await menuService.updateMenuItem(item.id, {
        is_available: !item.is_available,
        restaurant_id: selectedRestaurantId,
      });
      loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar disponibilidad');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      image_url: '',
      is_available: true,
    });
    setEditingItem(null);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url || '',
      is_available: item.is_available,
    });
    setShowModal(true);
  };

  const handleRestaurantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRestaurantId(e.target.value);
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const defaultImage = 'https://placehold.jp/24/3d4070/ffffff/400x200.png?text=Restaurante';
  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
              Gestión de Menú
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Administra los platillos y bebidas de tus restaurantes
            </p>
          </div>
        </div>

        {/* Selector de Restaurante */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Restaurante
              </label>
              <div className="relative">
                <BuildingStorefrontIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="restaurant"
                  value={selectedRestaurantId}
                  onChange={handleRestaurantChange}
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Selecciona un restaurante</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} - {restaurant.address}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar restaurante
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Escribe para filtrar..."
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {selectedRestaurant && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-indigo-900">{selectedRestaurant.name}</h3>
                <p className="text-sm text-indigo-700">{selectedRestaurant.address}</p>
                <p className="text-sm text-indigo-700">Horario: {selectedRestaurant.opening_time} - {selectedRestaurant.closing_time}</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Nuevo Platillo
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showOnlyAvailable"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="showOnlyAvailable" className="ml-2 block text-sm text-gray-900">
              Mostrar solo items disponibles
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        )}

        {/* Lista de items */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : !selectedRestaurantId ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay restaurante seleccionado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Selecciona un restaurante para gestionar su menú
            </p>
          </div>
        ) : loadingMenu ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No hay items en el menú de este restaurante</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Agregar primer platillo
            </button>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {menuItems.map((item) => (
                <li key={item.id} className="px-6 py-5 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-20 w-20 rounded-lg object-cover"
                        src={item.image_url || defaultImage}
                        alt={item.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-medium text-indigo-600">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold text-gray-900">
                            Q{item.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4">
                        <button
                          onClick={() => handleToggleAvailable(item)}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                            item.is_available
                              ? 'text-red-700 bg-red-100 hover:bg-red-200'
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          }`}
                        >
                          {item.is_available ? 'Marcar no disponible' : 'Marcar disponible'}
                        </button>
                        {!item.is_available && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            No disponible
                          </span>
                        )}
                      </div>
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
                      {editingItem ? 'Editar Platillo' : 'Nuevo Platillo'}
                    </h3>
                    
                    {selectedRestaurant && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Restaurante:</span> {selectedRestaurant.name}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Precio (Q) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          URL de la imagen (opcional)
                        </label>
                        <input
                          type="url"
                          value={formData.image_url}
                          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {formData.image_url && (
                          <div className="mt-2">
                            <img 
                              src={formData.image_url} 
                              alt="Vista previa" 
                              className="h-20 w-20 object-cover rounded-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = defaultImage;
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_available"
                          checked={formData.is_available}
                          onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                          Disponible para ordenar
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {editingItem ? 'Actualizar' : 'Crear'}
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

export default ManageMenu;