import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'UCD Canteen Hub — Order across campus',
  description:
    'Discover and order from every canteen on the UCD campus. Fresh food, fast delivery, cozy vibes.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
