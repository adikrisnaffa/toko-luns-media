
"use client";

import { useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import ProductCard from './ProductCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ThumbsUp } from 'lucide-react';

export default function RecommendedProducts() {
  const { recommendedProducts, isRecommendationsLoading, fetchRecommendations, cart } = useAppContext();

  // Fetch recommendations when component mounts or cart changes (if not handled globally by context)
  // The context already handles this, but an explicit call here could be an alternative design.
  // useEffect(() => {
  //   if (cart.length > 0) {
  //     fetchRecommendations();
  //   }
  // }, [cart, fetchRecommendations]);


  if (cart.length === 0) return null; // Don't show if cart is empty

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <ThumbsUp className="mr-2 h-6 w-6 text-primary" />
          You Might Also Like
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isRecommendationsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        )}
        {!isRecommendationsLoading && recommendedProducts.length === 0 && (
          <p className="text-muted-foreground">No recommendations available at the moment.</p>
        )}
        {!isRecommendationsLoading && recommendedProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recommendedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
