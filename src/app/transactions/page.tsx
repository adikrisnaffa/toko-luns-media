
"use client";

import { useState, useMemo, useEffect } from 'react'; 
import { useAppContext } from '@/contexts/AppContext';
import type { Transaction, TransactionItem } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import EditOrderDialog from '@/components/EditOrderDialog'; 
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label'; 
import { CalendarDays, DollarSign, Filter, Edit3, Trash2 } from 'lucide-react';
import { formatCurrencyIDR } from '@/lib/utils';

// Helper component for client-side date formatting
const ClientSideFormattedDate = ({ dateIsoString, formatPattern }: { dateIsoString: string, formatPattern: string }) => {
  const [clientDate, setClientDate] = useState<string | null>(null);

  useEffect(() => {
    setClientDate(format(new Date(dateIsoString), formatPattern));
  }, [dateIsoString, formatPattern]);

  if (clientDate === null) {
    return <>...</>; 
  }

  return <>{clientDate}</>;
};

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function TransactionHistoryPage() {
  const { allTransactions, deleteSaleTransaction, products } = useAppContext(); 
  const [filterDate, setFilterDate] = useState(getTodayDateString()); // Default to today's date
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [showEditOrderDialog, setShowEditOrderDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);


  const salesTransactions = useMemo(() => {
    return allTransactions
      .filter(tx => tx.type === 'sale')
      .filter(tx => {
        if (!filterDate) return true; // Show all if filterDate is empty
        
        const txDate = new Date(tx.date);
        // Create Date objects for the start and end of the filterDate (local time)
        const dayStart = new Date(filterDate + 'T00:00:00'); 
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000); 

        return txDate >= dayStart && txDate < dayEnd;
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

  const handleDeleteClick = (transactionId: string) => {
    setDeletingTransactionId(transactionId);
    setShowDeleteConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (deletingTransactionId) {
      deleteSaleTransaction(deletingTransactionId);
    }
    setShowDeleteConfirmDialog(false);
    setDeletingTransactionId(null);
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditOrderDialog(true);
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
          <CardDescription>A list of all your past orders. You can edit quantities or delete orders.</CardDescription>
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
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.id.substring(0,12)}...</TableCell>
                    <TableCell>
                      <ClientSideFormattedDate dateIsoString={tx.date} formatPattern="MMM dd, yyyy HH:mm" />
                    </TableCell>
                    <TableCell>
                      {tx.items.map(item => `${item.name} (x${item.quantity})`).join(', ') || tx.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrencyIDR(tx.totalAmount)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(tx)} className="hover:text-primary">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(tx.id)} className="hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action will also attempt to restock the items and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirmDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingTransaction && (
        <EditOrderDialog
          transaction={editingTransaction}
          isOpen={showEditOrderDialog}
          onClose={() => {
            setShowEditOrderDialog(false);
            setEditingTransaction(null);
          }}
          allProducts={products}
        />
      )}
    </div>
  );
}
    
