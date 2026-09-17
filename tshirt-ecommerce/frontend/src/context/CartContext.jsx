import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('teezone_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed reading cart from localStorage', e);
      return [];
    }
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('teezone_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed saving cart to localStorage', e);
    }
  }, [cartItems]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3200);
  };

  // Add item to cart with size, color, stock check
  const addToCart = (product, size, quantity = 1, color = null) => {
    if (!size) {
      showNotification('Please select a size first', 'error');
      return false;
    }

    const itemColor = color || product.color || 'Standard';
    
    // Find available stock for chosen size
    const sizeObj = product.sizes?.find(s => s.size === size);
    const maxStock = sizeObj ? sizeObj.stock : (product.stock || 50);

    // Existing item key matches both ID and chosen size
    const existingIndex = cartItems.findIndex(
      item => item.id === product.id && item.selectedSize === size && item.selectedColor === itemColor
    );

    if (existingIndex > -1) {
      const currentQty = cartItems[existingIndex].quantity;
      if (currentQty + quantity > maxStock) {
        showNotification(`Cannot add more. Only ${maxStock} in stock for size ${size}.`, 'error');
        return false;
      }

      const updated = [...cartItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: currentQty + quantity
      };
      setCartItems(updated);
      showNotification(`Updated ${product.name} (${size}) in cart!`);
      return true;
    } else {
      if (quantity > maxStock) {
        showNotification(`Only ${maxStock} items in stock for size ${size}.`, 'error');
        return false;
      }

      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        selectedSize: size,
        selectedColor: itemColor,
        quantity: quantity,
        maxStock: maxStock
      };

      setCartItems([...cartItems, newItem]);
      showNotification(`Added ${product.name} (${size}) to cart!`);
      return true;
    }
  };

  const removeFromCart = (id, selectedSize, selectedColor) => {
    setCartItems(prev => prev.filter(
      item => !(item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
    ));
    showNotification('Item removed from cart', 'info');
  };

  const updateQuantity = (id, selectedSize, selectedColor, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id, selectedSize, selectedColor);
      return;
    }

    setCartItems(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor) {
        if (newQuantity > item.maxStock) {
          showNotification(`Maximum available stock is ${item.maxStock}`, 'error');
          return { ...item, quantity: item.maxStock };
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('teezone_cart');
  };

  // Calculations
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 70 || subtotal === 0 ? 0 : 5.99;
  const estimatedTax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + shippingFee + estimatedTax).toFixed(2));

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      shippingFee,
      estimatedTax,
      total,
      notification
    }}>
      {children}
      {/* Toast Notification Container */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: notification.type === 'error' ? 'rgba(244, 63, 94, 0.95)' : 'rgba(17, 24, 39, 0.95)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>{notification.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};
