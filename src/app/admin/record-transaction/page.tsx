
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

type TransactionType = 'income' | 'expense';

export default function RecordTransactionPage() {
  const { currentUser, addTransactionRecord } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/');
    }
    // If !currentUser, AppLayout will handle redirect to /login
  }, [currentUser, router]);


  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="flex justify-center items-center h-screen"><p>Loading or Access Denied...</p></div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid positive amount.", variant: "destructive" });
      return;
    }
    if (!description.trim() || !category.trim()) {
       toast({ title: "Missing Fields", description: "Please fill in description and category.", variant: "destructive" });
      return;
    }

    addTransactionRecord({
      type,
      amount: numericAmount,
      description,
      category,
    });
    
    toast({ title: "Success", description: "Transaction recorded successfully." });
    // Reset form
    setType('income');
    setAmount('');
    setDescription('');
    setCategory('');
    router.push('/admin/financial-report'); 
  };

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
      </Button>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Record New Transaction</CardTitle>
          <CardDescription>Log income or expenses for your business.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={type} onValueChange={(value: TransactionType) => setType(value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount (IDR)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 100000 or 100000.50"
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Office Supplies, Services Rendered"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the transaction"
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              <CheckCircle className="mr-2 h-5 w-5" />
              Record Transaction
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
