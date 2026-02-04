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

export const RouterApp = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <NavBar />
      </PrivateRoute>
    ),
    errorElement: <NotFound />,
    children: [
      // CLIENTE
      {
        index: true,
        element: <HomeCatalog />,
      },
      {
        path: "client/restaurants/:id",
        element: <RestaurantMenu />,
      },
      {
        path: "client/orders",
        element: <MyOrders />,
      },

      // ADMIN
      {
        path: "admin/restaurants",
        element: <AdminRestaurants />,
      },
      {
        path: "admin/users",
        element: <AdminUsers />,
      },

      // RESTAURANTE
      {
        path: "restaurant/orders",
        element: <IncomingOrders />,
      },
      {
        path: "restaurant/menu",
        element: <ManageMenu />,
      },

      // DELIVERY
      {
        path: "delivery/available",
        element: <AvailableDeliveries />,
      },
      {
        path: "delivery/active",
        element: <ActiveDelivery />,
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
