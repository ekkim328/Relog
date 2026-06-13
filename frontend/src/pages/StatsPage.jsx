import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { getRelationshipStats } from '../api/relationshipStats'
import { getRelationship } from '../api/relationships'
import { ErrorNotice, Loading } from '../components/PageState'
import StatCard from '../components/StatCard'
import { eventTypes, emotionTone } from '../constants'

export default function StatsPage() {
  const { relationshipId } = useParams(); const [data, setData] = useState(null); const [error, setError] = useState('')
  useEffect(() => { Promise.all([getRelationship(relationshipId), getRelationshipStats(relationshipId)]).then(([relationship, stats]) => setData({ relationship, stats })).catch((e) => setError(errorMessage(e))) }, [relationshipId])
  if (!data && !error) return <Loading />
  const stats = data?.stats; const total = stats?.total_logs || 0; const percent = (value) => total ? Math.round(value / total * 100) : 0
  return <div className="page"><header className="page-header"><div><p className="eyebrow">STATISTICS</p><h2>{data?.relationship.name} 관계 통계</h2><p>기록에 나타난 감정과 활동을 요약했습니다.</p></div><Link className="secondary-button" to={`/relationships/${relationshipId}`}>상세로 돌아가기</Link></header><ErrorNotice message={error} />{stats && <><section className="stats-grid five"><StatCard label="전체 기록" value={stats.total_logs} /><StatCard label="평균 감정" value={stats.average_emotion_score.toFixed(1)} tone={emotionTone(stats.average_emotion_score)} /><StatCard label="최근 7일" value={stats.recent_7_days_logs} /><StatCard label="최근 30일" value={stats.recent_30_days_logs} /><StatCard label="관계 온도" value={`${stats.temperature_score}°`} /></section><section className="two-column"><article className="panel"><h3>감정 분포</h3><div className="distribution"><div><span>긍정</span><div><i className="positive" style={{ width: `${percent(stats.positive_logs)}%` }} /></div><strong>{stats.positive_logs}건 · {percent(stats.positive_logs)}%</strong></div><div><span>중립</span><div><i className="neutral" style={{ width: `${percent(stats.neutral_logs)}%` }} /></div><strong>{stats.neutral_logs}건 · {percent(stats.neutral_logs)}%</strong></div><div><span>부정</span><div><i className="negative" style={{ width: `${percent(stats.negative_logs)}%` }} /></div><strong>{stats.negative_logs}건 · {percent(stats.negative_logs)}%</strong></div></div></article><article className="panel summary-panel"><h3>기록 요약</h3><dl><div><dt>가장 많은 사건 유형</dt><dd>{stats.most_common_event_type ? eventTypes[stats.most_common_event_type] : '-'}</dd></div><div><dt>마지막 기록 날짜</dt><dd>{stats.last_log_date || '-'}</dd></div><div><dt>현재 관계 온도</dt><dd>{stats.temperature_score}°</dd></div></dl></article></section></>}</div>
}

