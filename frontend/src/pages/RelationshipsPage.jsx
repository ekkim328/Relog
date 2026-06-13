import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRelationships } from '../api/relationships'
import { errorMessage } from '../api/client'
import { Empty, ErrorNotice, Loading } from '../components/PageState'
import { relationTypes, relationshipStatuses } from '../constants'

export default function RelationshipsPage() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { getRelationships().then(setItems).catch((e) => setError(errorMessage(e))) }, [])
  if (!items && !error) return <Loading />
  return <div className="page">
    <header className="page-header"><div><p className="eyebrow">PEOPLE</p><h2>관계 목록</h2><p>기록하고 있는 관계를 살펴보세요.</p></div><Link className="primary-button" to="/relationships/new">새 관계</Link></header>
    <ErrorNotice message={error} />
    {items?.length === 0 ? <Empty>아직 등록된 관계가 없습니다.</Empty> : <section className="relationship-grid">
      {items?.map((item) => <Link className="relationship-card" key={item.relationship_id} to={`/relationships/${item.relationship_id}`}>
        <div className="card-top"><span className="avatar">{item.name.slice(0, 1)}</span><span className={`status ${item.current_status}`}>{relationshipStatuses[item.current_status]}</span></div>
        <h3>{item.name}</h3><p>{relationTypes[item.relation_type]}</p>
        <div className="temperature"><span>관계 온도</span><strong>{item.temperature_score}°</strong><div><i style={{ width: `${item.temperature_score}%` }} /></div></div>
        <footer>최근 기록 {item.recent_log_date || '없음'}</footer>
      </Link>)}
    </section>}
  </div>
}

