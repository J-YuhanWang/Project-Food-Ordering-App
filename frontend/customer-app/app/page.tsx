import { Navbar } from '@/components/navbar'
import { HeroBanner } from '@/components/hero-banner'
import { CanteenBrowser } from '@/components/canteen-browser'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner />
      <CanteenBrowser />
      <Footer />
    </main>
  )
}
