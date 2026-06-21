import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { MenuView } from '@/components/menu-view'

export default function CanteenMenuPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <MenuView />
      <Footer />
    </main>
  )
}
