import RelationshipFormPage from '@/components/pages/RelationshipFormPage'

export const metadata = { title: '관계 정보 수정' }

export default async function Page({ params }) {
  const { relationshipId } = await params
  return <RelationshipFormPage relationshipId={relationshipId} />
}
