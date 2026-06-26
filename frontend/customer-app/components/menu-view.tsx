'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, ShoppingBag, X, CheckCircle2 } from 'lucide-react'
import { CanteenHeader } from '@/components/canteen-header'
import { DishCard } from '@/components/dish-card'
import { type DishDTO, type CanteenDetailDTO } from "@/lib/menu";
import apiClient from "@/lib/api/client";
import {useAuth} from "@/lib/auth-context";

// Toggle to preview the logged-out interaction (login modal).
export function MenuView({canteenId}:{canteenId:number}) {
  const {isLoggedIn,setCartCount,cartCount} = useAuth()
  const [canteen, setCanteen] = useState<CanteenDetailDTO|null>(null)
  const [dishes, setDishes] = useState<DishDTO[]>([])

  useEffect(()=>{
    apiClient.get(`/api/v1/canteens/${canteenId}`)
        .then((res)=>{
          console.log(res.data.data)
          setCanteen(res.data.data)
        })

    apiClient.get(`/api/v1/canteens/${canteenId}/dishes`)
        .then((res)=>{
          console.log(res.data.data)
          setDishes(res.data.data)
        })
  },[canteenId])

  // Only ever surface available dishes — unavailable ones are filtered out entirely.
  const availableDishes = useMemo(
    () => dishes.filter((d) => d.available),
    [dishes],
  )

  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [toastOpen, setToastOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const filteredDishes = useMemo(() => {
    if (activeCategory === 'All') return availableDishes
    return availableDishes.filter((d) => d.foodCategory === activeCategory)
  }, [availableDishes, activeCategory])

  const categories = useMemo(
      () => ['All', ...Array.from(new Set(dishes.map((d) => d.foodCategory).filter(Boolean)))],
      [dishes],
  )

  // Auto-dismiss the success toast.
  useEffect(() => {
    if (!toastOpen) return
    const t = setTimeout(() => setToastOpen(false), 2600)
    return () => clearTimeout(t)
  }, [toastOpen])

  async function handleAddToCart(dish: DishDTO) {
    if (!isLoggedIn) {
      setLoginModalOpen(true)
      return
    }
    // POST /api/v1/cart/items/{dishId}?quantity=1 would fire here.
    await apiClient.post(`/api/v1/cart/items/${dish.id}`,null,{params : {quantity:1}})
    setCartCount(cartCount+1)
    setToastOpen(true)
  }

  if (!canteen) return <div className="py-20 text-center text-muted-foreground">Loading...</div>

  return (
    <div className="pb-20">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-7xl px-4 pb-2 pt-6 sm:px-6 lg:px-8"
      >
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
          </li>
          <ChevronRight className="size-4" aria-hidden />
          <li aria-current="page" className="font-semibold text-foreground">
            {canteen.name}
          </li>
        </ol>
      </nav>

      {/* Hero header */}
      <CanteenHeader canteen={canteen} />

      {/* Body: filter + grid */}
      <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
          {/* Category filter */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-3 hidden font-heading text-lg font-bold text-foreground lg:block">
              Categories
            </h2>
            {/* Mobile: horizontal scroll · Desktop: vertical list */}
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0">
              {categories.map((cat) => {
                const active = activeCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={
                      active
                        ? 'shrink-0 rounded-xl bg-primary px-4 py-2.5 text-left text-sm font-semibold text-primary-foreground lg:w-full'
                        : 'shrink-0 rounded-xl border border-[#EAE5D9] bg-card px-4 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:w-full lg:border-transparent lg:bg-transparent lg:hover:bg-card'
                    }
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Dish grid */}
          <div className="mt-6 lg:mt-0">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                {activeCategory === 'All' ? 'Full Menu' : activeCategory}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredDishes.length}{' '}
                {filteredDishes.length === 1 ? 'dish' : 'dishes'}
              </span>
            </div>

            {filteredDishes.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredDishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    canteenId={canteen.id}
                    onAdd={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#EAE5D9] bg-card py-16 text-center">
                <p className="font-heading text-xl font-semibold text-foreground">
                  Nothing here yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No dishes in this category right now.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
          Added to cart!
          <ShoppingBag className="size-4" />
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
          <div className="relative w-full max-w-sm rounded-3xl border border-[#EAE5D9] bg-card p-7 text-center shadow-[0_20px_60px_rgb(30,30,20,0.2)]">
            <button
              type="button"
              aria-label="Close dialog"
              onClick={() => setLoginModalOpen(false)}
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
            >
              <X className="size-4" />
            </button>

            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
              <ShoppingBag className="size-7" />
            </span>
            <h2
              id="login-modal-title"
              className="mt-4 font-heading text-2xl font-bold text-foreground"
            >
              Login required
            </h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              Please login to add items to your cart.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setLoginModalOpen(false)}
                className="flex-1 rounded-xl border border-[#EAE5D9] bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <Link
                href="/login"
                className="flex-1 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:brightness-105"
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
