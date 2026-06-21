import type { Metadata } from 'next'
import { LoginView } from '@/components/login-view'

export const metadata: Metadata = {
  title: 'Log In | UCD Canteen Hub',
  description: 'Log in to your UCD Canteen Hub account to fuel your campus day.',
}

export default function LoginPage() {
  return <LoginView />
}
