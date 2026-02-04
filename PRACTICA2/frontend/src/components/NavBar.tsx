import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout, getUser } from "../utils/authStorage";
import {
  HomeIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const NavBar = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const linkClass =
    "flex items-center gap-3 px-4 py-2 rounded hover:bg-slate-700 transition";
  const activeClass = "bg-slate-800 text-white";

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir navegación inmediata
    setIsLoggingOut(true);
    
    try {
      await logout(); // Llama a la función async que envía al backend
      navigate('/login'); // Redirige después de logout exitoso
    } catch (error) {
      console.error('Error during logout:', error);
      // Limpiamos localStorage aunque falle la API
      localStorage.clear();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-900 text-slate-200">
        <div className="p-4 text-xl font-bold">Food Delivery</div>

        <nav className="flex flex-col gap-1">
          {/* CLIENTE */}
          {user?.role === "CLIENTE" && (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${linkClass} ${isActive && activeClass}`
                }
              >
                <HomeIcon className="w-5 h-5" />
                Catálogo
              </NavLink>

              <NavLink
                to="/client/orders"
                className={({ isActive }) =>
                  `${linkClass} ${isActive && activeClass}`
                }
              >
                <ClipboardDocumentListIcon className="w-5 h-5" />
                Mis Órdenes
              </NavLink>
            </>
          )}

          {/* ADMIN */}
          {user?.role === "ADMINISTRADOR" && (
            <>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `${linkClass} ${isActive && activeClass}`
                }
              >
                <UsersIcon className="w-5 h-5" />
                Usuarios
              </NavLink>

              <NavLink
                to="/admin/restaurants"
                className={({ isActive }) =>
                  `${linkClass} ${isActive && activeClass}`
                }
              >
                <BuildingStorefrontIcon className="w-5 h-5" />
                Restaurantes
              </NavLink>
            </>
          )}

          {/* RESTAURANTE */}
          {user?.role === "RESTAURANTE" && (
            <>
              <NavLink
                to="/restaurant/orders"
                className={({ isActive }) =>
                  `${linkClass} ${isActive && activeClass}`
                }
              >
                <ClipboardDocumentListIcon className="w-5 h-5" />
                Órdenes
              </NavLink>

              <NavLink
                to="/restaurant/menu"
                className={({ isActive }) =>
                  `${linkClass} ${isActive && activeClass}`
                }
              >
                <BuildingStorefrontIcon className="w-5 h-5" />
                Menú
              </NavLink>
            </>
          )}

          {/* DELIVERY */}
          {user?.role === "REPARTIDOR" && (
            <>
              <NavLink
                to="/delivery/available"
                className={({ isActive }) =>
                  `${linkClass} ${isActive && activeClass}`
                }
              >
                <TruckIcon className="w-5 h-5" />
                Pedidos Disponibles
              </NavLink>

              <NavLink
                to="/delivery/active"
                className={({ isActive }) =>
                  `${linkClass} ${isActive && activeClass}`
                }
              >
                <TruckIcon className="w-5 h-5" />
                Pedido Activo
              </NavLink>
            </>
          )}

          {/* Botón de Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-4 py-2 mt-6 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            {isLoggingOut ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                Cerrando sesión...
              </span>
            ) : (
              "Logout"
            )}
          </button>
        </nav>
      </aside>

      <main className="flex-1 bg-slate-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default NavBar;