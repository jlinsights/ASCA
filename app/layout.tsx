export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ASCA | 사단법인 동양서예협회</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}