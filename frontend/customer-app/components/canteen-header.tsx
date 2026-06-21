import Image from 'next/image'
import { Star, Clock, Timer, MapPin } from 'lucide-react'
import type { CanteenDetailDTO } from '@/lib/menu'

function formatTime(time: string) {
  // "21:00" -> "9:00PM"
  const [hStr, mStr] = time.split(':')
  const h = Number(hStr)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${mStr}${period}`
}

export function CanteenHeader({ canteen }: { canteen: CanteenDetailDTO }) {
  return (
    <section className="relative">
      {/* Banner image */}
      <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-80">
        <Image
          src={canteen.imageUrl || '/placeholder.svg'}
          alt={`${canteen.name} banner`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
      </div>

      {/* Overlay card */}
      <div className="relative z-10 mx-auto -mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#EAE5D9] bg-card p-6 shadow-[0_8px_30px_rgb(230,225,210,0.5)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                {canteen.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {(canteen.tags ?? [canteen.canteenType]).join(' · ')}
                </span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <Star className="size-4 fill-secondary text-secondary" />
                  {(canteen.averageRating ?? 0).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Open / Closed pill */}
              {canteen.isOpen ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground">
                  <Clock className="size-4" />
                  Open · Closes {formatTime(canteen.todayClosingTime)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-sm font-semibold text-muted-foreground">
                  <Clock className="size-4" />
                  Closed
                </span>
              )}

              {/* Prep time pill */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAE5D9] bg-background px-3.5 py-1.5 text-sm font-semibold text-foreground">
                <Timer className="size-4 text-secondary" />
                Ready in {canteen.prepTimeMinutes} mins
              </span>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
            {canteen.description}
          </p>

          {canteen.location && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-secondary" />
              {canteen.location}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
