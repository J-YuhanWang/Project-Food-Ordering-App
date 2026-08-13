import Image from 'next/image'
import Link from 'next/link'
import {Clock, ArrowRight, MapPin, Timer} from 'lucide-react'
import type { CanteenDTO } from '@/lib/canteens'
import {formatTime} from "@/lib/utils";

export function CanteenCard({ canteen }: { canteen: CanteenDTO }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-[#EAE5D9] bg-card shadow-[0_8px_30px_rgb(230,225,210,0.4)] transition-transform duration-300 hover:-translate-y-1">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={canteen.imageUrl || '/placeholder.svg'}
          alt={canteen.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* type chip */}
        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground backdrop-blur">
          {canteen.canteenType}
        </span>
        {/* open / closed status */}
        <span
          className={
            canteen.open
              ? 'absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground'
              : 'absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-foreground/70 px-3 py-1 text-[11px] font-semibold text-card'
          }
        >
          <Clock className="size-3" />
          {canteen.open
              ? `Open · Closes ${canteen.todayClosingTime ? formatTime(canteen.todayClosingTime) : ''}`
              : 'Closed'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-xl font-bold leading-tight text-foreground">
            {canteen.name}
          </h3>
          {/* replaces the old fake star rating */}
          {canteen.prepTimeMinutes != null && (
              <span className="flex shrink-0 items-center gap-1 rounded-full border border-[#EAE5D9] bg-background px-2.5 py-1 text-sm font-semibold text-foreground">
              <Timer className="size-4 text-secondary" />
                {canteen.prepTimeMinutes}m
            </span>
          )}
        </div>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          {canteen.description}
        </p>
        {canteen.location && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-secondary" />
              {canteen.location}
            </p>
        )}

        {canteen.open ? (
          <Link
            href={`/canteens/${canteen.id}`}
            className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:brightness-105"
          >
            View menu
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="mt-5 flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm font-semibold text-muted-foreground"
          >
            Currently closed
          </button>
        )}
      </div>
    </article>
  )
}
