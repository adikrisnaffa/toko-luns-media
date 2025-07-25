
"use client";

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyIDR } from '@/lib/utils';

export default function FinancialReportPage() {
  const { currentUser, allTransactions } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/');
    }
    // If !currentUser, AppLayout will handle redirect to /login
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'admin') {
     return <div className="flex justify-center items-center h-screen"><p>Loading or Access Denied...</p></div>;
  }
  
  const financialSummary = useMemo(() => {
    const totalIncome = allTransactions
      .filter(tx => tx.type === 'income' || tx.type === 'sale')
      .reduce((sum, tx) => sum + tx.totalAmount, 0);
    
    const totalExpenses = allTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.totalAmount), 0);

    const netProfit = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, netProfit };
  }, [allTransactions]);
  
  const sortedTransactions = [...allTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
      </Button>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center justify-center">
            <FileText className="mr-3 h-10 w-10 text-primary" />
            Financial Report
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">An overview of your business's financial health.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Income</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrencyIDR(financialSummary.totalIncome)}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Total Expenses</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrencyIDR(financialSummary.totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Net Profit</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${financialSummary.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrencyIDR(financialSummary.netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">All Transactions Ledger</CardTitle>
          <CardDescription>Detailed list of all recorded financial activities.</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length === 0 ? (
             <p className="text-muted-foreground text-center py-8">No transactions recorded yet.</p>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description/Items</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((tx) => {
                const formattedAmount = formatCurrencyIDR(Math.abs(tx.totalAmount)).replace('IDR ', '');
                return (
                  <TableRow key={tx.id}>
                    <TableCell>{format(new Date(tx.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === 'sale' || tx.type === 'income' ? 'default' : 'destructive'} className={
                          tx.type === 'income' ? 'bg-green-500 hover:bg-green-600' : 
                          tx.type === 'expense' ? 'bg-red-500 hover:bg-red-600' : ''
                      }>
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {tx.type === 'sale' ? tx.items.map(item => item.name).join(', ') : tx.description}
                    </TableCell>
                    <TableCell>{tx.category || '-'}</TableCell>
                    <TableCell className={`text-right font-semibold ${tx.totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.totalAmount >= 0 ? `+IDR ${formattedAmount}` : `-IDR ${formattedAmount}`}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
