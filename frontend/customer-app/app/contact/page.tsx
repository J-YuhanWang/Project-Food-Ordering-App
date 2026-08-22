import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-background">
            <Navbar />
            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                <h1 className="font-heading text-4xl font-bold text-foreground">
                    Get in Touch
                </h1>
                <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                    CampusEats is a portfolio project built by Yuhan Wang, not a live
                    commercial service — there's no support team behind it, but I'm
                    always happy to talk about how it's built :)
                </p>

                <div className="mt-8 space-y-3 text-muted-foreground">
                    <p>
                        Email:{' '}
                        <a href="mailto:yuhan.wang.dev@outlook.com" className="text-primary underline">
                            yuhan.wang.dev@outlook.com
                        </a>
                    </p>
                    <p>
                        GitHub:{' '}
                        <a href="https://github.com/J-YuhanWang/Project-UCD-Canteen-Hub" className="text-primary underline">
                            https://github.com/J-YuhanWang/Project-UCD-Canteen-Hub
                        </a>
                    </p>
                    <p>
                        LinkedIn:{' '}
                        <a href="https://www.linkedin.com/in/yuhan-wang-324186382" className="text-primary underline">
                            https://www.linkedin.com/in/yuhan-wang-324186382
                        </a>
                    </p>
                    <p>
                        Portfolio:{' '}
                        <a href="https://yuhanwang.dev/" className="text-primary underline">
                            https://yuhanwang.dev/
                        </a>
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    )
}