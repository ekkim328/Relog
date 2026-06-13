'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getDashboardSummary } from '@/lib/api/relationshipStats'
import { errorMessage } from '@/lib/api/client'
import { Empty, ErrorNotice, Loading } from '@/components/PageState'
import StatCard from '@/components/StatCard'
import { eventTypes, emotionTone } from '@/lib/constants'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { getDashboardSummary().then(setData).catch((err) => setError(errorMessage(err))) }, [])
  if (!data && !error) return <Loading />

  return (
    <div className="page">
      <header className="page-header">
        <div><p className="eyebrow">OVERVIEW</p><h2>관계 대시보드</h2><p>최근 기록과 관계의 온도를 한눈에 살펴보세요.</p></div>
        <Link className="primary-button" href="/relationships/new">관계 등록</Link>
      </header>
      <ErrorNotice message={error} />
      {data && <>
        <section className="stats-grid five">
          <StatCard label="전체 관계" value={data.total_relationships} />
          <StatCard label="전체 기록" value={data.total_logs} />
          <StatCard label="최근 7일" value={data.recent_7_days_logs} />
          <StatCard label="최근 30일" value={data.recent_30_days_logs} />
          <StatCard label="평균 감정" value={data.average_emotion_score.toFixed(1)} tone={emotionTone(data.average_emotion_score)} />
        </section>
        <section className="two-column">
          <article className="panel">
            <div className="panel-heading"><h3>최근 기록</h3><Link href="/relationships">전체 관계 보기</Link></div>
            {data.recent_logs.length === 0 ? <Empty>첫 관계와 기록을 추가해보세요.</Empty> : <div className="list-stack">
              {data.recent_logs.map((log) => <Link className="list-row" key={log.log_id} href={`/logs/${log.log_id}`}>
                <div><strong>{log.title}</strong><span>{log.relationship_name} · {eventTypes[log.event_type] || log.event_type}</span></div>
                <div className="row-meta"><span className={`score ${emotionTone(log.emotion_score)}`}>{log.emotion_score > 0 ? '+' : ''}{log.emotion_score}</span><time>{log.log_date}</time></div>
              </Link>)}
            </div>}
          </article>
          <div className="panel-stack">
            <article className="panel">
              <div className="panel-heading"><h3>온도가 낮은 관계</h3><span className="badge warning">주의</span></div>
              {data.low_temperature_relationships.length === 0 ? <Empty>현재 주의가 필요한 관계가 없습니다.</Empty> : data.low_temperature_relationships.map((item) => <Link className="temperature-row" key={item.relationship_id} href={`/relationships/${item.relationship_id}`}><span>{item.name}</span><strong>{item.temperature_score}°</strong></Link>)}
            </article>
            <article className="panel">
              <h3>최근 부정 기록</h3>
              {data.relationships_with_negative_logs.length === 0 ? <p className="muted">최근 30일간 부정 기록이 없습니다.</p> : data.relationships_with_negative_logs.map((item) => <Link className="temperature-row" key={item.relationship_id} href={`/relationships/${item.relationship_id}`}><span>{item.name}</span><strong>{item.negative_log_count}건</strong></Link>)}
            </article>
          </div>
        </section>
      </>}
    </div>
  )
}
