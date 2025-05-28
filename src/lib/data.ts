
import type { Product, Transaction } from '@/lib/types';

export const mockProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Modern Laptop',
    description: 'High-performance laptop for work and play.',
    price: 1200,
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'electronics computer',
    stock: 10,
  },
  {
    id: 'prod_2',
    name: 'Classic Novel',
    description: 'A timeless piece of literature.',
    price: 20,
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'book reading',
    stock: 50,
  },
  {
    id: 'prod_3',
    name: 'Cotton T-Shirt',
    description: 'Comfortable and stylish cotton t-shirt.',
    price: 25,
    category: 'Clothing',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'clothing fashion',
    stock: 100,
  },
  {
    id: 'prod_4',
    name: 'Espresso Machine',
    description: 'Brew cafe-quality espresso at home.',
    price: 300,
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'home kitchen',
    stock: 15,
  },
  {
    id: 'prod_5',
    name: 'Wireless Headphones',
    description: 'Noise-cancelling wireless headphones.',
    price: 150,
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'electronics audio',
    stock: 30,
  },
  {
    id: 'prod_6',
    name: 'Yoga Mat',
    description: 'Eco-friendly non-slip yoga mat.',
    price: 40,
    category: 'Sports',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'sports fitness',
    stock: 40,
  },
   {
    id: 'prod_7',
    name: 'Smartphone Pro',
    description: 'Latest generation smartphone with advanced features.',
    price: 999,
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'electronics mobile',
    stock: 25,
  },
  {
    id: 'prod_8',
    name: 'The Art of Coding',
    description: 'A comprehensive guide to software development.',
    price: 45,
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'book programming',
    stock: 60,
  },
  {
    id: 'prod_9',
    name: 'Designer Jeans',
    description: 'Premium quality denim jeans.',
    price: 120,
    category: 'Clothing',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'clothing denim',
    stock: 35,
  },
  {
    id: 'prod_10',
    name: 'Smart Desk Lamp',
    description: 'Adjustable LED desk lamp with smart features.',
    price: 75,
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'home office',
    stock: 22,
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    items: [
      { productId: 'prod_1', name: 'Modern Laptop', quantity: 1, price: 1200 },
      { productId: 'prod_5', name: 'Wireless Headphones', quantity: 1, price: 150 },
    ],
    totalAmount: 1350,
    status: 'Completed',
    type: 'sale',
  },
  {
    id: 'txn_2',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    items: [{ productId: 'prod_3', name: 'Cotton T-Shirt', quantity: 2, price: 25 }],
    totalAmount: 50,
    status: 'Completed',
    type: 'sale',
  },
  {
    id: 'txn_income_1',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    items: [],
    totalAmount: 500,
    status: 'Completed',
    type: 'income',
    description: 'Consulting Services Rendered',
    category: 'Services',
  },
  {
    id: 'txn_expense_1',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    items: [],
    totalAmount: -75, // Expenses should be negative or handled as absolute in calculations
    status: 'Completed',
    type: 'expense',
    description: 'Office Supplies Purchase',
    category: 'Office Expenses',
  }
];
// The 'productCategories' export was removed as AppContext and consuming components now handle category derivation.
