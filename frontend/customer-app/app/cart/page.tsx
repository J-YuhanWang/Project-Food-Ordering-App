import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CartView } from '@/components/cart-view'
import { AuthGuard } from '@/components/auth-guard'

export default function CartPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <AuthGuard>
        <CartView />
      </AuthGuard>
      <Footer />
    </main>
  )
}
