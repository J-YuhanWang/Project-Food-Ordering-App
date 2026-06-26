'use client'

import Link from 'next/link'
import { Soup } from 'lucide-react'

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

const quickLinks = [
  { label: 'Menu', href: '/' },
  { label: 'Orders', href: '/orders' },
  { label: 'Profile', href: '/profile' },
]

const supportLinks = [
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

export function Footer() {
  return (
    <footer className="bg-[#1F2A20] text-[#D7DED0]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Soup className="size-5" strokeWidth={2} />
              </span>
              <span className="font-heading text-xl font-bold tracking-tight text-[#F5F1E6]">
                CampusEats
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#A8B29C]">
              Fresh food across every corner of campus. Discover, order, and
              skip the queue — all from one cozy hub.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-[#D7DED0] transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <TwitterIcon className="size-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-[#D7DED0] transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <InstagramIcon className="size-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F5F1E6]">
              Quick Links
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#A8B29C] transition-colors hover:text-[#F5F1E6]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F5F1E6]">
              Support
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#A8B29C] transition-colors hover:text-[#F5F1E6]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-[#A8B29C]">
            © {new Date().getFullYear()} CampusEats · Built by Blair Wang
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Spring Boot · Next.js · MySQL · Redis · Stripe · AWS S3
          </p>
        </div>
      </div>
    </footer>
  )
}
