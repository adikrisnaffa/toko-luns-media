
"use client";

import type { Product, CartItem, Transaction, User } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getProductRecommendations, type ProductRecommendationsOutput } from '@/ai/flows/product-recommendations';
import { useToast } from '@/hooks/use-toast';
import { mockProducts, mockTransactions } from '@/lib/data';

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  currentUser: User | null;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  placeOrder: (orderDetails: { name: string; address: string; paymentMethod: string }) => Promise<void>;
  recommendedProducts: Product[];
  fetchRecommendations: () => Promise<void>;
  isRecommendationsLoading: boolean;
  addTransactionRecord: (record: Omit<Transaction, 'id' | 'date' | 'items' | 'status'> & { amount: number }) => void;
  allTransactions: Transaction[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [currentUser, setCurrentUser] = useState<User | null>({ id: 'user123', name: 'Demo User', role: 'admin' }); // Mock admin

  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prevCart, { product, quantity: Math.min(quantity, product.stock) }];
    });
    toast({ title: `${product.name} added to cart` });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    toast({ title: `Item removed from cart` });
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(0, Math.min(quantity, item.product.stock)) }
          : item
      ).filter(item => item.quantity > 0) // Remove if quantity is 0
    );
  };

  const clearCart = () => {
    setCart([]);
    toast({ title: `Cart cleared` });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const placeOrder = async (orderDetails: { name: string; address: string; paymentMethod: string }) => {
    const newTransaction: Transaction = {
      id: `txn_sale_${Date.now()}`,
      date: new Date().toISOString(),
      items: cart.map(item => ({ productId: item.product.id, name: item.product.name, quantity: item.quantity, price: item.product.price })),
      totalAmount: getCartTotal(),
      status: 'Completed',
      type: 'sale',
      description: `Order by ${orderDetails.name}`,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Simulate stock update
    const newProducts = products.map(p => {
      const cartItem = cart.find(ci => ci.product.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });
    setProducts(newProducts);

    clearCart();
    toast({ title: "Order Placed!", description: "Thank you for your purchase."});
  };

  const fetchRecommendations = useCallback(async () => {
    if (cart.length === 0) {
      setRecommendedProducts([]);
      return;
    }
    setIsRecommendationsLoading(true);
    try {
      const cartItemNames = cart.map(item => item.product.name);
      const result: ProductRecommendationsOutput = await getProductRecommendations({ cartItems: cartItemNames });
      
      const recommendations = result.recommendedProducts
        .map(name => products.find(p => p.name.toLowerCase() === name.toLowerCase())) // Case-insensitive find
        .filter((p): p is Product => p !== undefined)
        .filter(p => !cart.some(cartItem => cartItem.product.id === p.id)) // Not already in cart
        .slice(0, 3); // Limit to 3
      setRecommendedProducts(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast({ title: "AI Error", description: "Could not fetch product recommendations.", variant: "destructive" });
      setRecommendedProducts([]);
    } finally {
      setIsRecommendationsLoading(false);
    }
  }, [cart, products, toast]);


  useEffect(() => {
    // Debounce or control recommendation fetching frequency if needed
    const timer = setTimeout(() => {
      if (cart.length > 0) {
        fetchRecommendations();
      } else {
        setRecommendedProducts([]);
      }
    }, 500); // Simple debounce
    return () => clearTimeout(timer);
  }, [cart, fetchRecommendations]);

  const addTransactionRecord = (record: Omit<Transaction, 'id' | 'date' | 'items' | 'status'> & { amount: number }) => {
    const newRecord: Transaction = {
      id: `txn_${record.type}_${Date.now()}`,
      date: new Date().toISOString(),
      items: [], // No items for manual income/expense records
      totalAmount: record.type === 'expense' ? -Math.abs(record.amount) : Math.abs(record.amount),
      status: 'Completed',
      type: record.type,
      description: record.description,
      category: record.category,
    };
    setTransactions(prev => [newRecord, ...prev]);
    toast({ title: `${record.type.charAt(0).toUpperCase() + record.type.slice(1)} Recorded` });
  };


  return (
    <AppContext.Provider value={{ 
      products, cart, transactions, currentUser, 
      addToCart, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal, getCartItemCount, placeOrder, 
      recommendedProducts, fetchRecommendations, isRecommendationsLoading,
      addTransactionRecord, allTransactions: transactions 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

