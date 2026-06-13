import LogFormPage from '@/components/pages/LogFormPage'

export const metadata = { title: '새 기록 작성' }

export default async function Page({ params }) {
  const { relationshipId } = await params
  return <LogFormPage relationshipId={relationshipId} />
}
