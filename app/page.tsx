export default function HomePage() {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ASCA | 사단법인 동양서예협회</title>
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#ffffff' }}>
        <header style={{ 
          backgroundColor: '#ffffff', 
          borderBottom: '1px solid #e5e7eb', 
          padding: '1rem 0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '0 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#111827', 
              margin: 0 
            }}>
              동양서예협회
            </h1>
            <nav style={{ display: 'flex', gap: '2rem' }}>
              <a href="/exhibitions" style={{ color: '#6b7280', textDecoration: 'none' }}>전시</a>
              <a href="/artworks" style={{ color: '#6b7280', textDecoration: 'none' }}>작품</a>
              <a href="/artists" style={{ color: '#6b7280', textDecoration: 'none' }}>작가</a>
              <a href="/events" style={{ color: '#6b7280', textDecoration: 'none' }}>행사</a>
            </nav>
          </div>
        </header>
        
        <main style={{ minHeight: '70vh' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '1.5rem',
                lineHeight: '1.2'
              }}>
                사단법인 동양서예협회
              </h1>
              <p style={{ 
                fontSize: '1.25rem', 
                color: '#6b7280', 
                marginBottom: '2rem' 
              }}>
                正法의 계승, 創新의 조화
              </p>
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#6b7280', 
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                동양 서예 문화의 발전과 보급을 선도하는 사단법인 동양서예협회입니다.
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1.5rem',
              marginBottom: '4rem'
            }}>
              <a href="/exhibitions" style={{ 
                padding: '1.5rem', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s ease',
                display: 'block'
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>전시</h3>
                <p style={{ color: '#6b7280', margin: 0 }}>현재 진행 중인 전시와 예정된 전시를 확인하세요</p>
              </a>
              
              <a href="/artworks" style={{ 
                padding: '1.5rem', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s ease',
                display: 'block'
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>작품</h3>
                <p style={{ color: '#6b7280', margin: 0 }}>다양한 서예 작품들을 감상해보세요</p>
              </a>
              
              <a href="/artists" style={{ 
                padding: '1.5rem', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s ease',
                display: 'block'
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>작가</h3>
                <p style={{ color: '#6b7280', margin: 0 }}>협회 소속 작가들을 만나보세요</p>
              </a>
              
              <a href="/events" style={{ 
                padding: '1.5rem', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s ease',
                display: 'block'
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>행사</h3>
                <p style={{ color: '#6b7280', margin: 0 }}>다양한 서예 행사에 참여하세요</p>
              </a>
            </div>

            <div>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '2rem',
                color: '#111827'
              }}>최근 소식</h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '1.5rem'
              }}>
                <div style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem', 
                  padding: '1.5rem',
                  backgroundColor: '#ffffff'
                }}>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: '#111827'
                  }}>새로운 전시 개최</h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>2024년 동양서예협회 정기전시가 개최됩니다.</p>
                  <a href="/exhibitions" style={{ color: '#2563eb', textDecoration: 'none' }}>자세히 보기</a>
                </div>
                
                <div style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem', 
                  padding: '1.5rem',
                  backgroundColor: '#ffffff'
                }}>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: '#111827'
                  }}>신규 작가 모집</h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>동양서예협회에서 신규 작가를 모집합니다.</p>
                  <a href="/artists" style={{ color: '#2563eb', textDecoration: 'none' }}>자세히 보기</a>
                </div>
                
                <div style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem', 
                  padding: '1.5rem',
                  backgroundColor: '#ffffff'
                }}>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: '#111827'
                  }}>서예 교육 프로그램</h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>초보자를 위한 서예 교육 프로그램을 운영합니다.</p>
                  <a href="/events" style={{ color: '#2563eb', textDecoration: 'none' }}>자세히 보기</a>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <footer style={{ 
          backgroundColor: '#111827', 
          color: '#ffffff', 
          padding: '3rem 0' 
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '0 1rem',
            textAlign: 'center' 
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem' 
            }}>사단법인 동양서예협회</h3>
            <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>正法의 계승, 創新의 조화</p>
            <p style={{ color: '#9ca3af', margin: 0 }}>동양 서예 문화의 발전과 보급을 선도합니다</p>
          </div>
        </footer>
      </body>
    </html>
  )
}