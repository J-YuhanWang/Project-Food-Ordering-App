import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ReviewFormView } from '@/components/review-form-view'

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ view?: string }>
}) {
  const { orderId } = await params
  const { view } = await searchParams

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <ReviewFormView
          orderId={Number(orderId)}
          viewMode={view === 'true'} />
      <Footer />
    </main>
  )
}
