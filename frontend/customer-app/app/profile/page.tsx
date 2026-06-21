import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProfileView } from '@/components/profile-view'
import { AuthGuard } from '@/components/auth-guard'

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <AuthGuard>
        <ProfileView />
      </AuthGuard>
      <Footer />
    </main>
  )
}
