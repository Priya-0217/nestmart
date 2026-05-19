'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, MessageSquarePlus, Send, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { RatingStars } from '@/components/ui/rating-stars';
import { RatingInput } from '@/components/ui/rating-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { reviewsApi, type Review } from '@/lib/api';
import { useToastStore } from '@/store/toast-store';

type ProductReviewsSectionProps = {
  productId: string;
  rating: number;
  ratingCount: number;
};

const PAGE_SIZE = 6;

export function ProductReviewsSection({ productId, rating, ratingCount }: ProductReviewsSectionProps) {
  const { status } = useSession();
  const pushToast = useToastStore((state) => state.push);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Review[]>([]);
  const [hasMore, setHasMore] = useState(false);

  // Review Form State
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    rating: 5,
    title: '',
    body: ''
  });

  const fetchReviews = async (pageNum = 1, isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [publicResult, ownResult] = await Promise.all([
        reviewsApi.list({ productId, page: pageNum, limit: PAGE_SIZE, status: 'approved' }),
        status === 'authenticated' ? reviewsApi.mine({ productId }).catch(() => ({ items: [] })) : Promise.resolve({ items: [] })
      ]);

      setItems((current) => {
        const combined = isInitial ? [...ownResult.items, ...publicResult.items] : [...current, ...publicResult.items];
        // Deduplicate by _id
        const unique = Array.from(new Map(combined.map((item) => [item._id, item])).values());
        // Sort by date (optional, but good for consistency)
        return unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });

      setPage(pageNum);
      setHasMore(publicResult.pagination.page < publicResult.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      if (isInitial) setItems([]);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, true);
  }, [productId, status]);

  const ratingBars = useMemo(() => {
    const total = Math.max(ratingCount, 1);
    return [5, 4, 3, 2, 1].map((star) => {
      const synthetic = Math.max(0, Math.round((rating - Math.abs(5 - star) * 0.75) * ratingCount * 0.18));
      return {
        star,
        percent: Math.min(100, Math.round((synthetic / total) * 100))
      };
    });
  }, [rating, ratingCount]);

  async function loadMore() {
    await fetchReviews(page + 1, false);
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (status !== 'authenticated') {
      pushToast('Please login to write a review', 'warning');
      return;
    }

    if (form.body.length < 5) {
      pushToast('Review body must be at least 5 characters', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.create({
        productId,
        rating: form.rating,
        title: form.title,
        body: form.body
      });
      pushToast('Thank you! Your review has been posted.', 'success');
      setShowForm(false);
      setForm({ rating: 5, title: '', body: '' });
      // Refresh the list to show the new review (including pending)
      await fetchReviews(1, true);
    } catch (err: any) {
      pushToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="space-y-5 scroll-mt-28">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Ratings & reviews</h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            if (status !== 'authenticated') {
              pushToast('Please login to write a review', 'warning');
              return;
            }
            setShowForm(!showForm);
          }}
        >
          <MessageSquarePlus className="h-4 w-4" />
          Write a Review
        </Button>
      </div>

      <p className="text-sm text-foreground/60">
        Reviews are limited to purchased items. You can also open them from your{' '}
        <Link href="/account/orders" className="font-medium text-primary underline-offset-4 hover:underline">
          My Orders
        </Link>
        {' '}page to edit a past review.
      </p>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50">
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Write your review</h3>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Your Rating</p>
              <RatingInput
                value={form.rating}
                onChange={(val) => setForm({ ...form, rating: val })}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Review Title (Optional)</p>
              <Input
                placeholder="Summarize your experience..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Review Body</p>
              <Textarea
                placeholder="What did you think about the product? What did you like or dislike?"
                rows={4}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
              />
              <p className="text-[10px] text-foreground/50">Minimum 5 characters. Reviews are moderated for quality and authenticity.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="gap-2" disabled={submitting}>
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Post Review'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-[220px,1fr]">
        <div>
          <p className="text-3xl font-black text-foreground">{Number.isFinite(rating) ? rating.toFixed(1) : '0.0'}</p>
          <RatingStars rating={rating} reviewCount={ratingCount} />
          <p className="mt-2 text-xs text-foreground/55">Based on {ratingCount} reviews</p>
        </div>
        <div className="space-y-2">
          {ratingBars.map((bar) => (
            <div key={bar.star} className="flex items-center gap-2 text-xs">
              <span className="w-10 text-foreground/70">{bar.star}★</span>
              <div className="h-2 flex-1 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-secondary" style={{ width: `${bar.percent}%` }} />
              </div>
              <span className="w-12 text-right text-foreground/60">{bar.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-sm text-foreground/60">No reviews yet — be the first to share your experience</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((review) => (
            <article key={review._id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                  {review.userName.slice(0, 1).toUpperCase()}
                </div>
                <p className="font-semibold text-foreground">{review.userName}</p>
                {review.verifiedPurchase ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-1 text-xs font-semibold text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified Purchase
                  </span>
                ) : null}
                {review.status === 'pending' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                    Pending Approval
                  </span>
                )}
                <span className="ml-auto text-xs text-foreground/50">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-3">
                <RatingStars rating={review.rating} />
                {review.title ? <h4 className="mt-1 text-sm font-bold text-foreground">{review.title}</h4> : null}
                <p className="mt-1 text-sm text-foreground/75">{review.body}</p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-foreground/60">
                <button className="focus-ring inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 hover:bg-muted">
                  <ThumbsUp className="h-3.5 w-3.5" /> Helpful
                </button>
                <button className="focus-ring inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 hover:bg-muted">
                  <ThumbsDown className="h-3.5 w-3.5" /> Not Helpful
                </button>
              </div>
            </article>
          ))}

          {hasMore ? (
            <button type="button" className="focus-ring mx-auto inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted" onClick={loadMore}>
              Load more reviews
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
