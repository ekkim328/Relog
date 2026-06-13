export const relationTypes = {
  friend: '친구', lover: '연인', family: '가족', work: '직장', school: '학교', acquaintance: '지인', etc: '기타',
}
export const relationshipStatuses = {
  active: '활발함', distant: '거리감', conflict: '갈등', ended: '종료', unknown: '알 수 없음',
}
export const eventTypes = {
  conversation: '대화', conflict: '갈등', reconciliation: '화해', promise: '약속', gift: '선물', contact: '연락',
  avoidance: '회피', help: '도움', disappointment: '실망', positive_event: '긍정적 사건', etc: '기타',
}
export const emotionTone = (score) => score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'

