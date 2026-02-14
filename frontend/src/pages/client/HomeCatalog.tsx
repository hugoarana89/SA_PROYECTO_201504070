import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { restaurantService } from '../../services/restaurant.service';
import type { Restaurant } from '../../types/restaurant.types';
import Spinner from '../../components/Spinner';

const HomeCatalog: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadRestaurants();
  }, [debouncedSearch]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurants({
        search: debouncedSearch || undefined,
        onlyActive: true,
        limit: 20,
      });
      setRestaurants(data.restaurants);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const defaultImage = 'https://placehold.jp/24/3d4070/ffffff/400x200.png?text=Restaurante';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <h1 className="text-3xl font-bold text-white">Restaurantes disponibles</h1>
          <p className="mt-2 text-indigo-100">Encuentra el lugar perfecto para tu próxima comida</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        {/* Barra de búsqueda */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar restaurantes por nombre..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
            <Spinner size="lg" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No se encontraron restaurantes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/client/restaurants/${restaurant.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={defaultImage}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                    🕒 {restaurant.opening_time} - {restaurant.closing_time}
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{restaurant.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{restaurant.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{restaurant.address}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{restaurant.phone}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeCatalog;