import { createBrowserRouter } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import NavBar from "../components/NavBar";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminRestaurants from "../pages/admin/AdminRestaurants";
import AdminUsers from "../pages/admin/AdminUsers";
import HomeCatalog from "../pages/client/HomeCatalog";
import RestaurantMenu from "../pages/client/RestaurantMenu";
import MyOrders from "../pages/client/MyOrders";
import IncomingOrders from "../pages/restaurant/IncomingOrders";
import ManageMenu from "../pages/restaurant/ManageMenu";
import AvailableDeliveries from "../pages/delivery/AvailableDeliveries";
import ActiveDelivery from "../pages/delivery/ActiveDelivery";
import NotFound from "../pages/errors/NotFound";
import Unauthorized from "../pages/errors/Unauthorized";
import AdminMenus from "../pages/admin/AdminMenus";

export const RouterApp = createBrowserRouter([
  // Ruta principal con layout
  {
    path: "/",
    element: <NavBar />,
    errorElement: <NotFound />,
    children: [
      // CLIENTE - Requiere rol CLIENTE
      {
        index: true,
        element: (
          <PrivateRoute roles={['CLIENTE']}>
            <HomeCatalog />
          </PrivateRoute>
        ),
      },
      {
        path: "client/restaurants/:id",
        element: (
          <PrivateRoute roles={['CLIENTE']}>
            <RestaurantMenu />
          </PrivateRoute>
        ),
      },
      {
        path: "client/orders",
        element: (
          <PrivateRoute roles={['CLIENTE']}>
            <MyOrders />
          </PrivateRoute>
        ),
      },

      // ADMIN - Requiere rol ADMINISTRADOR
      {
        path: "admin/restaurants",
        element: (
          <PrivateRoute roles={['ADMINISTRADOR']}>
            <AdminRestaurants />
          </PrivateRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <PrivateRoute roles={['ADMINISTRADOR']}>
            <AdminUsers />
          </PrivateRoute>
        ),
      },
      {
        path: "admin/menus",
        element: (
          <PrivateRoute roles={['ADMINISTRADOR']}>
            <AdminMenus />
          </PrivateRoute>
        ),
      },

      // RESTAURANTE - Requiere rol RESTAURANTE
      {
        path: "restaurant/orders",
        element: (
          <PrivateRoute roles={['RESTAURANTE']}>
            <IncomingOrders />
          </PrivateRoute>
        ),
      },
      {
        path: "restaurant/menu",
        element: (
          <PrivateRoute roles={['RESTAURANTE']}>
            <ManageMenu />
          </PrivateRoute>
        ),
      },

      // REPARTIDOR - Requiere rol REPARTIDOR
      {
        path: "delivery/available",
        element: (
          <PrivateRoute roles={['REPARTIDOR']}>
            <AvailableDeliveries />
          </PrivateRoute>
        ),
      },
      {
        path: "delivery/active",
        element: (
          <PrivateRoute roles={['REPARTIDOR']}>
            <ActiveDelivery />
          </PrivateRoute>
        ),
      },

      // ERRORES
      {
        path: "unauthorized",
        element: <Unauthorized />,
      },
    ],
  },

  // PUBLIC ROUTES
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
]);