"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, MessageSquarePlus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { RatingInput } from '@/components/ui/rating-input';
import { RatingStars } from '@/components/ui/rating-stars';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SectionHeading } from '@/components/ui/section-heading';
import { ordersApi, reviewsApi, type Order as ApiOrder, type Review } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { useToastStore } from '@/store/toast-store';

type ReviewDraft = {
  rating: number;
  title: string;
  body: string;
};

function isReviewAllowed(status: string) {
  return ['paid', 'shipped', 'delivered'].includes(status);
}

function statusTone(status: string) {
  if (status === 'delivered') return 'success';
  if (status === 'cancelled' || status === 'returned' || status === 'refunded') return 'warning';
  return 'muted';
}

function ReviewEditor({
  productId,
  existingReview,
  disabled,
  onSaved
}: {
  productId: string;
  existingReview: Review | null;
  disabled: boolean;
  onSaved: (review: Review) => void;
}) {
  const pushToast = useToastStore((state) => state.push);
  const [open, setOpen] = useState(Boolean(existingReview));
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState<ReviewDraft>({
    rating: existingReview?.rating ?? 5,
    title: existingReview?.title ?? '',
    body: existingReview?.body ?? ''
  });

  useEffect(() => {
    setOpen(Boolean(existingReview));
    setDraft({
      rating: existingReview?.rating ?? 5,
      title: existingReview?.title ?? '',
      body: existingReview?.body ?? ''
    });
  }, [existingReview]);

  const saveReview = async () => {
    if (draft.body.trim().length < 5) {
      pushToast('Review body must be at least 5 characters', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        rating: draft.rating,
        title: draft.title.trim() || undefined,
        body: draft.body.trim()
      };

      const review = existingReview ? await reviewsApi.update(existingReview._id, payload) : await reviewsApi.create({ productId, ...payload });
      onSaved(review);
      setOpen(true);
      pushToast(existingReview ? 'Thanks! Your review has been updated.' : 'Thanks! Your review has been submitted.', 'success');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Failed to save review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (disabled) {
    return <p className="text-sm text-foreground/55">Review access unlocks once the order is paid, shipped, or delivered.</p>;
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="rounded-full" onClick={() => setOpen(true)}>
        <MessageSquarePlus className="mr-2 h-4 w-4" />
        Write a review
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Your rating</p>
          <div className="mt-2">
            <RatingInput value={draft.rating} onChange={(rating) => setDraft((current) => ({ ...current, rating }))} />
          </div>
        </div>

        <label className="block text-sm font-medium text-foreground">
          Review title
          <input
            className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            placeholder="Summarize your experience"
          />
        </label>

        <label className="block text-sm font-medium text-foreground">
          Review
          <Textarea
            className="mt-1"
            rows={4}
            value={draft.body}
            onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
            placeholder="What did you like or dislike about the product?"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="text-sm text-foreground/60 hover:text-foreground" onClick={() => setOpen(false)}>
            Hide editor
          </button>
          <Button type="button" className="rounded-full" onClick={saveReview} disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? 'Saving...' : existingReview ? 'Update review' : 'Submit review'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const pushToast = useToastStore((state) => state.push);

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await ordersApi.get(orderId);
        if (mounted) setOrder(data);
      } catch (error) {
        if (mounted) setOrder(null);
        pushToast(error instanceof Error ? error.message : 'Failed to load order', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [orderId, pushToast]);

  useEffect(() => {
    let mounted = true;
    setReviewsLoading(true);
    reviewsApi
      .mine()
      .then((result) => {
        if (mounted) setReviews(result.items);
      })
      .catch(() => {
        if (mounted) setReviews([]);
      })
      .finally(() => {
        if (mounted) setReviewsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const reviewByProduct = useMemo(() => {
    return reviews.reduce<Record<string, Review>>((accumulator, review) => {
      accumulator[review.productId] = review;
      return accumulator;
    }, {});
  }, [reviews]);

  if (loading) {
    return <div className="surface p-6 text-sm text-foreground/60">Loading order details...</div>;
  }

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        description="We could not load that order."
        ctaLabel="Back to orders"
        ctaHref="/account/orders"
      />
    );
  }

  const reviewAllowed = isReviewAllowed(order.status);

  return (
    <div className="space-y-6">
      <SectionHeading
        title={order.orderNumber}
        subtitle={`Placed ${formatDate(order.placedAt ?? order.createdAt ?? new Date().toISOString())}`}
        action={
          <Link
            href="/account/orders"
            className="button-interactive group focus-ring inline-flex items-center gap-2 rounded-full border border-primary bg-bgSoft px-5 py-2.5 text-sm font-medium text-primary transition-all duration-300 ease-in-out hover:bg-primary hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Status</p>
          <Badge tone={statusTone(order.status)} className="mt-2 capitalize">
            {order.status.replace('_', ' ')}
          </Badge>
        </div>
        <div className="surface p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Payment</p>
          <p className="mt-2 text-sm font-medium text-foreground capitalize">{order.paymentMethod} / {order.paymentStatus}</p>
        </div>
        <div className="surface p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Total</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{formatPrice(order.total)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {order.items.map((item) => {
          const existingReview = reviewByProduct[item.productId] ?? null;
          return (
            <article key={item.productId} className="surface p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Purchased item</p>
                  <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
                  <p className="text-sm text-foreground/65">Qty {item.quantity} - {formatPrice(item.unitPrice)} each</p>
                  <p className="text-sm font-medium text-foreground/80">Subtotal {formatPrice(item.subtotal)}</p>
                </div>

                <div className="space-y-3 lg:max-w-xl lg:min-w-[22rem]">
                  <div className="flex items-center gap-3">
                    {existingReview ? <RatingStars rating={existingReview.rating} reviewCount={1} /> : <RatingStars rating={0} reviewCount={0} />}
                    {existingReview ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Review saved
                      </span>
                    ) : null}
                    {reviewsLoading ? <span className="text-xs text-foreground/45">Loading reviews...</span> : null}
                  </div>

                  {existingReview ? (
                    <div className="rounded-2xl border border-border bg-muted/20 p-4">
                      <p className="text-sm font-semibold text-foreground">{existingReview.title || 'Your review'}</p>
                      <p className="mt-1 text-sm text-foreground/70">{existingReview.body}</p>
                      <p className="mt-2 text-xs text-foreground/45">Current status: {existingReview.status}</p>
                    </div>
                  ) : null}

                  <ReviewEditor
                    productId={item.productId}
                    existingReview={existingReview}
                    disabled={!reviewAllowed}
                    onSaved={(review) => {
                      setReviews((current) => {
                        const next = current.filter((entry) => entry._id !== review._id);
                        next.unshift(review);
                        return next;
                      });
                    }}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
