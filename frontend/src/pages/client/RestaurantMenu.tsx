import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, ClockIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { restaurantService, menuService } from '../../services/restaurant.service';
import type { Restaurant, MenuItem } from '../../types/restaurant.types';
import Spinner from '../../components/Spinner';

const RestaurantMenu: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadRestaurantData();
    }
  }, [id]);

  const loadRestaurantData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [restaurantData, menuData] = await Promise.all([
        restaurantService.getRestaurantById(id),
        menuService.getMenuItems(id, { onlyAvailable: true })
      ]);
      
      setRestaurant(restaurantData);
      setMenuItems(menuData.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos del restaurante');
    } finally {
      setLoading(false);
    }
  };

  const defaultImage = 'https://placehold.jp/24/3d4070/ffffff/400x300.png?text=Platillo';
  const defaultRestaurantImage = 'https://placehold.jp/24/3d4070/ffffff/1200x400.png?text=Restaurante';
  

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || 'Restaurante no encontrado'}</p>
        <Link to="/" className="text-indigo-600 hover:text-indigo-800">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del restaurante */}
      <div className="relative h-64 md:h-80">
        <img
          src={defaultRestaurantImage}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <Link
              to="/"
              className="inline-flex items-center text-white mb-4 hover:text-gray-200"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Volver a restaurantes
            </Link>
            <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-lg mb-4">{restaurant.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                {restaurant.opening_time} - {restaurant.closing_time}
              </span>
              <span className="flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                {restaurant.address}
              </span>
              <span className="flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2" />
                {restaurant.phone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menú */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Nuestro Menú</h2>

        {menuItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Este restaurante aún no tiene items en su menú</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-48 bg-gray-200">
                  <img
                    src={item.image_url || defaultImage}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-lg font-bold text-indigo-600">
                      Q{item.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  
                  {item.is_available ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Disponible
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      No disponible
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;