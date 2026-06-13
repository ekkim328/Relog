import TimelinePage from '@/components/pages/TimelinePage'

export const metadata = { title: '관계 타임라인' }

export default async function Page({ params }) {
  const { relationshipId } = await params
  return <TimelinePage relationshipId={relationshipId} />
}
