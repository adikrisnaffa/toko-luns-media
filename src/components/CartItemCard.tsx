
"use client";

import Image from 'next/image';
import type { CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/contexts/AppContext';
import { X, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

interface CartItemCardProps {
  item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const { updateCartItemQuantity, removeFromCart } = useAppContext();

  const handleQuantityChange = (newQuantity: number) => {
    const quantity = Math.max(0, Math.min(newQuantity, item.product.stock));
     if (quantity === 0) {
      removeFromCart(item.product.id);
    } else {
      updateCartItemQuantity(item.product.id, quantity);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b bg-card rounded-lg shadow-sm mb-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={item.product.imageUrl}
          alt={item.product.name}
          layout="fill"
          objectFit="cover"
          data-ai-hint={item.product.dataAiHint || "product image"}
        />
      </div>
      <div className="flex-grow">
        <Link href={`/products/${item.product.id}`} legacyBehavior>
          <a className="text-lg font-semibold hover:text-primary transition-colors">{item.product.name}</a>
        </Link>
        <p className="text-sm text-muted-foreground">{item.product.category}</p>
        <p className="text-md font-medium text-primary">${item.product.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.quantity - 1)} aria-label="Decrease quantity">
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
          className="w-16 h-10 text-center"
          min="0"
          max={item.product.stock}
          aria-label="Item quantity"
        />
        <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.quantity + 1)} aria-label="Increase quantity">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <p className="w-24 text-right font-semibold text-lg">${(item.product.price * item.quantity).toFixed(2)}</p>
      <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)} className="text-destructive hover:text-destructive" aria-label="Remove item">
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
