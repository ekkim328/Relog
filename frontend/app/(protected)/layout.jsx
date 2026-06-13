import AppShell from '@/components/AppShell'
import { requireUser } from '@/lib/server-auth'

export default async function ProtectedLayout({ children }) {
  const user = await requireUser()
  return <AppShell user={user}>{children}</AppShell>
}
