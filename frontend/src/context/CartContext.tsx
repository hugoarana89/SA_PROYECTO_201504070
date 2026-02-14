import React, { createContext, useState, useContext, useEffect } from 'react';
import type { CartItem, Cart } from '../types/order.types';

interface CartContextType {
  cart: Cart | null;
  addToCart: (item: {
    menu_item_id: string;
    product_name: string;
    price: number;
    restaurant_id: string;
    restaurant_name: string;
  }) => void;
  removeFromCart: (menu_item_id: string) => void;
  updateQuantity: (menu_item_id: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(() => {
    // Cargar carrito del localStorage al iniciar
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (cart) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [cart]);

  const addToCart = (item: {
    menu_item_id: string;
    product_name: string;
    price: number;
    restaurant_id: string;
    restaurant_name: string;
  }) => {
    setCart(prevCart => {
      // Si no hay carrito o es de otro restaurante, crear nuevo carrito
      if (!prevCart || prevCart.restaurant_id !== item.restaurant_id) {
        return {
          restaurant_id: item.restaurant_id,
          restaurant_name: item.restaurant_name,
          items: [{
            id: '', // Se llenará cuando se cree la orden
            menu_item_id: item.menu_item_id,
            product_name: item.product_name,
            quantity: 1,
            unit_price: item.price,
            subtotal: item.price,
          }],
          total: item.price,
        };
      }

      // Si ya existe el item, aumentar cantidad
      const existingItemIndex = prevCart.items.findIndex(
        i => i.menu_item_id === item.menu_item_id
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevCart.items];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + 1,
          subtotal: (existingItem.quantity + 1) * existingItem.unit_price,
        };

        return {
          ...prevCart,
          items: updatedItems,
          total: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
        };
      }

      // Agregar nuevo item
      const newItem: CartItem = {
        id: '',
        menu_item_id: item.menu_item_id,
        product_name: item.product_name,
        quantity: 1,
        unit_price: item.price,
        subtotal: item.price,
      };

      const updatedItems = [...prevCart.items, newItem];
      return {
        ...prevCart,
        items: updatedItems,
        total: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
      };
    });
  };

  const removeFromCart = (menu_item_id: string) => {
    setCart(prevCart => {
      if (!prevCart) return null;

      const updatedItems = prevCart.items.filter(i => i.menu_item_id !== menu_item_id);

      if (updatedItems.length === 0) {
        return null;
      }

      return {
        ...prevCart,
        items: updatedItems,
        total: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
      };
    });
  };

  const updateQuantity = (menu_item_id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(menu_item_id);
      return;
    }

    setCart(prevCart => {
      if (!prevCart) return null;

      const itemIndex = prevCart.items.findIndex(i => i.menu_item_id === menu_item_id);
      if (itemIndex === -1) return prevCart;

      const updatedItems = [...prevCart.items];
      const item = updatedItems[itemIndex];
      updatedItems[itemIndex] = {
        ...item,
        quantity,
        subtotal: quantity * item.unit_price,
      };

      return {
        ...prevCart,
        items: updatedItems,
        total: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
      };
    });
  };

  const clearCart = () => {
    setCart(null);
  };

  const getCartCount = () => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};