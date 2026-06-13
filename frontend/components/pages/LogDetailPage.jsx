'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { errorMessage } from '@/lib/api/client'
import { deleteLog, getLog } from '@/lib/api/relationshipLogs'
import { ErrorNotice, Loading } from '@/components/PageState'
import { emotionTone, eventTypes } from '@/lib/constants'

export default function LogDetailPage({ logId }) {
  const [log, setLog] = useState(null)
  const [error, setError] = useState('')
  const router = useRouter()
  useEffect(() => { getLog(logId).then(setLog).catch((err) => setError(errorMessage(err))) }, [logId])
  if (!log && !error) return <Loading />
  const remove = async () => {
    if (!window.confirm('이 기록을 삭제할까요?')) return
    await deleteLog(logId)
    router.push(`/relationships/${log.relationship_id}`)
    router.refresh()
  }

  return <div className="page narrow"><header className="page-header"><div><p className="eyebrow">{log?.log_date}</p><h2>{log?.title}</h2><p>{log && eventTypes[log.event_type]}</p></div><div className="button-row"><Link className="secondary-button" href={`/logs/${logId}/edit`}>수정</Link><button className="danger-button" onClick={remove}>삭제</button></div></header><ErrorNotice message={error} />{log && <><section className="panel log-detail"><div className="log-score"><span>감정 점수</span><strong className={emotionTone(log.emotion_score)}>{log.emotion_score > 0 ? '+' : ''}{log.emotion_score}</strong><small>중요도 {log.importance_score}/5</small></div><div><p className="log-content">{log.content}</p><div className="tag-picker">{log.emotion_tags.map((tag) => <span className={`tag selected ${tag.category}`} key={tag.emotion_tag_id}>{tag.name}</span>)}</div></div></section><section className="detail-grid"><article className="panel"><h3>내 행동</h3><p>{log.my_action || '-'}</p></article><article className="panel"><h3>상대방 행동</h3><p>{log.other_action || '-'}</p></article><article className="panel"><h3>사건 결과</h3><p>{log.result || '-'}</p></article><article className="panel"><h3>메모</h3><p>{log.memo || '-'}</p></article></section><Link className="text-link" href={`/relationships/${log.relationship_id}`}>관계 상세로 돌아가기</Link></>}</div>
}
