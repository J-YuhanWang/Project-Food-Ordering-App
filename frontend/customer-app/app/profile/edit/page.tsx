import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { EditProfileView } from '@/components/edit-profile-view'
import { AuthGuard } from '@/components/auth-guard'

export default function EditProfilePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <AuthGuard>
        <EditProfileView />
      </AuthGuard>
      <Footer />
    </main>
  )
}
