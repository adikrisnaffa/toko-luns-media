
"use client";

import Link from 'next/link';
import { useAppContext } from '@/contexts/AppContext';
import CartItemCard from '@/components/CartItemCard';
import RecommendedProducts from '@/components/RecommendedProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Trash2 } from 'lucide-react';

export default function ShoppingCartPage() {
  const { cart, getCartTotal, clearCart, getCartItemCount } = useAppContext();
  const cartTotal = getCartTotal();
  const itemCount = getCartItemCount();

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center justify-center">
          <ShoppingBag className="mr-3 h-10 w-10 text-primary" />
          Your Shopping Cart
        </h1>
        {itemCount > 0 && <p className="mt-2 text-lg text-muted-foreground">{itemCount} item(s) in your cart</p>}
      </header>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
          <p className="text-2xl font-semibold text-muted-foreground mb-4">Your cart is empty.</p>
          <Link href="/" legacyBehavior>
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Cart Items</h2>
                <Button variant="outline" onClick={clearCart} className="text-destructive hover:text-destructive hover:border-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
                </Button>
            </div>
            <div className="space-y-4">
              {cart.map(item => (
                <CartItemCard key={item.product.id} item={item} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span>IDR {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>IDR {cartTotal.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/checkout" legacyBehavior passHref>
                  <Button size="lg" className="w-full">Proceed to Checkout</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
      <RecommendedProducts />
    </div>
  );
}
