'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { reviewsApi, type Review } from '@/lib/api';
import { AdminMotionCard, AdminPageHeader } from '../components/admin-ui';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderating, setModerating] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewsApi.listPending(1, 100);
      setReviews(data.items);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleApprove = async (id: string) => {
    setModerating(id);
    try {
      await reviewsApi.moderate(id, { status: 'approved' });
      setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'approved' } : r)));
    } catch (error) {
      console.error('Failed to approve review:', error);
    } finally {
      setModerating(null);
    }
  };

  const handleReject = async (id: string) => {
    setModerating(id);
    try {
      await reviewsApi.moderate(id, { status: 'rejected' });
      setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'rejected' } : r)));
    } catch (error) {
      console.error('Failed to reject review:', error);
    } finally {
      setModerating(null);
    }
  };

  const handleDelete = async (id: string) => {
    setModerating(id);
    try {
      await reviewsApi.remove(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      console.error('Failed to delete review:', error);
    } finally {
      setModerating(null);
    }
  };

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Review Moderation"
        subtitle="Approve, reject, or remove customer reviews with verified purchase badges."
        actions={[
          {
            key: 'refresh',
            node: (
              <Button variant="outline" onClick={loadReviews} disabled={loading} className="rounded-full">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )
          }
        ]}
        chips={<Badge tone={pendingCount > 0 ? 'warning' : 'success'}>{pendingCount} pending moderation</Badge>}
      />

      {loading ? (
        <AdminMotionCard className="p-6 text-center text-foreground/60">Loading reviews...</AdminMotionCard>
      ) : reviews.length === 0 ? (
        <AdminMotionCard className="p-6 text-center text-foreground/60">No reviews to moderate.</AdminMotionCard>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <AdminMotionCard key={review._id} className="border-l-4 border-l-secondary p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{review.userName}</h3>
                    <Badge
                      tone={review.status === 'approved' ? 'success' : review.status === 'rejected' ? 'warning' : 'default'}
                      className="capitalize"
                    >
                      {review.status}
                    </Badge>
                    {review.verifiedPurchase && <Badge tone="muted">Verified Purchase</Badge>}
                  </div>

                  <div className="flex items-center gap-1 text-secondary">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>

                  {review.title && <p className="font-semibold text-foreground">{review.title}</p>}
                  <p className="text-sm text-foreground/65">{review.body}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-foreground/45 pt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {review.status === 'pending' && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleApprove(review._id)} disabled={moderating !== null}>
                        Approve
                      </Button>
                      <Button variant="ghost" size="sm" className="text-amber-600" onClick={() => handleReject(review._id)} disabled={moderating !== null}>
                        Reject
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(review._id)} disabled={moderating !== null}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AdminMotionCard>
          ))}
        </div>
      )}
    </div>
  );
}