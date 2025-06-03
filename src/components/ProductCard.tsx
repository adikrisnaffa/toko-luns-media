
"use client";

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { ShoppingCart } from 'lucide-react';
import { formatCurrencyIDR } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useAppContext();

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="aspect-video relative w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={product.dataAiHint || "product image"}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1">{product.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden">
          {product.description}
        </CardDescription>
        <p className="text-lg font-bold text-primary">{formatCurrencyIDR(product.price)}</p>
        <p className="text-xs text-muted-foreground">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button 
          onClick={() => addToCart(product)} 
          className="w-full"
          disabled={product.stock === 0}
          variant={product.stock > 0 ? "default" : "outline"}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}
