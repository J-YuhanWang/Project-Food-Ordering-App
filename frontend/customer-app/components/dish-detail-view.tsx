'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Clock,
  Leaf,
} from 'lucide-react'
import type {DishDTO, ResponseReviewPageDTO, ReviewDTO} from '@/lib/menu'
import { ReviewsSection } from '@/components/reviews-section'
import { useAuth } from '@/lib/auth-context'
import apiClient from "@/lib/api/client";


export function DishDetailView({canteenId,dishId,}:{canteenId:number,dishId:number}) {
  const [canteenName,setCanteenName] = useState<string>('')
  const [dish, setDish] = useState<DishDTO | null >(null)
  const [reviews, setReviews] = useState<ReviewDTO[]>([])

  const [quantity, setQuantity] = useState(1)
  const [toastOpen, setToastOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { isLoggedIn, setCartCount,cartCount,user } = useAuth()
  const isStudent = user?.roles?.includes("ROLE_STUDENT") ?? true
  useEffect(() => {
    apiClient.get(`/api/v1/dishes/${dishId}`)
        .then((res)=>{
          setDish(res.data.data)
          setCanteenName(res.data.data.canteenName ??'')
        })

    apiClient.get(`/api/v1/reviews/dish/${dishId}`)
        .then((res)=>setReviews(res.data.data.content ?? []))
        .catch(()=>setReviews([]))
  }, [dishId]);

  useEffect(() => {
    if (!toastOpen) return
    const t = setTimeout(() => setToastOpen(false), 2600)
    return () => clearTimeout(t)
  }, [toastOpen])

  async function handleAddToCart() {
    if (!isLoggedIn) {
      setLoginModalOpen(true)
      return
    }
    if(!isStudent)return
    // POST /api/v1/cart/items/{dishId}?quantity={quantity} would fire here.
    await apiClient.post(`/api/v1/cart/items/${dishId}`,null,{params:{quantity}})
    setCartCount(cartCount+quantity)
    setToastOpen(true)
  }

  if (!dish) return <div className="py-20 text-center text-muted-foreground">Loading…</div>

  return (
    <div className="pb-20">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-7xl px-4 pb-2 pt-6 sm:px-6 lg:px-8"
      >
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
          </li>
          <ChevronRight className="size-4" aria-hidden />
          <li>
            <Link
              href={`/canteens/${canteenId}`}
              className="transition-colors hover:text-foreground"
            >
              {canteenName}
            </Link>
          </li>
          <ChevronRight className="size-4" aria-hidden />
          <li aria-current="page" className="font-semibold text-foreground">
            {dish.name}
          </li>
        </ol>
      </nav>

      {/* Back button */}
      <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
        <Link
          href={`/canteens/${canteenId}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <ChevronLeft className="size-4" strokeWidth={2.5} />
          Back to {canteenName}
        </Link>
      </div>

      {/* Main content: two columns on desktop */}
      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
          {/* Left: image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-[#EAE5D9] bg-card shadow-[0_18px_50px_rgb(230,225,210,0.6)]">
            <Image
              src={dish.imageUrl || '/placeholder.svg'}
              alt={dish.name}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            {/* Floating category chips, top-left */}
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                {dish.foodCategory}
              </span>
            </div>
          </div>

          {/* Right: details */}
          <div className="flex flex-col lg:py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {canteenName}{dish.canteenLocation ? ` • ${dish.canteenLocation}` : ''}
            </p>

            <h1 className="mt-3 text-balance font-heading text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl">
              {dish.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 font-bold text-foreground">
                <Star className="size-4 fill-secondary text-secondary" />
                {dish.averageRating != null ? dish.averageRating.toFixed(1) : '—'}
              </span>
              <span className="text-muted-foreground">
                ({dish.reviewCount} reviews)
              </span>
              <span className="text-[#EAE5D9]" aria-hidden>
                |
              </span>
              {/* prepTimeMinutes omitted — belongs to CanteenDTO, not DishDTO.
                Can be fetched via GET /api/v1/canteens/{canteenId} if needed later. */}
              {/*<span className="inline-flex items-center gap-1 font-semibold text-foreground">*/}
              {/*  <Clock className="size-4 text-secondary" />*/}
              {/*  {prepTimeMinutes} mins*/}
              {/*</span>*/}
            </div>

            {/* Ambient description card */}
            <div className="mt-6 rounded-3xl border border-[#EAE5D9] bg-muted/60 p-6">
              <p className="text-pretty leading-relaxed text-muted-foreground">
                {dish.description}
              </p>
            </div>

            {/* Price — bold, asymmetric */}
            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Price per serving
                </p>
                <p className="mt-1 font-heading text-6xl font-bold leading-none text-secondary">
                  €{dish.price.toFixed(2)}
                </p>
              </div>

              {/* Quantity selector */}
              <div className="text-right">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quantity
                </p>
                <div className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-card p-1">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex size-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="size-4" strokeWidth={2.5} />
                  </button>
                  <span className="w-10 text-center text-base font-bold text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex size-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
                  >
                    <Plus className="size-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>

            <hr className="my-6 border-[#EAE5D9]" />

            {/* Add to cart — full-width prominent primary */}
            {isStudent?(
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!dish.available}
                    className="flex w-full items-center justify-center gap-2.5 rounded-full bg-secondary px-6 py-5 text-lg font-bold text-secondary-foreground shadow-[0_12px_34px_rgb(248,146,84,0.4)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
                >
                  <ShoppingCart className="size-5" strokeWidth={2.2} />
                  {dish.available
                      ? `Add to Cart · €${(dish.price * quantity).toFixed(2)}`
                      : 'Currently unavailable'}
                </button>
            ):null}
            
            {/* Sustainability note */}
            <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-primary/10 px-4 py-3">
              <Leaf className="size-4 shrink-0 text-primary" strokeWidth={2.2} />
              <p className="text-sm text-primary">
                Ordered in sustainable, 100% compostable packaging.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection reviews={reviews} totalCount={dish.reviewCount} />

      {/* Success toast */}
      <div
        role="status"
        aria-live="polite"
        className={
          toastOpen
            ? 'fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 transition-all duration-300'
            : 'pointer-events-none fixed inset-x-0 bottom-6 z-50 flex translate-y-4 justify-center px-4 opacity-0 transition-all duration-300'
        }
      >
        <div className="flex items-center gap-2.5 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_12px_40px_rgb(141,162,73,0.45)]">
          <CheckCircle2 className="size-5" />
          Added {quantity} to cart!
          <ShoppingCart className="size-4" />
        </div>
      </div>

      {/* Login required modal */}
      {loginModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLoginModalOpen(false)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-[0_8px_30px_rgba(141,162,73,0.12)]">
            <button
              type="button"
              aria-label="Close dialog"
              onClick={() => setLoginModalOpen(false)}
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
            >
              <X className="size-4" />
            </button>

            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <ShoppingCart className="size-7" />
            </span>
            <h2
              id="login-modal-title"
              className="mt-5 font-heading text-3xl font-bold text-foreground"
            >
              Login Required
            </h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              Please log in to start adding items to your cart.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setLoginModalOpen(false)}
                className="flex-1 rounded-xl border border-primary px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
              >
                Cancel
              </button>
              <Link
                href="/login"
                className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
