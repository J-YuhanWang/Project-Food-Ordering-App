import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { OrderHistoryView } from '@/components/order-history-view'
import { AuthGuard } from '@/components/auth-guard'

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <AuthGuard>
        <OrderHistoryView />
      </AuthGuard>
      <Footer />
    </main>
  )
}
