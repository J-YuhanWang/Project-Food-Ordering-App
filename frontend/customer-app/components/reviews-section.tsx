import { Star, PenLine } from 'lucide-react'
import type { ReviewDTO } from '@/lib/menu'

function StarRow({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={
            i <= rating
              ? 'size-4 fill-secondary text-secondary'
              : 'size-4 fill-muted text-muted'
          }
        />
      ))}
    </div>
  )
}

// Deterministic date formatter — avoids Date.now() and locale-dependent
// formatting so the server and client render identical markup (no hydration mismatch).
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function formatDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return iso
  const [, year, month, day] = match
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`
}

// Initials from a name, e.g. "Aoife Byrne" -> "AB".
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''
  return (first + last).toUpperCase()
}

// Deterministic avatar color picked from a name so each user keeps a consistent color.
const AVATAR_COLORS = [
  'bg-[#8DA249] text-white',
  'bg-[#F89254] text-white',
  'bg-[#4B7BA8] text-white',
  'bg-[#C26B5A] text-white',
  'bg-[#6B8E7B] text-white',
  'bg-[#B5893A] text-white',
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// Soft alternating card tints to give the staggered grid a cozy, modern feel.
const CARD_TINTS = [
  'bg-card',
  'bg-[#F4F1E7]',
  'bg-[#F1F4EC]',
  'bg-[#FBF1E9]',
]

export function ReviewsSection({ reviews }: { reviews: ReviewDTO[] }) {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-4xl font-bold text-foreground">
            Community <span className="text-secondary">Reviews</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            Hear what fellow students and faculty are saying.
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-[#EAE5D9] bg-card py-16 text-center">
          <p className="font-heading text-xl font-semibold text-foreground">
            No reviews yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to review!
          </p>
        </div>
      ) : (
        <ul className="mt-8 columns-1 gap-6 md:columns-2 [&>li]:mb-6 [&>li]:break-inside-avoid">
          {reviews.map((review, index) => (
            <li key={review.id}>
              <article
                className={`rounded-3xl border border-[#EAE5D9] p-6 shadow-[0_8px_30px_rgb(230,225,210,0.4)] ${
                  CARD_TINTS[index % CARD_TINTS.length]
                } ${index % 2 === 1 ? 'md:mt-8' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-11 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold ${getAvatarColor(
                        review.userName??'Anonymous',
                      )}`}
                    >
                      {getInitials(review.userName ?? 'Anonymous')}
                    </span>
                    <div>
                      <p className="font-heading font-bold text-foreground">
                        {review.userName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Verified Diner ·{' '}
                        {review.createdAt ? formatDate(review.createdAt):''}
                      </p>
                    </div>
                  </div>
                  <StarRow rating={review.rating} />
                </div>
                <p className="mt-4 text-pretty italic leading-relaxed text-muted-foreground">
                  {'"'}
                  {review.comment}
                  {'"'}
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}

      {reviews.length > 0 && (
        <div className="mt-10 text-center">
          <button
            type="button"
            className="text-sm font-semibold text-secondary transition-colors hover:text-secondary/80"
          >
            View All {reviews.length} Reviews
          </button>
        </div>
      )}
    </section>
  )
}
