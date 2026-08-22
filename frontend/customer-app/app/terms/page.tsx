import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background">
            <Navbar />
            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                <h1 className="font-heading text-4xl font-bold text-foreground">
                    Terms of Use
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Last updated: August 2026
                </p>

                <div className="mt-8 space-y-6 text-pretty leading-relaxed text-muted-foreground">
                    <p>
                        CampusEats is a demonstration project built to showcase software
                        engineering work. It is not affiliated with, endorsed by, or
                        operated on behalf of University College Dublin or any of the
                        food vendors referenced within it.
                    </p>
                    <p>
                        The app is provided "as is," without warranty of any kind.
                        Menu items, prices, and canteen details are for demonstration
                        purposes and may not reflect current real-world offerings.
                    </p>
                    <p>
                        Do not use this app expecting to receive real food or place a
                        real order — no orders placed here are fulfilled.
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    )
}