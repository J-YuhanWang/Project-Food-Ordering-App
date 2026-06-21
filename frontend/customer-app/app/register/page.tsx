import type { Metadata } from 'next'
import { RegisterView } from '@/components/register-view'

export const metadata: Metadata = {
  title: 'Sign Up | UCD Canteen Hub',
  description: 'Create your UCD dining account and join the Hub.',
}

export default function RegisterPage() {
  return <RegisterView />
}
