import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { DishDetailView } from '@/components/dish-detail-view'

export default async function DishDetailPage({
  params,
}: {
  params: Promise<{ canteenId: string; dishId: string }>
}) {
  const { canteenId, dishId } = await params

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <DishDetailView
        canteenId={Number(canteenId)}
        dishId={Number(dishId)}
      />
      <Footer />
    </main>
  )
}
