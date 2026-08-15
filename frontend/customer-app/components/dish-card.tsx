import Image from 'next/image'
import Link from 'next/link'
import {Star, Plus} from 'lucide-react'
import type {DishDTO} from '@/lib/menu'
import {unsplashAttribution} from '@/lib/unsplash-attribution'

export function DishCard({
                             dish,
                             canteenId,
                             onAdd,
                         }: {
    dish: DishDTO
    canteenId: number
    onAdd?: (dish: DishDTO) => void
}) {
    return (
        <article
            className="group flex flex-col overflow-hidden rounded-2xl border border-[#EAE5D9] bg-card shadow-[0_8px_30px_rgb(230,225,210,0.4)] transition-transform duration-300 hover:-translate-y-1">
            {/* Edge-to-edge image fills the top half */}
            <Link
                href={`/canteens/${canteenId}/dishes/${dish.id}`}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl"
            >
                <Image
                    src={dish.imageUrl || '/placeholder.svg'}
                    alt={dish.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Star rating badge, top-right */}
                <span
                    className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-sm font-bold text-foreground shadow-md shadow-black/10 backdrop-blur">
                    <Star className="size-3.5 fill-secondary text-secondary"/>
                            {dish.averageRating.toFixed(1)}
                </span>
                {dish.imageUrl?.includes('unsplash.com') && unsplashAttribution[dish.id] && (
                    <span className="absolute bottom-2 left-2 rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
                    Photo by{' '}

                        <a href={unsplashAttribution[dish.id].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white"
                      >
                        {unsplashAttribution[dish.id].name}
                      </a>
                    </span>
                    )}
            </Link>

            <div className="flex flex-1 flex-col p-4">
                {/* Name + price on the same line */}
                <div className="flex items-start justify-between gap-3">
                    <Link
                        href={`/canteens/${canteenId}/dishes/${dish.id}`}
                        className="transition-colors hover:text-primary"
                    >
                        <h3 className="font-heading text-lg font-bold leading-tight text-foreground">
                            {dish.name}
                        </h3>
                    </Link>
                    <span className="shrink-0 font-heading text-lg font-bold text-foreground">
            €{dish.price.toFixed(2)}
          </span>
                </div>

                <p className="mt-1.5 mb-3 line-clamp-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {dish.description}
                </p>


                {onAdd && (
                    <button
                        type="button"
                        onClick={() => onAdd(dish)}
                        className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:brightness-105"
                    >
                        <Plus className="size-4" strokeWidth={2.5}/>
                        Add to Cart
                    </button>
                )}

            </div>
        </article>
    )
}
