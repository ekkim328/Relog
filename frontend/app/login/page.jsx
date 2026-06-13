import { redirect } from 'next/navigation'
import LoginForm from '@/components/pages/LoginForm'
import { getCurrentUser } from '@/lib/server-auth'

export const metadata = { title: '로그인' }

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect('/relationship-dashboard')
  return <LoginForm />
}
