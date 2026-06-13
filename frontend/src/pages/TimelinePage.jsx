import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { getRelationshipTimeline } from '../api/relationshipStats'
import { getRelationship } from '../api/relationships'
import { Empty, ErrorNotice, Loading } from '../components/PageState'
import { emotionTone, eventTypes } from '../constants'

export default function TimelinePage() {
  const { relationshipId } = useParams(); const [data, setData] = useState(null); const [error, setError] = useState('')
  useEffect(() => { Promise.all([getRelationship(relationshipId), getRelationshipTimeline(relationshipId)]).then(([relationship, logs]) => setData({ relationship, logs })).catch((e) => setError(errorMessage(e))) }, [relationshipId])
  if (!data && !error) return <Loading />
  return <div className="page narrow"><header className="page-header"><div><p className="eyebrow">TIMELINE</p><h2>{data?.relationship.name}와의 기록</h2><p>오래된 기록부터 시간순으로 정리했습니다.</p></div><div className="button-row"><Link className="secondary-button" to={`/relationships/${relationshipId}`}>상세로</Link><Link className="primary-button" to={`/relationships/${relationshipId}/logs/new`}>기록 추가</Link></div></header><ErrorNotice message={error} />{data?.logs.length === 0 ? <Empty>아직 타임라인에 표시할 기록이 없습니다.</Empty> : <section className="timeline">{data?.logs.map((log) => <article className="timeline-item" key={log.log_id}><div className={`timeline-dot ${emotionTone(log.emotion_score)}`} /><time>{log.log_date}</time><div className="panel"><div className="panel-heading"><div><span className="badge">{eventTypes[log.event_type]}</span><h3>{log.title}</h3></div><span className={`score ${emotionTone(log.emotion_score)}`}>{log.emotion_score > 0 ? '+' : ''}{log.emotion_score}</span></div><p>{log.content.length > 150 ? `${log.content.slice(0, 150)}...` : log.content}</p><div className="tag-picker">{log.emotion_tags.map((tag) => <span className={`tag selected ${tag.category}`} key={tag.emotion_tag_id}>{tag.name}</span>)}</div><Link className="text-link" to={`/logs/${log.log_id}`}>기록 상세 보기</Link></div></article>)}</section>}</div>
}

