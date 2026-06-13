import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createRelationship, getRelationship, updateRelationship } from '../api/relationships'
import { errorMessage } from '../api/client'
import { ErrorNotice, Loading } from '../components/PageState'
import { relationTypes, relationshipStatuses } from '../constants'

const initial = { name: '', relation_type: 'friend', description: '', start_date: '', current_status: 'active', temperature_score: 50 }

export default function RelationshipFormPage() {
  const { relationshipId } = useParams()
  const editing = Boolean(relationshipId)
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(editing)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  useEffect(() => { if (editing) getRelationship(relationshipId).then((data) => setForm({ ...data, start_date: data.start_date || '' })).catch((e) => setError(errorMessage(e))).finally(() => setLoading(false)) }, [editing, relationshipId])
  if (loading) return <Loading />

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const submit = async (e) => {
    e.preventDefault(); setError('')
    try {
      const payload = { ...form, temperature_score: Number(form.temperature_score), start_date: form.start_date || null }
      const saved = editing ? await updateRelationship(relationshipId, payload) : await createRelationship(payload)
      navigate(`/relationships/${saved.relationship_id}`)
    } catch (err) { setError(errorMessage(err)) }
  }
  return <div className="page narrow">
    <header className="page-header"><div><p className="eyebrow">{editing ? 'EDIT' : 'NEW RELATIONSHIP'}</p><h2>{editing ? '관계 정보 수정' : '새 관계 등록'}</h2></div><Link className="secondary-button" to={editing ? `/relationships/${relationshipId}` : '/relationships'}>취소</Link></header>
    <section className="panel form-panel"><ErrorNotice message={error} /><form className="form-grid" onSubmit={submit}>
      <label className="full">이름 또는 별칭<input required name="name" value={form.name} onChange={change} placeholder="관계를 떠올릴 수 있는 이름" /></label>
      <label>관계 유형<select name="relation_type" value={form.relation_type} onChange={change}>{Object.entries(relationTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>현재 상태<select name="current_status" value={form.current_status} onChange={change}>{Object.entries(relationshipStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>관계 시작일<input type="date" name="start_date" value={form.start_date} onChange={change} /></label>
      <label>관계 온도 <strong>{form.temperature_score}°</strong><input type="range" min="0" max="100" name="temperature_score" value={form.temperature_score} onChange={change} /></label>
      <label className="full">관계 설명<textarea name="description" rows="5" value={form.description || ''} onChange={change} placeholder="관계의 배경이나 기억해둘 맥락을 적어보세요." /></label>
      <div className="form-actions full"><button className="primary-button">{editing ? '변경 저장' : '관계 등록'}</button></div>
    </form></section>
  </div>
}

