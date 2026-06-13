import '../src/styles.css'

export const metadata = {
  title: { default: 'Relog', template: '%s | Relog' },
  description: '관계의 사건과 감정을 기록하고 흐름을 확인하는 관계 저널',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
