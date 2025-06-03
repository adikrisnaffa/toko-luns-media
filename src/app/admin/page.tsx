
"use client";

import Link from 'next/link';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, BarChart3, Settings, Users, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { formatCurrencyIDR } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { currentUser, products, allTransactions } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (currentUser?.role !== 'admin' && typeof window !== 'undefined') {
      router.push('/');
    }
  }, [currentUser, router]);

  if (currentUser?.role !== 'admin') {
    return <div className="flex justify-center items-center h-screen"><p>Access Denied. Redirecting...</p></div>;
  }

  const totalSales = allTransactions.filter(tx => tx.type === 'sale').reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalIncome = allTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.totalAmount, 0) + totalSales;
  const totalExpenses = allTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Math.abs(tx.totalAmount), 0);


  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center">
          <Settings className="mr-3 h-10 w-10 text-primary" />
          Admin Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage your store and view financial insights.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyIDR(totalIncome - totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Net profit from all transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyIDR(totalSales)}</div>
            <p className="text-xs text-muted-foreground">{allTransactions.filter(tx => tx.type === 'sale').length} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Currently listed products</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><DollarSign className="mr-2 h-6 w-6 text-green-500"/>Record Transaction</CardTitle>
            <CardDescription>Manually add income or expense records to your financial ledger.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/record-transaction" legacyBehavior>
              <Button className="w-full">Go to Record Transaction</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-6 w-6 text-blue-500"/>Financial Report</CardTitle>
            <CardDescription>View a summary of your store's financial performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/financial-report" legacyBehavior>
              <Button className="w-full">View Financial Report</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
