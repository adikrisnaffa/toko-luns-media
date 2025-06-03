export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string; // Can be a web URL or a Base64 Data URI for uploaded images
  stock: number;
  dataAiHint?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  items: TransactionItem[];
  totalAmount: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  type: 'sale' | 'income' | 'expense';
  description?: string; // For income/expense
  category?: string; // For income/expense
}

export interface User {
  id: string;
  name: string;
  role: 'customer' | 'admin';
}

export interface FinancialReport {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  period: string;
}

