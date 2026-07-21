import type { Metadata } from 'next'
import { LoginView } from '@/components/ui/login-view'

export const metadata: Metadata = {
  title: 'Sign In | CampusEats Console',
  description: 'Staff sign-in for the CampusEats admin console.',
}

export default function LoginPage() {
  return <LoginView />
}
