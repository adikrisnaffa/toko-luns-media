
"use client";

import type { Product, CartItem, Transaction, User, TransactionItem } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getProductRecommendations, type ProductRecommendationsOutput } from '@/ai/flows/product-recommendations';
import { useToast } from '@/hooks/use-toast';
import { mockProducts, mockTransactions } from '@/lib/data'; 

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[]; // Combined transactions
  currentUser: User | null;
  appReady: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (username: string, password: string) => Promise<boolean>;
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
  allTransactions: Transaction[]; // For financial report, includes all types
  addProduct: (productData: Omit<Product, 'id'>) => void;
  updateProduct: (productId: string, productData: Partial<Omit<Product, 'id'>>) => void;
  deleteProduct: (productId: string) => void;
  getProductById: (productId: string) => Product | undefined;
  productCategories: string[];
  deleteSaleTransaction: (transactionId: string) => void;
  updateSaleOrder: (transactionId: string, updatedItems: TransactionItem[], originalItems: TransactionItem[]) => Promise<boolean>;
  addProductsFromExcel: (productsData: Array<Omit<Product, 'id' | 'category' | 'imageUrl'>>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const demoUsers: User[] = [
  { id: 'admin001', name: 'Admin User', role: 'admin' },
  { id: 'cust001', name: 'Customer User', role: 'customer' },
];
const userCredentials: Record<string, string> = {
  admin: 'adminpass',
  customer: 'customerpass',
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [appReady, setAppReady] = useState(false);

  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [registeredUserCredentials, setRegisteredUserCredentials] = useState<Record<string, string>>({});

  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);

  const baseCategories = ["Electronics", "Books", "Clothing", "Home Goods", "Sports", "Toys", "Beauty", "Automotive", "Groceries"];
  const [productCategories, setProductCategories] = useState<string[]>(["All", ...baseCategories.sort()]);

  useEffect(() => {
    const dynamicCategories = new Set(products.map(p => p.category).filter(c => c)); // Filter out empty/null categories
    const allDefinedCategories = new Set([...baseCategories, ...Array.from(dynamicCategories)]);
    setProductCategories(["All", ...Array.from(allDefinedCategories).sort()]);
  }, [products]);

  useEffect(() => {
    const storedUserJson = localStorage.getItem('loggedInUser');
    if (storedUserJson) {
      try {
        const storedUser: User = JSON.parse(storedUserJson);
        setCurrentUser(storedUser);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem('loggedInUser');
      }
    }
    
    const storedRegisteredUsersJson = localStorage.getItem('registeredUsers');
    if (storedRegisteredUsersJson) {
        try {
            setRegisteredUsers(JSON.parse(storedRegisteredUsersJson));
        } catch (e) { console.error("Error parsing stored registered users:", e); }
    }

    const storedRegisteredCredentialsJson = localStorage.getItem('registeredUserCredentials');
    if (storedRegisteredCredentialsJson) {
        try {
            setRegisteredUserCredentials(JSON.parse(storedRegisteredCredentialsJson));
        } catch (e) { console.error("Error parsing stored registered credentials:", e); }
    }

    setAppReady(true);
  }, []);


  const login = async (username: string, password: string): Promise<boolean> => {
    const lowerUsername = username.toLowerCase();
    let userToLogin: User | undefined;

    const expectedPassword = userCredentials[lowerUsername];
    if (expectedPassword && password === expectedPassword) {
      if (lowerUsername === 'admin') {
        userToLogin = demoUsers.find(u => u.role === 'admin');
      } else if (lowerUsername === 'customer') {
        userToLogin = demoUsers.find(u => u.role === 'customer');
      }
    } else {
      const registeredPassword = registeredUserCredentials[lowerUsername];
      if (registeredPassword && password === registeredPassword) {
        userToLogin = registeredUsers.find(u => u.name.toLowerCase() === lowerUsername);
      }
    }

    if (userToLogin) {
      setCurrentUser(userToLogin);
      localStorage.setItem('loggedInUser', JSON.stringify(userToLogin));
      toast({ title: 'Login Successful', description: `Welcome, ${userToLogin.name}!` });
      router.push('/');
      return true;
    }
    
    toast({ title: 'Login Failed', description: 'Invalid username or password.', variant: 'destructive' });
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('loggedInUser');
    setCart([]);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/login');
  };

  const registerUser = async (username: string, password: string): Promise<boolean> => {
    const lowerUsername = username.toLowerCase();
    if (userCredentials[lowerUsername] || registeredUserCredentials[lowerUsername]) {
        toast({ title: "Registration Failed", description: "Username already exists.", variant: "destructive" });
        return false;
    }

    const newUser: User = {
        id: `user_${Date.now()}`,
        name: username, 
        role: 'customer',
    };

    const updatedRegisteredUsers = [...registeredUsers, newUser];
    const updatedRegisteredCredentials = { ...registeredUserCredentials, [lowerUsername]: password };

    setRegisteredUsers(updatedRegisteredUsers);
    setRegisteredUserCredentials(updatedRegisteredCredentials);

    localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));
    localStorage.setItem('registeredUserCredentials', JSON.stringify(updatedRegisteredCredentials));
    
    toast({ title: "Registration Successful", description: `Welcome, ${newUser.name}! You are now logged in.` });
    setCurrentUser(newUser);
    localStorage.setItem('loggedInUser', JSON.stringify(newUser));
    router.push('/');
    return true;
  };


  const addToCart = (product: Product, quantity: number = 1) => {
    if (!currentUser) {
      toast({ title: "Not Logged In", description: "Please login to add items to cart.", variant: "destructive"});
      router.push('/login');
      return;
    }
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
      ).filter(item => item.quantity > 0) 
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
    if (!currentUser) {
      toast({ title: "Not Logged In", description: "Please login to place an order.", variant: "destructive"});
      router.push('/login');
      return;
    }
    if (cart.length === 0) {
      toast({ title: "Empty Cart", description: "Cannot place an order with an empty cart.", variant: "destructive"});
      return;
    }
    const newTransaction: Transaction = {
      id: `txn_sale_${Date.now()}`,
      date: new Date().toISOString(),
      items: cart.map(item => ({ productId: item.product.id, name: item.product.name, quantity: item.quantity, price: item.product.price })),
      totalAmount: getCartTotal(),
      status: 'Completed',
      type: 'sale',
      description: `Order by ${orderDetails.name} (${currentUser.name})`,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
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
        .map(name => products.find(p => p.name.toLowerCase() === name.toLowerCase()))
        .filter((p): p is Product => p !== undefined)
        .filter(p => !cart.some(cartItem => cartItem.product.id === p.id))
        .slice(0, 3);
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
    const timer = setTimeout(() => {
      if (cart.length > 0 && currentUser) { 
        fetchRecommendations();
      } else {
        setRecommendedProducts([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [cart, fetchRecommendations, currentUser]);

  const addTransactionRecord = (record: Omit<Transaction, 'id' | 'date' | 'items' | 'status'> & { amount: number }) => {
    const newRecord: Transaction = {
      id: `txn_${record.type}_${Date.now()}`,
      date: new Date().toISOString(),
      items: [],
      totalAmount: record.type === 'expense' ? -Math.abs(record.amount) : Math.abs(record.amount),
      status: 'Completed',
      type: record.type,
      description: record.description,
      category: record.category,
    };
    setTransactions(prev => [newRecord, ...prev]);
    toast({ title: `${record.type.charAt(0).toUpperCase() + record.type.slice(1)} Recorded` });
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...productData,
    };
    setProducts(prevProducts => [newProduct, ...prevProducts]);
    toast({ title: "Product Added", description: `${newProduct.name} has been added successfully.` });
  };

  const updateProduct = (productId: string, productData: Partial<Omit<Product, 'id'>>) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, ...productData } : p
      )
    );
    toast({ title: "Product Updated", description: `Product ID ${productId} has been updated.` });
  };

  const deleteProduct = (productId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    toast({ title: "Product Deleted", description: `Product ID ${productId} has been deleted.`, variant: "destructive" });
  };

  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  const deleteSaleTransaction = (transactionId: string) => {
    setTransactions(prevTransactions => {
      const transactionToDelete = prevTransactions.find(tx => tx.id === transactionId);
      if (transactionToDelete && transactionToDelete.type === 'sale') {
        setProducts(prevProducts => {
          return prevProducts.map(p => {
            const itemInTransaction = transactionToDelete.items.find(item => item.productId === p.id);
            if (itemInTransaction) {
              return { ...p, stock: p.stock + itemInTransaction.quantity };
            }
            return p;
          });
        });
      }
      toast({ title: "Order Deleted", description: `Order ${transactionId.substring(0,12)}... has been deleted.`, variant: "destructive" });
      return prevTransactions.filter(tx => tx.id !== transactionId);
    });
  };

  const updateSaleOrder = async (transactionId: string, updatedItems: TransactionItem[], originalItems: TransactionItem[]): Promise<boolean> => {
    const transactionToUpdate = transactions.find(tx => tx.id === transactionId);
    if (!transactionToUpdate || transactionToUpdate.type !== 'sale') {
      toast({ title: "Error", description: "Sale transaction not found.", variant: "destructive" });
      return false;
    }

    const newTotalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const tempProductStock = new Map<string, number>();
    products.forEach(p => tempProductStock.set(p.id, p.stock));

    for (const origItem of originalItems) {
      const currentTempStock = tempProductStock.get(origItem.productId) ?? 0;
      tempProductStock.set(origItem.productId, currentTempStock + origItem.quantity);
    }
    
    for (const newItem of updatedItems) {
      const productDetails = products.find(p => p.id === newItem.productId);
      if (!productDetails) {
          toast({ title: "Product Error", description: `Product ${newItem.name} not found.`, variant: "destructive" });
          return false; 
      }
      const availableStockForNewItem = tempProductStock.get(newItem.productId) ?? 0;
      if (newItem.quantity < 0) {
           toast({ title: "Validation Error", description: `Quantity for ${newItem.name} cannot be negative.`, variant: "destructive" });
           return false;
      }
      if (newItem.quantity > availableStockForNewItem) {
        toast({ title: "Stock Error", description: `Not enough stock for ${newItem.name}. Available after reverting old order: ${availableStockForNewItem}, Requested: ${newItem.quantity}`, variant: "destructive" });
        return false; 
      }
      tempProductStock.set(newItem.productId, availableStockForNewItem - newItem.quantity);
    }

    setProducts(prevProd => prevProd.map(p => {
      const finalStock = tempProductStock.get(p.id);
      return finalStock !== undefined ? { ...p, stock: finalStock } : p;
    }));

    setTransactions(prevTx => prevTx.map(tx => 
      tx.id === transactionId 
        ? { ...tx, items: updatedItems, totalAmount: newTotalAmount, date: new Date().toISOString() } 
        : tx
    ));

    toast({ title: "Order Updated", description: `Order ${transactionId.substring(0,12)}... has been updated.` });
    return true;
  };

  const addProductsFromExcel = (productsData: Array<Omit<Product, 'id' | 'category' | 'imageUrl'>>) => {
    const newProducts: Product[] = productsData.map(prodData => ({
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: prodData.name,
      description: prodData.description,
      price: prodData.price,
      category: '', // Empty category as requested
      imageUrl: `https://placehold.co/600x400.png?text=${encodeURIComponent(prodData.name.substring(0,20))}`, // Placeholder image
      stock: prodData.stock,
      dataAiHint: prodData.dataAiHint || 'product placeholder',
    }));

    setProducts(prevProducts => [...newProducts, ...prevProducts]);
    toast({ title: "Products Imported", description: `${newProducts.length} products have been imported successfully from Excel.` });
  };

  const contextValue = { 
      products, cart, transactions, currentUser, login, logout, registerUser,
      addToCart, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal, getCartItemCount, placeOrder, 
      recommendedProducts, fetchRecommendations, isRecommendationsLoading,
      addTransactionRecord, allTransactions: transactions,
      addProduct, updateProduct, deleteProduct, getProductById,
      productCategories,
      deleteSaleTransaction, updateSaleOrder, addProductsFromExcel,
      appReady
    };

  return (
    <AppContext.Provider value={contextValue}>
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
