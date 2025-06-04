
"use client";

import { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { Transaction } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, DollarSign, Filter } from 'lucide-react';
import { formatCurrencyIDR } from '@/lib/utils';

export default function TransactionHistoryPage() {
  const { allTransactions } = useAppContext(); 
  const [filterDate, setFilterDate] = useState('');

  const salesTransactions = useMemo(() => {
    return allTransactions
      .filter(tx => tx.type === 'sale')
      .filter(tx => {
        if (!filterDate) return true;
        return format(new Date(tx.date), 'yyyy-MM-dd') === filterDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTransactions, filterDate]);

  const getStatusVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'Pending': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Order History</h1>
        <p className="mt-2 text-lg text-muted-foreground">Review your past purchases and their status.</p>
      </header>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Your Orders</CardTitle>
          <CardDescription>A list of all your past orders.</CardDescription>
          <div className="mt-4">
            <Label htmlFor="filter-date" className="flex items-center text-sm font-medium mb-1">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" /> Filter by Date
            </Label>
            <Input
              id="filter-date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          {salesTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">You have no orders matching the criteria.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead><CalendarDays className="inline-block mr-1 h-4 w-4" />Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right"><DollarSign className="inline-block mr-1 h-4 w-4" />Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.id.substring(0,12)}...</TableCell>
                    <TableCell>{format(new Date(tx.date), 'MMM dd, yyyy HH:mm')}</TableCell>
                    <TableCell>
                      {tx.items.map(item => `${item.name} (x${item.quantity})`).join(', ') || tx.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrencyIDR(tx.totalAmount)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Dummy Label component if not using shadcn/ui Label, otherwise ensure Label is imported.
const Label = ({ htmlFor, children, className }: { htmlFor: string, children: React.ReactNode, className?: string }) => (
  <label htmlFor={htmlFor} className={className}>{children}</label>
);

