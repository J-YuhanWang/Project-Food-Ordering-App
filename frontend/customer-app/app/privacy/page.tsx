import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-background">
            <Navbar />
            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                <h1 className="font-heading text-4xl font-bold text-foreground">
                    Privacy Policy
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Last updated: August 2026
                </p>

                <div className="mt-8 space-y-6 text-pretty leading-relaxed text-muted-foreground">
                    <p>
                        CampusEats is a portfolio/demo project, not a commercial product.
                        This policy explains what happens to your data if you choose to
                        create an account and explore the app.
                    </p>

                    <section>
                        <h2 className="font-heading text-xl font-bold text-foreground">
                            What we collect
                        </h2>
                        <p className="mt-2">
                            If you register, we store your name, email, phone number, and
                            address, along with any orders and reviews you create while
                            using the app. Most of the canteen and menu data you see is
                            seeded demo content, not real UCD operations data.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-heading text-xl font-bold text-foreground">
                            Payments
                        </h2>
                        <p className="mt-2">
                            Checkout runs entirely in Stripe's test mode. No real payment
                            information is ever processed, and no real charge can occur,
                            regardless of what card details are entered.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-heading text-xl font-bold text-foreground">
                            Third-party services
                        </h2>
                        <p className="mt-2">
                            CampusEats uses AWS S3 for image storage, Stripe (test mode) for
                            checkout, Gmail SMTP for verification codes and order confirmation
                            emails, and Unsplash/Pexels for a portion of dish photography.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-heading text-xl font-bold text-foreground">
                            Questions
                        </h2>
                        <p className="mt-2">
                            Reach out via the{' '}
                            <a href="/contact" className="text-primary underline">
                                contact page
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    )
}