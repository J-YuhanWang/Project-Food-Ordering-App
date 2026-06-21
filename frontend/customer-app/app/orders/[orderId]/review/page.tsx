import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ReviewFormView } from '@/components/review-form-view'
import { getOrderById } from '@/lib/orders'

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ view?: string }>
}) {
  const { orderId } = await params
  const { view } = await searchParams
  const order = getOrderById(Number(orderId))

  if (!order) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <ReviewFormView order={order} viewMode={view === 'true'} />
      <Footer />
    </main>
  )
}
