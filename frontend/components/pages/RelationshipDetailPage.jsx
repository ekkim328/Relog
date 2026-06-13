'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { requestAiAnalysis, getAiReports } from '@/lib/api/aiAnalysis'
import { errorMessage } from '@/lib/api/client'
import { getRelationshipLogs } from '@/lib/api/relationshipLogs'
import { getRelationshipStats } from '@/lib/api/relationshipStats'
import { deleteRelationship, getRelationship } from '@/lib/api/relationships'
import { Empty, ErrorNotice, Loading } from '@/components/PageState'
import StatCard from '@/components/StatCard'
import { eventTypes, emotionTone, relationTypes, relationshipStatuses } from '@/lib/constants'

export default function RelationshipDetailPage({ relationshipId }) {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState(null)

  useEffect(() => {
    Promise.all([
      getRelationship(relationshipId),
      getRelationshipLogs(relationshipId, { size: 5 }),
      getRelationshipStats(relationshipId),
      getAiReports(relationshipId),
    ]).then(([relationship, logs, stats, reports]) => {
      setData({ relationship, logs, stats, reports })
      if (reports[0]) setAnalysis({ eligible: true, report: reports[0] })
    }).catch((err) => setError(errorMessage(err)))
  }, [relationshipId])

  if (!data && !error) return <Loading />
  const remove = async () => {
    if (!window.confirm('이 관계와 모든 기록을 삭제할까요?')) return
    await deleteRelationship(relationshipId)
    router.push('/relationships')
    router.refresh()
  }
  const analyze = async () => {
    setError('')
    try { setAnalysis(await requestAiAnalysis(relationshipId)) }
    catch (err) { setError(errorMessage(err)) }
  }
  const relationship = data?.relationship

  return <div className="page">
    <header className="page-header detail-header"><div className="identity"><span className="avatar large">{relationship?.name.slice(0, 1)}</span><div><p className="eyebrow">{relationship && relationTypes[relationship.relation_type]}</p><h2>{relationship?.name}</h2><p>{relationship && relationshipStatuses[relationship.current_status]} · 관계 시작 {relationship?.start_date || '미입력'}</p></div></div><div className="button-row"><Link className="secondary-button" href={`/relationships/${relationshipId}/edit`}>수정</Link><button className="danger-button" onClick={remove}>삭제</button></div></header>
    <ErrorNotice message={error} />
    {data && <>
      <section className="hero-panel"><div><span>현재 관계 온도</span><strong>{relationship.temperature_score}<small>°</small></strong></div><div className="hero-copy"><p>{relationship.description || '아직 관계 설명이 없습니다.'}</p><div className="button-row"><Link className="primary-button" href={`/relationships/${relationshipId}/logs/new`}>기록 추가</Link><Link className="secondary-button" href={`/relationships/${relationshipId}/timeline`}>타임라인</Link><Link className="secondary-button" href={`/relationships/${relationshipId}/stats`}>통계</Link></div></div></section>
      <section className="stats-grid"><StatCard label="전체 기록" value={data.stats.total_logs} /><StatCard label="평균 감정" value={data.stats.average_emotion_score.toFixed(1)} tone={emotionTone(data.stats.average_emotion_score)} /><StatCard label="최근 7일" value={data.stats.recent_7_days_logs} /><StatCard label="마지막 기록" value={data.stats.last_log_date || '-'} /></section>
      <section className="two-column detail-columns">
        <article className="panel"><div className="panel-heading"><h3>최근 기록</h3><Link href={`/relationships/${relationshipId}/timeline`}>전체 타임라인</Link></div>{data.logs.length === 0 ? <Empty>첫 사건이나 대화를 기록해보세요.</Empty> : <div className="list-stack">{data.logs.map((log) => <Link className="list-row" href={`/logs/${log.log_id}`} key={log.log_id}><div><strong>{log.title}</strong><span>{eventTypes[log.event_type]} · {log.log_date}</span></div><span className={`score ${emotionTone(log.emotion_score)}`}>{log.emotion_score > 0 ? '+' : ''}{log.emotion_score}</span></Link>)}</div>}</article>
        <article className="panel ai-panel"><div><span className="badge ai">AI BETA</span><h3>관계 흐름 분석</h3><p>AI 분석은 기록이 충분히 쌓인 뒤 사용할 수 있습니다. 최소 10개 이상의 기록이 필요합니다.</p></div><button className="primary-button" onClick={analyze}>AI 분석 요청</button>{analysis?.message && <div className="ai-result"><strong>분석 안내</strong><p>{analysis.message}</p></div>}{analysis?.report && <div className="ai-result"><strong>{analysis.report.summary}</strong><p>{analysis.report.pattern_analysis}</p><p>{analysis.report.suggested_actions}</p></div>}</article>
      </section>
    </>}
  </div>
}
