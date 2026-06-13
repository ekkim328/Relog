import LogFormPage from '@/components/pages/LogFormPage'

export const metadata = { title: '기록 수정' }

export default async function Page({ params }) {
  const { logId } = await params
  return <LogFormPage logId={logId} />
}
