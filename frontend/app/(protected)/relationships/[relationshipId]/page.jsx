import RelationshipDetailPage from '@/components/pages/RelationshipDetailPage'

export default async function Page({ params }) {
  const { relationshipId } = await params
  return <RelationshipDetailPage relationshipId={relationshipId} />
}
