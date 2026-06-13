import LogDetailPage from '@/components/pages/LogDetailPage'

export default async function Page({ params }) {
  const { logId } = await params
  return <LogDetailPage logId={logId} />
}
