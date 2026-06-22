import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { MenuView } from '@/components/menu-view'

export default async function CanteenMenuPage({params}:{params:Promise<{canteenId:string}>}) {

  const {canteenId} = await params

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <MenuView canteenId={Number(canteenId)}/>
      <Footer />
    </main>
  )
}
