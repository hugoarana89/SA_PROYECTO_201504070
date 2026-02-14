import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  MapPinIcon, 
  PhoneIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { restaurantService, menuService } from '../../services/restaurant.service';
import type { Restaurant, MenuItem } from '../../types/restaurant.types';
import { useCart } from '../../context/CartContext';
import Spinner from '../../components/Spinner';
import { isAuthenticated } from '../../utils/authStorage';

const RestaurantMenu: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showCartNotification, setShowCartNotification] = useState(false);
  
  const { addToCart, cart, getCartCount } = useCart();

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
        menuService.getRestaurantMenu(id)
      ]);
      
      setRestaurant(restaurantData);
      setMenuItems(menuData.items);
      
      // Inicializar cantidades en 0
      const initialQuantities: Record<string, number> = {};
      menuData.items.forEach(item => {
        initialQuantities[item.id] = 0;
      });
      setQuantities(initialQuantities);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos del restaurante');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setQuantities(prev => {
      const newValue = Math.max(0, (prev[itemId] || 0) + delta);
      return { ...prev, [itemId]: newValue };
    });
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 0;
    
    if (quantity === 0) {
      alert('Selecciona una cantidad mayor a 0');
      return;
    }

    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (!restaurant) return;

    // Verificar si ya hay items de otro restaurante en el carrito
    if (cart && cart.restaurant_id !== restaurant.id) {
      if (!window.confirm('Tu carrito contiene items de otro restaurante. ¿Deseas vaciarlo y agregar los nuevos items?')) {
        return;
      }
      // Aquí podríamos limpiar el carrito, pero la lógica de addToCart ya maneja esto
    }

    // Agregar al carrito la cantidad seleccionada
    for (let i = 0; i < quantity; i++) {
      addToCart({
        menu_item_id: item.id,
        product_name: item.name,
        price: item.price,
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
      });
    }

    // Resetear cantidad a 0
    setQuantities(prev => ({ ...prev, [item.id]: 0 }));

    // Mostrar notificación
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 3000);
  };

  const defaultImage = 'https://placehold.jp/24/3d4070/ffffff/400x300.png?text=Platillo';
  const defaultRestaurantImage = 'https://placehold.jp/24/3d4070/ffffff/1200x400.png?text=Restaurante';

  const cartCount = getCartCount();

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
      {/* Notificación de carrito */}
      {showCartNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down">
          <div className="flex items-center">
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            <span>Producto agregado al carrito</span>
          </div>
        </div>
      )}

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
            <div className="flex justify-between items-end">
              <div>
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
              
              {/* Botón del carrito */}
              <Link
                to="/client/orders"
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center"
              >
                <ShoppingCartIcon className="h-6 w-6 mr-2" />
                <span className="font-semibold">Ver Carrito</span>
                {cartCount > 0 && (
                  <span className="ml-2 bg-indigo-600 text-white px-2 py-1 rounded-full text-xs">
                    {cartCount}
                  </span>
                )}
              </Link>
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
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-l-lg"
                        disabled={!item.is_available}
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 text-gray-800 font-medium border-x border-gray-300">
                        {quantities[item.id] || 0}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-r-lg"
                        disabled={!item.is_available}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.is_available || (quantities[item.id] || 0) === 0}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                        item.is_available && (quantities[item.id] || 0) > 0
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Agregar
                    </button>
                  </div>
                  
                  {!item.is_available && (
                    <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
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