import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { DishDetailView } from '@/components/dish-detail-view'
import { canteenDetail, getDishById, getReviewsByDish } from '@/lib/menu'

export default async function DishDetailPage({
  params,
}: {
  params: Promise<{ canteenId: string; dishId: string }>
}) {
  const { canteenId, dishId } = await params
  const dish = getDishById(Number(dishId))

  if (!dish) {
    notFound()
  }

  const reviews = getReviewsByDish(dish.id).data

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <DishDetailView
        dish={dish}
        reviews={reviews}
        canteenId={Number(canteenId)}
        canteenName={canteenDetail.name}
        prepTimeMinutes={canteenDetail.prepTimeMinutes}
      />
      <Footer />
    </main>
  )
}
