'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api/client'

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const orderId = searchParams.get('orderId')

    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orderId) {
            router.replace('/')
            return
        }
        apiClient.get(`/api/v1/orders/${orderId}`)
            .then((res) => setOrder(res.data.data))
            .finally(() => setLoading(false))
    }, [orderId])

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
        </div>
    )

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-3xl bg-card p-10 text-center shadow-[0_8px_30px_rgb(230,225,210,0.4)]">
                <CheckCircle2 className="mx-auto size-16 text-primary" strokeWidth={1.5} />
                <h1 className="mt-6 font-heading text-3xl font-bold text-foreground">
                    Payment Successful!
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Your order from{' '}
                    <span className="font-semibold text-foreground">
            {order?.canteenName}
          </span>{' '}
                    has been confirmed.
                </p>

                {order?.pickupCode && (
                    <div className="mt-6 rounded-2xl bg-primary/10 px-6 py-4">
                        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                            Pickup Code
                        </p>
                        <p className="mt-1 font-heading text-4xl font-bold tracking-widest text-primary">
                            {order.pickupCode}
                        </p>
                    </div>
                )}

                <div className="mt-8 flex flex-col gap-3">
                    <Link
                        href="/orders"
                        className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                        View My Orders
                    </Link>
                    <Link
                        href="/"
                        className="rounded-xl border border-[#EAE5D9] px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    )
}