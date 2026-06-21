import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { OrderHistoryView } from '@/components/order-history-view'

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <OrderHistoryView />
      <Footer />
    </main>
  )
}
