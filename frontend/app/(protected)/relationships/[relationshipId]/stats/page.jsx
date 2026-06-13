import StatsPage from '@/components/pages/StatsPage'

export const metadata = { title: '관계 통계' }

export default async function Page({ params }) {
  const { relationshipId } = await params
  return <StatsPage relationshipId={relationshipId} />
}
