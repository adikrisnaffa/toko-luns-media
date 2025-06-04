
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { Transaction, TransactionItem, Product } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencyIDR } from '@/lib/utils';

interface EditOrderDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[]; // Needed for stock information
}

export default function EditOrderDialog({ transaction, isOpen, onClose, allProducts }: EditOrderDialogProps) {
  const { updateSaleOrder } = useAppContext();
  const { toast } = useToast();
  const [editableItems, setEditableItems] = useState<TransactionItem[]>([]);

  useEffect(() => {
    if (transaction && transaction.type === 'sale') {
      setEditableItems(JSON.parse(JSON.stringify(transaction.items))); // Deep copy
    } else {
      setEditableItems([]);
    }
  }, [transaction, isOpen]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setEditableItems(prevItems => 
      prevItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity: Math.max(0, newQuantity) } // Allow 0 for potential removal
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setEditableItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const currentTotal = useMemo(() => {
    return editableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [editableItems]);

  const handleSave = async () => {
    if (!transaction) return;

    const finalItems = editableItems.filter(item => item.quantity > 0);
    if (finalItems.length === 0) {
      toast({ title: "Empty Order", description: "An order must have at least one item. Delete the order instead if needed.", variant: "destructive"});
      return;
    }
    
    const success = await updateSaleOrder(transaction.id, finalItems, transaction.items);
    if (success) {
      onClose();
    }
    // Toast messages for success/failure are handled within updateSaleOrder
  };
  
  if (!transaction || transaction.type !== 'sale') {
    return null; 
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Order: {transaction.id.substring(0,12)}...</DialogTitle>
          <DialogDescription>Modify item quantities or remove items from this order. Changes will affect product stock.</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] p-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="w-24">Price</TableHead>
                <TableHead className="w-32 text-center">Quantity</TableHead>
                <TableHead className="w-28 text-right">Subtotal</TableHead>
                <TableHead className="w-12 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableItems.map(item => {
                const productDetails = allProducts.find(p => p.id === item.productId);
                // Max quantity an item can be set to: its original quantity in this order + whatever stock is currently available for this product *globally*
                // This is a simplification. A more robust solution would need to track stock reserved by other operations.
                const effectiveMaxQuantity = item.quantity + (productDetails?.stock ?? 0);

                return (
                <TableRow key={item.productId}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{formatCurrencyIDR(item.price)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                       <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.productId, item.quantity - 1)} disabled={item.quantity <= 0}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10) || 0)}
                        className="w-14 h-7 text-center px-1"
                        min="0"
                        // max={effectiveMaxQuantity} // Disabling max for simplicity for now, relies on backend validation in updateSaleOrder
                      />
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(item.productId, item.quantity + 1)} 
                        // disabled={item.quantity >= effectiveMaxQuantity} // Disabling max for simplicity
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrencyIDR(item.price * item.quantity)}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-7 w-7" onClick={() => handleRemoveItem(item.productId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="mt-4 text-right">
            <p className="text-lg font-semibold">New Total: {formatCurrencyIDR(currentTotal)}</p>
        </div>
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    