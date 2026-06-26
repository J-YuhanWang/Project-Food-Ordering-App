'use client'

import {useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Hash,
  Calendar,
  ShoppingCart,
  Star,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import {
  type OrderDTO,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/orders'
import apiClient from "@/lib/api/client";

const PAGE_SIZE = 5

// Active statuses for the sidebar "Active Orders" tally.
const ACTIVE_STATUSES: OrderStatus[] = [
  'INITIALIZED',
  'CONFIRMED',
  'READY_FOR_PICKUP',
]

// Quick-filter pills. Each carries the active fill + inactive outline classes.
const FILTERS: {
  label: string
  value: OrderStatus | 'ALL'
  active: string
}[] = [
  { label: 'All', value: 'ALL', active: 'bg-[#8DA249] text-card' },
  {
    label: 'Initialized',
    value: 'INITIALIZED',
    active: 'bg-muted-foreground text-card',
  },
  {
    label: 'Confirmed',
    value: 'CONFIRMED',
    active: 'bg-[#3A6A94] text-card',
  },
  {
    label: 'Ready for Pickup',
    value: 'READY_FOR_PICKUP',
    active: 'bg-secondary text-secondary-foreground',
  },
  {
    label: 'Completed',
    value: 'COMPLETED',
    active: 'bg-primary text-primary-foreground',
  },
  {
    label: 'Cancelled',
    value: 'CANCELLED',
    active: 'bg-destructive text-card',
  },
  {
    label: 'Failed',
    value: 'FAILED',
    active: 'bg-[#7A1F1F] text-card',
  },
  {
    label: 'Refunded',
    value: 'REFUNDED',
    active: 'bg-muted text-card',
  },
]

// Status badge presentation, keyed by orderStatus.
const STATUS_BADGE: Record<
  OrderStatus,
  { label: string; className: string; icon: typeof Package }
> = {
  INITIALIZED: {
    label: 'Pending Payment',
    className: 'bg-muted text-muted-foreground',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Preparing',
    className: 'bg-[#4B7BA8]/15 text-[#3A6A94]',
    icon: Package,
  },
  READY_FOR_PICKUP: {
    label: 'Ready! 🎉',
    className: 'bg-secondary/15 text-secondary',
    icon: Package,
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-primary/15 text-primary',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-destructive/12 text-destructive',
    icon: XCircle,
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-[#7A1F1F]/12 text-[#7A1F1F]',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Refunded',
    className: 'bg-muted text-muted-foreground',
    icon: XCircle,
  },
}

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  PENDING: 'bg-secondary/15 text-secondary',
  COMPLETED: 'bg-primary/15 text-primary',
  FAILED: 'bg-destructive/12 text-destructive',
  REFUND_PENDING: 'bg-[#E8C98A]/40 text-[#B8862F]',
  REFUNDED: 'bg-muted text-muted-foreground',
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

// Deterministic date formatter -> "Oct 24, 2024 • 12:45 PM" (no locale/Date.now dependency).
function formatOrderDate(raw: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(raw)
  if (!match) return raw
  const [, year, month, day, hourStr, minute] = match
  const monthLabel = MONTHS[Number(month) - 1]
  let hour = Number(hourStr)
  const period = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  return `${monthLabel} ${Number(day)}, ${year} • ${hour}:${minute} ${period}`
}

export function OrderHistoryView() {
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [page, setPage] = useState(0)
  const [last, setLast] = useState(false)
  // Bound strictly to PageOrderDTO.totalElements (server-side total, not the
  // client-side loaded array length).
  const [totalElements,setTotalElements] = useState(0)
  const [loading,setLoading] = useState(true)

  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'ALL'>('ALL')


  const totalOrders = totalElements
  const activeOrders = orders.filter((o) =>
    ACTIVE_STATUSES.includes(o.orderStatus),
  ).length

  const visibleOrders = orders.filter(
    (o) => activeFilter === 'ALL' || o.orderStatus === activeFilter,
  )
  useEffect(() => {
    apiClient.get('/api/v1/orders/my-orders',{params:{page:0, size:PAGE_SIZE}})
        .then((res)=>{
          const data=res.data.data
          setOrders(data.content)
          setLast(data.last)
          setTotalElements(data.totalElements)
        })
        .finally(()=>setLoading(false))
  }, []);

  const [loadingMore,setLoadingMore] = useState(false)
  function loadMore() {
    const nextPage = page + 1
    setLoadingMore(true)
    apiClient.get('/api/v1/orders/my-orders',{ params :{page: nextPage, size: PAGE_SIZE}})
        .then((res)=>{
          const data=res.data.data
          setOrders((prev)=>[...prev, ...data.content])
          setPage(nextPage)
          setLast(data.last)
        })
        .finally(()=>setLoadingMore(false))
  }

  // Stands in for PATCH /api/v1/orders/{orderId}/status?newStatus=CANCELLED.
  function cancelOrder(orderId: number) {
    apiClient.post(`/api/v1/orders/${orderId}/cancel`)
        .then(()=>{
          setOrders((prev)=>
          prev.map((o)=>o.id===orderId? {...o,orderStatus:'CANCELLED'}:o))
        })
        .catch((err) => {
          const message = err?.response?.data?.message || 'Failed to cancel order'
          alert(message)
        })
  }

  if (loading) return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <header>
        <h1 className="text-balance font-heading text-4xl font-bold text-foreground sm:text-5xl">
          Your Order History
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your orders, grab your pickup codes and reorder favourites.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
        {/* Left column: sticky sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-5">
            {/* Summary card */}
            <section className="rounded-3xl border border-[#EAE5D9] bg-card p-6 shadow-[0_8px_30px_rgba(141,162,73,0.12)]">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Summary
              </h2>
              <dl className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-muted-foreground">Total Orders</dt>
                  <dd className="font-heading text-3xl font-bold text-[#8DA249]">
                    {totalOrders}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-muted-foreground">
                    Active Orders
                  </dt>
                  <dd className="font-heading text-3xl font-bold text-[#8DA249]">
                    {activeOrders}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Quick filters card */}
            <section className="rounded-3xl border border-[#EAE5D9] bg-card p-6 shadow-[0_8px_30px_rgba(141,162,73,0.12)]">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Quick Filters
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {FILTERS.map((f) => {
                  const active = activeFilter === f.value
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setActiveFilter(f.value)}
                      aria-pressed={active}
                      className={
                        active
                          ? `rounded-full px-3.5 py-1.5 text-sm font-semibold ${f.active}`
                          : 'rounded-full border border-[#EAE5D9] bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted'
                      }
                    >
                      {f.label}
                    </button>
                  )
                })}
              </div>
            </section>
          </div>
        </aside>

        {/* Right column: order feed */}
        <main className="flex flex-col gap-5">
          {visibleOrders.length === 0 ? (
            <div className="rounded-3xl border border-[#EAE5D9] bg-card p-12 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Package className="size-7" />
              </span>
              <p className="mt-4 font-heading text-xl font-bold text-foreground">
                No orders here yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Orders with this status will appear here.
              </p>
            </div>
          ) : (
            visibleOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={() => cancelOrder(order.id)}
              />
            ))
          )}

          {/* Load more */}
          {!last && activeFilter === 'ALL' && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/10"
              >
                Load more orders
                <ChevronDown className="size-4" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function OrderCard({
  order,
  onCancel,
}: {
  order: OrderDTO
  onCancel: () => void
}) {
  const router = useRouter()
  const [reordering, setReordering] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const badge = STATUS_BADGE[order.orderStatus]
  const BadgeIcon = badge.icon

  // Smart collapse: orders with >2 items show only the first 2 until expanded.
  const COLLAPSE_THRESHOLD = 2
  const isCollapsible = order.items.length > COLLAPSE_THRESHOLD
  const visibleItems =
    isCollapsible && !expanded
      ? order.items.slice(0, COLLAPSE_THRESHOLD)
      : order.items
  const hiddenCount = order.items.length - COLLAPSE_THRESHOLD

  // Reorder: clear cart, then add each item back, then route to /cart.
  async function handleReorder() {
    setReordering(true)
    try {
      // DELETE /api/v1/cart
      await new Promise((r) => setTimeout(r, 400))
      // POST /api/v1/cart/items/{dishId}?quantity={qty} for each item
      for (const item of order.items) {
        console.log(
          `[v0] reorder add dishId=${item.dishId} quantity=${item.quantity}`,
        )
        await new Promise((r) => setTimeout(r, 150))
      }
      router.push('/cart')
    } finally {
      setReordering(false)
    }
  }

  return (
    <article className="rounded-3xl border border-[#EAE5D9] bg-card p-6 shadow-[0_8px_30px_rgb(230,225,210,0.4)]">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            {order.canteenName}
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
          >
            <BadgeIcon className="size-3.5" strokeWidth={2.5} />
            {badge.label}
          </span>
        </div>
        <p className="shrink-0 font-heading text-2xl font-bold text-secondary">
          €{order.totalAmount.toFixed(2)}
        </p>
      </div>

      {/* Sub-header row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Hash className="size-4" />
          ORD-{order.id}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="size-4" />
          {formatOrderDate(order.orderDate)}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_BADGE[order.paymentStatus]}`}
        >
          {order.paymentStatus}
        </span>
      </div>

      {/* Items — each in a soft oatmeal-tinted wrapper. Collapses past 2 items. */}
      <ul className="mt-4 flex flex-col gap-2.5">
        {visibleItems.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl bg-[#F6F4EB] p-3"
          >
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={item.dishImageUrl || '/placeholder.svg'}
                alt={item.dishName}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <p className="truncate text-sm font-bold text-foreground">
                {item.dishName}
              </p>
              <span className="shrink-0 text-sm text-muted-foreground">
                x{item.quantity}
              </span>
            </div>
            <p className="shrink-0 text-sm font-semibold text-foreground">
              €{item.subtotal.toFixed(2)}
            </p>
          </li>
        ))}
      </ul>

      {/* Smart expand/collapse toggle for orders with more than 2 items */}
      {isCollapsible && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg px-1 py-1 font-sans text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded ? 'Collapse' : `Expand ${hiddenCount} more item${hiddenCount > 1 ? 's' : ''}`}
          <ChevronDown
            className={`size-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            strokeWidth={2.5}
          />
        </button>
      )}

      {/* Pickup code block — shown once payment is settled (COMPLETED), styled per status.
          Both states share one identical skeleton; only the tint and left-text color differ. */}
      {order.paymentStatus === 'COMPLETED' &&
        order.orderStatus === 'CONFIRMED' && (
          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-[#EFF6FF] px-5 py-4">
            <p className="text-sm font-semibold text-[#1E3A5F]">
              {'👨‍🍳 Order confirmed & preparing! Your pickup code is:'}
            </p>
            <span className="shrink-0 font-heading text-4xl font-bold leading-none tracking-[0.15em] text-secondary">
              {order.pickupCode}
            </span>
          </div>
        )}

      {order.paymentStatus === 'COMPLETED' &&
        order.orderStatus === 'READY_FOR_PICKUP' && (
          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-[#F0FDF4] px-5 py-4">
            <p className="text-sm font-semibold text-[#14532D]">
              {'🎉 Your order is ready for pickup! Pickup Code:'}
            </p>
            <span className="shrink-0 font-heading text-4xl font-bold leading-none tracking-[0.15em] text-secondary">
              {order.pickupCode}
            </span>
          </div>
        )}

      {/* Footer conditional actions */}
      {(order.orderStatus === 'INITIALIZED' ||
        order.orderStatus === 'COMPLETED') && (
        <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-[#EAE5D9] pt-5">
          {order.orderStatus === 'INITIALIZED' && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-full border border-[#EAE5D9] px-5 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted"
            >
              Cancel Order
            </button>
          )}

          {order.orderStatus === 'COMPLETED' && (
            <>
              <button
                type="button"
                onClick={handleReorder}
                disabled={reordering}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#EAE5D9] px-5 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reordering ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={2.2} />
                ) : (
                  <ShoppingCart className="size-4" strokeWidth={2.2} />
                )}
                {reordering ? 'Adding to cart…' : 'Reorder'}
              </button>

              {!order.hasReviewed ? (
                <Link
                  href={`/orders/${order.id}/review`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground shadow-sm transition-all hover:brightness-105"
                >
                  <Star className="size-4" strokeWidth={2.2} />
                  Leave a Review
                </Link>
              ) : (
                <Link
                  href={`/orders/${order.id}/review?view=true`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
                >
                  <CheckCircle className="size-4" strokeWidth={2.2} />
                  View Review
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </article>
  )
}
