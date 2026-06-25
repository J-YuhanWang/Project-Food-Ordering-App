'use client'

import {useEffect, useState} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    AlertTriangle, Loader2,
    Minus,
    Plus,
    Shield,
    ShoppingBag,
    Trash2,
} from 'lucide-react'
import {type CartDTO } from '@/lib/cart'
import apiClient from "@/lib/api/client";

export function CartView() {
  const [cart, setCart] = useState<CartDTO | null>(null)
  const [checkingOut,setCheckingOut] = useState(false)

    useEffect(() => {
        apiClient.get('api/v1/cart')
            .then((res)=>setCart(res.data.data))
    }, []);

  const isEmpty = (cart?.items?.length ?? 0) === 0;

  // PATCH /api/v1/cart/items/{cartItemId}/increment
  function incrementItem(cartItemId: number) {
    apiClient.patch(`api/v1/cart/items/${cartItemId}/increment`)
        .then((res)=>setCart(res.data.data))
  }

  // PATCH /api/v1/cart/items/{cartItemId}/decrement
  function decrementItem(cartItemId: number) {
    apiClient.patch(`api/v1/cart/items/${cartItemId}/decrement`)
        .then((res)=>setCart(res.data.data))
  }

  // DELETE /api/v1/cart/items/{cartItemId}
  function removeItem(cartItemId: number) {
    apiClient.delete(`api/v1/cart/items/${cartItemId}`)
        .then((res)=>setCart(res.data.data))
  }

  // DELETE /api/v1/cart
  function clearCart() {
      apiClient.delete('api/v1/cart')
          .then(()=>setCart((prev)=>prev? {...prev, items:[],totalPrice:0,totalQuantity:0}:prev))
    // setCart((prev) => ({ ...prev, items: [], totalPrice: 0, totalQuantity: 0 }))
  }

  async function handleCheckOut(){
      if(checkingOut)return;
      setCheckingOut(true)
      try{
          // 1. create the orders
          const orderRes = await apiClient.post('api/v1/orders')
          const orderId = orderRes.data.data.id
          console.log(orderId)

          // 2. create Stripe checkout session, get the Stripe url
          const paymentRes = await apiClient.post(`api/v1/payments/checkout/${orderId}`)
          const stripeUrl = paymentRes.data.data
          console.log(stripeUrl)

          // 3. jump to Stripe payment page
          window.location.href = stripeUrl

      }catch(err:any){
          const message = err?.response?.data?.message || 'Checkout failed. Please try again.'
          alert(message)
          setCheckingOut(false)
      }

  }


  if (!cart) return <div className="py-20 text-center">Loading...</div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold text-foreground sm:text-5xl">
          Review Your Cart
        </h1>
        {!isEmpty && (
          <p className="mt-2 text-muted-foreground">
            {cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'}{' '}
            from{' '}
            <span className="font-semibold text-foreground">
              {cart.canteenName}
            </span>
          </p>
        )}
      </div>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left: items list */}
          <div>
            {/* Amber warning banner */}
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#E8C98A] bg-[#FBF1DC] px-4 py-3.5">
              <AlertTriangle
                className="mt-0.5 size-5 shrink-0 text-[#B8862F]"
                strokeWidth={2}
              />
              <p className="text-sm leading-relaxed text-[#7A5C1E]">
                Your cart contains items from{' '}
                <span className="font-semibold">{cart.canteenName}</span>.
                Adding items from another canteen will clear this cart.
              </p>
            </div>

            {/* Item cards */}
            <ul className="flex flex-col gap-4">
              {cart.items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-5 rounded-3xl border border-[#EAE5D9] bg-card px-5 py-6 shadow-[0_8px_30px_rgb(230,225,210,0.4)] sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-7"
                >
                  {/* Cluster 1: Image + text description */}
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted sm:size-24">
                      <Image
                        src={item.dishImageUrl || '/placeholder.svg'}
                        alt={item.dishName}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-heading text-lg font-bold text-foreground">
                        {item.dishName}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        €{item.pricePerUnit.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  {/* Cluster 2: Quantity controller */}
                  <div className="inline-flex shrink-0 items-center gap-1 self-start rounded-full border border-primary/40 bg-card p-1 sm:self-auto">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.dishName}`}
                      onClick={() => decrementItem(item.id)}
                      className="flex size-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-secondary hover:text-secondary-foreground"
                    >
                      <Minus className="size-4" strokeWidth={2.5} />
                    </button>
                    <span className="w-9 text-center text-sm font-bold text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.dishName}`}
                      onClick={() => incrementItem(item.id)}
                      className="flex size-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-secondary hover:text-secondary-foreground"
                    >
                      <Plus className="size-4" strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Cluster 3: Trash + subtotal stacked on the right */}
                  <div className="flex shrink-0 items-center justify-between gap-4 sm:w-28 sm:flex-col sm:items-end sm:justify-center sm:gap-2.5">
                    <button
                      type="button"
                      aria-label={`Remove ${item.dishName} from cart`}
                      onClick={() => removeItem(item.id)}
                      className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-[18px]" strokeWidth={2} />
                    </button>
                    <p className="font-heading text-2xl font-bold text-foreground">
                      €{item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Clear cart */}
            <div className="mt-5">
              <button
                type="button"
                onClick={clearCart}
                className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-destructive hover:underline"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Right: checkout summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-[#EAE5D9] bg-card p-6 shadow-[0_12px_40px_rgb(230,225,210,0.5)]">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Order Summary
              </h2>

              <dl className="mt-5 flex flex-col gap-3.5">
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-semibold text-foreground">
                    €{cart.totalPrice.toFixed(2)}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-muted-foreground">Free Campus Pickup</dt>
                  <dd className="font-semibold text-primary">€0.00</dd>
                </div>
              </dl>

              <div className="my-5 h-px bg-[#EAE5D9]" />

              <div className="flex items-end justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Total Amount
                </span>
                <span className="font-heading text-4xl font-bold text-foreground">
                  €{cart.totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckOut}
                disabled={checkingOut}
                className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-secondary px-6 py-4 text-base font-bold text-secondary-foreground shadow-sm transition-all hover:brightness-105"
              >
                  {checkingOut ? (
                      <>
                          <Loader2 className="size-5 animate-spin" />
                          Redirecting to Stripe…
                      </>
                  ) : (
                      <>
                          <Shield className="size-5" strokeWidth={2.2} />
                          Proceed to Stripe Checkout
                      </>
                  )}
              </button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Secure payment powered by Stripe
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#EAE5D9] bg-card px-6 py-20 text-center">
      <span className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <ShoppingBag className="size-10" strokeWidth={1.8} />
      </span>
      <h2 className="mt-6 font-heading text-2xl font-bold text-foreground">
        Your cart is empty
      </h2>
      <p className="mt-2 max-w-sm text-pretty leading-relaxed text-muted-foreground">
        Let&apos;s grab some campus food! Browse the canteens around UCD and add
        your favourites.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex items-center justify-center rounded-full bg-secondary px-7 py-3.5 text-base font-bold text-secondary-foreground shadow-sm transition-all hover:brightness-105"
      >
        Browse Canteens
      </Link>
    </div>
  )
}
