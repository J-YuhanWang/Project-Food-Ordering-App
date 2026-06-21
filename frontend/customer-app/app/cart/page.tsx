import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CartView } from '@/components/cart-view'

export default function CartPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <CartView />
      <Footer />
    </main>
  )
}
