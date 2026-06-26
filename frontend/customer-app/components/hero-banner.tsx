import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export function HeroBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-[#EAE5D9] bg-primary text-primary-foreground shadow-[0_8px_30px_rgb(230,225,210,0.4)]">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className="px-6 py-10 sm:px-10 sm:py-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="size-3.5" />
              Campus Dining
            </span>
            <h1 className="mt-5 text-balance font-heading text-4xl font-bold leading-tight sm:text-5xl">
              Every canteen on campus, one cozy tap away.
            </h1>
            <p className="mt-4 max-w-md text-pretty leading-relaxed text-primary-foreground/85">
              Skip the queue. Browse menus, order ahead and pick up fresh food
              from your favourite spots on campus.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/cart" className="rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-sm transition-transform hover:scale-[1.02]">
                Order now
              </Link>

              <a href="#canteens"
                  className="rounded-xl bg-primary-foreground/10 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/20">
                Browse canteens
              </a>
            </div>
          </div>

          <div className="relative h-56 md:h-full md:min-h-[340px]">
            <Image
              src="/hero-food.png"
              alt="A spread of delicious campus food including pizza, burgers and bowls"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
