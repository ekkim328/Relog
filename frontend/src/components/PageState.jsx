export function Loading() { return <div className="page-state">데이터를 불러오는 중입니다.</div> }
export function Empty({ children = '아직 표시할 데이터가 없습니다.' }) { return <div className="empty-state">{children}</div> }
export function ErrorNotice({ message }) { return message ? <div className="error-notice">{message}</div> : null }

