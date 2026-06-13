'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { errorMessage } from '@/lib/api/client'
import { getEmotionTags } from '@/lib/api/emotionTags'
import { createLog, getLog, updateLog } from '@/lib/api/relationshipLogs'
import { ErrorNotice, Loading } from '@/components/PageState'
import { eventTypes } from '@/lib/constants'

const today = () => new Date().toISOString().slice(0, 10)
const initial = { log_date: today(), title: '', content: '', event_type: 'conversation', emotion_score: 0, importance_score: 3, my_action: '', other_action: '', result: '', memo: '', emotion_tag_ids: [] }

export default function LogFormPage({ relationshipId = null, logId = null }) {
  const editing = Boolean(logId)
  const [form, setForm] = useState(initial)
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    Promise.all([getEmotionTags(), editing ? getLog(logId) : Promise.resolve(null)])
      .then(([tagData, log]) => {
        setTags(tagData)
        if (log) setForm({ ...log, emotion_tag_ids: log.emotion_tags.map((tag) => tag.emotion_tag_id) })
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [editing, logId])

  if (loading) return <Loading />
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const toggleTag = (id) => setForm({ ...form, emotion_tag_ids: form.emotion_tag_ids.includes(id) ? form.emotion_tag_ids.filter((item) => item !== id) : [...form.emotion_tag_ids, id] })
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const payload = { ...form, emotion_score: Number(form.emotion_score), importance_score: Number(form.importance_score) }
      const saved = editing ? await updateLog(logId, payload) : await createLog(relationshipId, payload)
      router.push(`/logs/${saved.log_id}`)
      router.refresh()
    } catch (err) {
      setError(errorMessage(err))
    }
  }
  const back = editing ? `/logs/${logId}` : `/relationships/${relationshipId}`

  return <div className="page narrow"><header className="page-header"><div><p className="eyebrow">JOURNAL</p><h2>{editing ? '기록 수정' : '새 기록 작성'}</h2><p>사실과 감정을 구분해 적으면 흐름을 더 잘 볼 수 있습니다.</p></div><Link className="secondary-button" href={back}>취소</Link></header><section className="panel form-panel"><ErrorNotice message={error} /><form className="form-grid" onSubmit={submit}>
    <label>기록 날짜<input required type="date" name="log_date" value={form.log_date} onChange={change} /></label><label>사건 유형<select name="event_type" value={form.event_type} onChange={change}>{Object.entries(eventTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label className="full">제목<input required name="title" value={form.title} onChange={change} placeholder="무슨 일이 있었나요?" /></label><label className="full">내용<textarea required rows="7" name="content" value={form.content} onChange={change} placeholder="대화와 사건을 가능한 구체적으로 적어보세요." /></label>
    <label>감정 점수 <strong>{form.emotion_score}</strong><input type="range" min="-5" max="5" name="emotion_score" value={form.emotion_score} onChange={change} /><span className="range-labels"><small>부정 -5</small><small>긍정 +5</small></span></label><label>중요도 <strong>{form.importance_score}</strong><input type="range" min="1" max="5" name="importance_score" value={form.importance_score} onChange={change} /><span className="range-labels"><small>낮음</small><small>높음</small></span></label>
    <fieldset className="full"><legend>감정 태그</legend><div className="tag-picker">{tags.map((tag) => <button type="button" className={form.emotion_tag_ids.includes(tag.emotion_tag_id) ? `tag selected ${tag.category}` : 'tag'} key={tag.emotion_tag_id} onClick={() => toggleTag(tag.emotion_tag_id)}>{tag.name}</button>)}</div></fieldset>
    <label>내 행동<textarea rows="3" name="my_action" value={form.my_action || ''} onChange={change} /></label><label>상대방 행동<textarea rows="3" name="other_action" value={form.other_action || ''} onChange={change} /></label><label className="full">사건 결과<textarea rows="3" name="result" value={form.result || ''} onChange={change} /></label><label className="full">추가 메모<textarea rows="3" name="memo" value={form.memo || ''} onChange={change} /></label>
    <div className="form-actions full"><button className="primary-button">{editing ? '변경 저장' : '기록 저장'}</button></div>
  </form></section></div>
}
