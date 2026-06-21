'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Send, Receipt, ChevronLeft, Loader2 } from 'lucide-react'
import type { OrderDTO } from '@/lib/orders'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// Deterministic split of "2024-10-24 12:45:00" -> { date, time } (no locale/Date.now).
function splitOrderDate(raw: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(raw)
  if (!match) return { date: raw, time: '' }
  const [, year, month, day, hourStr, minute] = match
  let hour = Number(hourStr)
  const period = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  return {
    date: `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`,
    time: `${hour}:${minute} ${period}`,
  }
}

interface DishReviewState {
  rating: number
  comment: string
}

const MAX_COMMENT = 500

export function ReviewFormView({
  order,
  viewMode = false,
}: {
  order: OrderDTO
  viewMode?: boolean
}) {
  const router = useRouter()
  const { date, time } = useMemo(
    () => splitOrderDate(order.orderDate),
    [order.orderDate],
  )

  // One review state entry per dish, keyed by item id. In view mode we hydrate
  // from the dish's already-submitted review data.
  const [reviews, setReviews] = useState<Record<number, DishReviewState>>(() =>
    Object.fromEntries(
      order.items.map((item) => [
        item.id,
        {
          rating: item.reviewRating ?? 0,
          comment: item.reviewComment ?? '',
        },
      ]),
    ),
  )
  const [hovered, setHovered] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [toast, setToast] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)

  function setRating(itemId: number, rating: number) {
    setReviews((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], rating },
    }))
  }

  function setComment(itemId: number, comment: string) {
    if (comment.length > MAX_COMMENT) return
    setReviews((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], comment },
    }))
  }

  // Every dish must have a rating (>=1) AND a non-empty comment.
  const allComplete = order.items.every((item) => {
    const r = reviews[item.id]
    return r && r.rating >= 1 && r.comment.trim().length > 0
  })

  async function handleSubmit() {
    setAttempted(true)
    if (!allComplete || submitting) return

    setSubmitting(true)
    try {
      // POST /api/v1/reviews once per dish.
      for (const item of order.items) {
        const body = {
          dishId: item.dishId,
          rating: reviews[item.id].rating,
          comment: reviews[item.id].comment.trim(),
          orderId: order.id,
        }
        console.log('[v0] POST /api/v1/reviews', body)
        await new Promise((resolve) => setTimeout(resolve, 350))
      }

      setToast({ kind: 'success', message: 'Reviews submitted! Thank you 🎉' })
      setTimeout(() => router.push('/orders'), 1500)
    } catch {
      setToast({
        kind: 'error',
        message: 'Something went wrong. Please try again.',
      })
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 rounded-full border border-primary px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
      >
        <ChevronLeft className="size-4" strokeWidth={2.5} />
        Back to Orders
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.85fr_1fr]">
        {/* Left column */}
        <div>
          <h1 className="text-balance font-heading text-4xl font-bold text-secondary sm:text-5xl">
            {viewMode ? 'Your Review' : 'How was your lunch?'}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            {viewMode ? (
              <>
                Here&apos;s the feedback you shared for your visit to{' '}
                <span className="font-bold text-primary">
                  {order.canteenName}
                </span>
                . Thanks for helping the UCD Canteen Hub community!
              </>
            ) : (
              <>
                Your feedback helps us make the UCD Canteen Hub better for
                everyone. Please share your thoughts on the dishes from your
                recent visit to{' '}
                <span className="font-bold text-primary">
                  {order.canteenName}
                </span>
              </>
            )}
          </p>

          {/* Dish review cards */}
          <div className="mt-8 flex flex-col gap-5">
            {order.items.map((item) => {
              const review = reviews[item.id]
              const hover = hovered[item.id] ?? 0
              const commentMissing =
                attempted && review.comment.trim().length === 0
              const ratingMissing = attempted && review.rating < 1

              return (
                <section
                  key={item.id}
                  className="rounded-2xl border border-[#EAE5D9] bg-card p-6 shadow-[0_8px_30px_rgba(141,162,73,0.12)]"
                >
                  {/* Dish row */}
                  <div className="flex items-center gap-4">
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={item.dishImageUrl || '/placeholder.svg'}
                        alt={item.dishName}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-heading text-xl font-bold text-foreground">
                        {item.dishName}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        €{item.pricePerUnit.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Star rating */}
                  <div className="mt-5">
                    <p className="text-sm text-muted-foreground">
                      {viewMode ? 'Your rating:' : 'Rate this dish:'}
                    </p>
                    {viewMode ? (
                      <div
                        className="mt-2 flex select-none items-center gap-1 pointer-events-none"
                        aria-label={`Rated ${review.rating} out of 5 stars`}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={
                              review.rating >= n
                                ? 'size-8 fill-secondary text-secondary'
                                : 'size-8 text-muted-foreground/40'
                            }
                            strokeWidth={2}
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        className="mt-2 flex items-center gap-1"
                        onMouseLeave={() =>
                          setHovered((prev) => ({ ...prev, [item.id]: 0 }))
                        }
                      >
                        {[1, 2, 3, 4, 5].map((n) => {
                          const filled = (hover || review.rating) >= n
                          return (
                            <button
                              key={n}
                              type="button"
                              aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                              aria-pressed={review.rating === n}
                              onClick={() => setRating(item.id, n)}
                              onMouseEnter={() =>
                                setHovered((prev) => ({ ...prev, [item.id]: n }))
                              }
                              className="rounded-md p-0.5 transition-transform hover:scale-110"
                            >
                              <Star
                                className={
                                  filled
                                    ? 'size-8 fill-secondary text-secondary'
                                    : 'size-8 text-muted-foreground/40'
                                }
                                strokeWidth={2}
                              />
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {ratingMissing && (
                      <p className="mt-1.5 text-xs font-medium text-destructive">
                        Please select a rating.
                      </p>
                    )}
                  </div>

                  {/* Comment */}
                  <div className="mt-4">
                    {viewMode ? (
                      <div className="rounded-xl border border-[#EAE5D9] bg-[#F6F4EB] px-4 py-3">
                        <p className="text-sm leading-relaxed text-foreground">
                          {review.comment}
                        </p>
                      </div>
                    ) : (
                      <>
                        <textarea
                          value={review.comment}
                          onChange={(e) => setComment(item.id, e.target.value)}
                          rows={3}
                          placeholder="What did you think of this dish?"
                          aria-label={`Comment for ${item.dishName}`}
                          className={`w-full resize-y rounded-xl border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-secondary ${
                            commentMissing
                              ? 'border-destructive'
                              : 'border-[#EAE5D9]'
                          }`}
                        />
                        <div className="mt-1 flex items-center justify-between">
                          {commentMissing ? (
                            <span className="text-xs font-medium text-destructive">
                              Please share a comment.
                            </span>
                          ) : (
                            <span />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {review.comment.length}/{MAX_COMMENT}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              )
            })}
          </div>

          {/* Submit / Back action */}
          {viewMode ? (
            <Link
              href="/orders"
              className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-sm transition-all hover:brightness-105"
            >
              <ChevronLeft className="size-5" strokeWidth={2.2} />
              Back to Orders
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allComplete || submitting}
              className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-secondary px-6 py-4 text-base font-bold text-secondary-foreground shadow-sm transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" strokeWidth={2.2} />
                  Submitting…
                </>
              ) : (
                <>
                  Submit Review
                  <Send className="size-5" strokeWidth={2.2} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Right column: sticky */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-5">
            {/* Order details */}
            <section className="rounded-2xl border border-[#EAE5D9] bg-card p-6 shadow-[0_8px_30px_rgba(141,162,73,0.12)]">
              <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
                <Receipt className="size-5 text-primary" strokeWidth={2.2} />
                Order Details
              </h2>
              <dl className="mt-4 flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Order ID</dt>
                  <dd className="font-semibold text-foreground">
                    #ORD-{order.id}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Date</dt>
                  <dd className="font-semibold text-foreground">{date}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Time</dt>
                  <dd className="font-semibold text-foreground">{time}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Canteen</dt>
                  <dd className="truncate font-semibold text-foreground">
                    {order.canteenName}
                  </dd>
                </div>
                <div className="my-1 h-px bg-[#EAE5D9]" />
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="font-heading text-xl font-bold text-secondary">
                    €{order.totalAmount.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Decorative card */}
            <section className="rounded-2xl bg-[#8DA249] p-6 text-card">
              <h2 className="font-heading text-2xl font-bold">Help Us Grow!</h2>
              <p className="mt-2 leading-relaxed text-card/90">
                Every review makes our campus food community stronger.
              </p>
            </section>
          </div>
        </aside>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-md items-center justify-center rounded-2xl px-5 py-4 text-center text-sm font-semibold shadow-lg sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 ${
            toast.kind === 'success'
              ? 'bg-primary text-primary-foreground'
              : 'bg-destructive text-card'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
