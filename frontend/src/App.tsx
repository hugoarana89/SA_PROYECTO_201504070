import './App.css'
import { RouterProvider } from "react-router-dom";
import { RouterApp } from "./routes/AppRouter";
import { CartProvider } from './context/CartContext';

function App() {

  return (
    <>
      <CartProvider>
        <RouterProvider router={RouterApp} />
      </CartProvider>
    </>
  )
}

export default App
