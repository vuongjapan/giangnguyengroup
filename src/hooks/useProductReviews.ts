import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

export function useProductReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (data) setReviews(data as unknown as ProductReview[]);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const addReview = async (review: { product_id: string; user_id: string; rating: number; comment: string; reviewer_name: string }) => {
    const { error } = await supabase.from('product_reviews').insert(review as any);
    if (error) throw error;
    await fetchReviews();
  };

  const deleteReview = async (id: string) => {
    await supabase.from('product_reviews').delete().eq('id', id);
    await fetchReviews();
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return { reviews, loading, addReview, deleteReview, avgRating, refetch: fetchReviews };
}
