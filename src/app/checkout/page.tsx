
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, User, Home, Mail } from 'lucide-react';
import { formatCurrencyIDR } from '@/lib/utils';

export default function CheckoutPage() {
  const { cart, getCartTotal, placeOrder, getCartItemCount } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Manual Entry'); // Simplified

  const cartTotal = getCartTotal();
  const itemCount = getCartItemCount();

  useEffect(() => {
    if (itemCount === 0 && typeof window !== 'undefined') { 
      toast({
        title: "Keranjang Kosong",
        description: "Anda akan dialihkan ke halaman keranjang.",
      });
      router.push('/cart');
    }
  }, [itemCount, router, toast]);

  if (itemCount === 0) {
    return (
      <div className="container mx-auto flex h-screen flex-col items-center justify-center py-8">
        <CreditCard className="mb-4 h-16 w-16 text-muted-foreground" />
        <p className="text-xl text-muted-foreground">Keranjang Anda kosong.</p>
        <p className="text-md text-muted-foreground">Mengalihkan ke halaman keranjang...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !email) {
      toast({
        title: "Informasi Kurang",
        description: "Harap isi semua kolom yang diperlukan.",
        variant: "destructive",
      });
      return;
    }

    try {
      await placeOrder({ name, address, paymentMethod }); 
      router.push('/transactions'); 
    } catch (error) {
      toast({
        title: "Pesanan Gagal",
        description: "Terjadi masalah saat membuat pesanan Anda. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center justify-center">
          <CreditCard className="mr-3 h-10 w-10 text-primary" />
          Checkout
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pengiriman</CardTitle>
              <CardDescription>Masukkan nama dan alamat Anda untuk pengiriman.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground"/>Nama Lengkap</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground"/>Alamat Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="address" className="flex items-center"><Home className="mr-2 h-4 w-4 text-muted-foreground"/>Alamat</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metode Pembayaran</CardTitle>
              <CardDescription>Pembayaran akan diproses secara manual.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Metode terpilih: <strong>{paymentMethod}</strong></p>
              <p className="text-sm mt-2">Instruksi lebih lanjut akan diberikan setelah melakukan pemesanan untuk pembayaran manual.</p>
            </CardContent>
          </Card>
          
          <Button type="submit" size="lg" className="w-full">Buat Pesanan</Button>
        </form>

        <div className="md:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>{formatCurrencyIDR(item.product.price * item.quantity)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>{formatCurrencyIDR(cartTotal)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Pengiriman</span>
                <span>GRATIS</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrencyIDR(cartTotal)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
