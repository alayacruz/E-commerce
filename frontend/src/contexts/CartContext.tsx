import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface CartItem {
  cartItemId: string;
  quantity: number;
  product: {
    productId: string;
    name: string;
    price: number;
    image: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, newQuantity: number) => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:3000';
const userString = localStorage.getItem("user"); // 1. Get the string

    if (!userString) {
      console.error(" [fetchCart] No user found in localStorage.");
      setLoading(false);
      
    }

    const user = JSON.parse(userString); // 2. Parse the string into an object
    const buyerId = user.userId;         // 3. Now you can access the property
console.log("buyerId variable is: ", buyerId);
  // -------------------------------
  // FETCH CART FROM BACKEND
  // -------------------------------
  const fetchCart = async () => {
    console.log(" [fetchCart] Starting fetch...");
    setLoading(true);
    try {
      const url = `${API_URL}/cart?buyerId=${buyerId}`;
      console.log("buyerId in url is: ", url);
      console.log(" [fetchCart] Fetching:", url);
      const response = await fetch(url);
      

      console.log(" [fetchCart] Response status:", response.status);
      console.log(" [fetchCart] Response :", response);

      if (!response.ok) {
        if (response.status === 400) {
          console.warn(" [fetchCart] Empty cart (status 400)");
          setCartItems([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(" [fetchCart] Data received:", data);

      setCartItems(data.cartItems || []);
    } catch (error) {
      console.error(" [fetchCart] Failed to fetch cart:", error);
      setCartItems([]);
    } finally {
      console.log(" [fetchCart] Done fetching.");
      setLoading(false);
    }
  };

useEffect(() => {
    console.log(" [CartProvider] useEffect: Firing...");
    if (buyerId) {
      // Only fetch if we have a user
      fetchCart();
    } else {
      // No user, so don't fetch. 
      // Clear the cart and stop loading.
      console.log(" [CartProvider] No buyerId, clearing cart.");
      setCartItems([]);
      setLoading(false);
    }
  }, [buyerId]);

  // -------------------------------
  // ADD ITEM
  // -------------------------------
  const addToCart = async (productId: string, quantity: number) => {
    if (!buyerId) {
      console.error(" [addToCart] Cannot add item, no user logged in.");
      return;
    }
    console.log(`🟦 [addToCart] Adding ${quantity} of product ${productId}`);
    try {
      const body = { productId, quantity, buyerId };
      console.log(" [addToCart] Request body:", body);

      const res = await fetch(`${API_URL}/cart/addItem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
console.log("i am respoonding with: ", res);
      console.log(" [addToCart] Response status:", res.status);
      if (!res.ok) {
        // Log the *actual* error from the backend
        const errorData = await res.json();
        console.error(" [addToCart] Failed to add item:", errorData.error);
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      await fetchCart();
    } catch (error) {
      console.error(" [addToCart] Failed to add item:", error);
    }
  };

  // -------------------------------
  // UPDATE QUANTITY
  // -------------------------------
  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!buyerId) {
      console.error(" [addToCart] Cannot add item, no user logged in.");
      return;
    }
    console.log(` [updateQuantity] Changing product ${productId} → quantity ${newQuantity}`);
    const item = cartItems.find(i => i.product.productId === productId);
    if (!item) {
      console.warn(" [updateQuantity] Item not found in cart:", productId);
      return;
    }

    const quantityChange = Math.abs(newQuantity - item.quantity);
    const isIncrease = newQuantity > item.quantity;
    const body = { productId, quantity: quantityChange, buyerId, increase: isIncrease };

    console.log(" [updateQuantity] Request body:", body);

    try {
      const res = await fetch(`${API_URL}/cart/updateQuantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      console.log(" [updateQuantity] Response status:", res.status);

      await fetchCart();
    } catch (error) {
      console.error(" [updateQuantity] Failed to update quantity:", error);
    }
  };

  // -------------------------------
  // REMOVE ITEM
  // -------------------------------
  const removeFromCart = async (productId: string) => {
    if (!buyerId) {
      console.error(" [addToCart] Cannot add item, no user logged in.");
      return;
    }
    console.log(` [removeFromCart] Removing product ${productId}`);
    const item = cartItems.find(i => i.product.productId === productId);
    if (!item) {
      console.warn("[removeFromCart] Item not found:", productId);
      return;
    }

    const body = {
      productId,
      quantity: item.quantity,
      buyerId,
      increase: false,
    };
    console.log("[removeFromCart] Request body:", body);

    try {
      const res = await fetch(`${API_URL}/cart/updateQuantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      console.log(" [removeFromCart] Response status:", res.status);

      await fetchCart();
    } catch (error) {
      console.error(" [removeFromCart] Failed to remove item:", error);
    }
  };

  const getTotalPrice = () => {
    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    console.log(" [getTotalPrice] Total:", total);
    return total;
  };

  const getTotalItems = () => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    console.log("[getTotalItems] Count:", count);
    return count;
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
  };

  console.log(" [CartProvider] Render:", { cartItems, loading });

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};