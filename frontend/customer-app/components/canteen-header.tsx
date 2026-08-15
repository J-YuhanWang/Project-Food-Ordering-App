import Image from 'next/image'
import {Clock, Timer, MapPin } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import type { CanteenDetailDTO } from '@/lib/menu'


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
        <div className="absolute inset-0 bg-linear-to-t from-foreground/40 to-transparent" />
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
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Open / Closed pill */}
              {canteen.open ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground">
                  <Clock className="size-4" />
                  Open · Closes {canteen.todayClosingTime? formatTime(canteen.todayClosingTime):''}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-sm font-semibold text-muted-foreground">
                  <Clock className="size-4" />
                  {`Closed${canteen.todayOpeningTime ? ` · Opens ${formatTime(canteen.todayOpeningTime)}` : ''}`}
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
