import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
          사단법인 동양서예협회
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          正法의 계승, 創新의 조화
        </p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          동양 서예 문화의 발전과 보급을 선도하는 사단법인 동양서예협회입니다.
        </p>
      </section>

      {/* Quick Navigation */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Link href="/exhibitions" className="group p-6 border rounded-lg hover:shadow-lg transition-all">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">전시</h3>
          <p className="text-muted-foreground">현재 진행 중인 전시와 예정된 전시를 확인하세요</p>
        </Link>
        
        <Link href="/artworks" className="group p-6 border rounded-lg hover:shadow-lg transition-all">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">작품</h3>
          <p className="text-muted-foreground">다양한 서예 작품들을 감상해보세요</p>
        </Link>
        
        <Link href="/artists" className="group p-6 border rounded-lg hover:shadow-lg transition-all">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">작가</h3>
          <p className="text-muted-foreground">협회 소속 작가들을 만나보세요</p>
        </Link>
        
        <Link href="/events" className="group p-6 border rounded-lg hover:shadow-lg transition-all">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">행사</h3>
          <p className="text-muted-foreground">다양한 서예 행사에 참여하세요</p>
        </Link>
      </section>

      {/* Recent Updates */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">최근 소식</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">새로운 전시 개최</h3>
            <p className="text-muted-foreground mb-4">2024년 동양서예협회 정기전시가 개최됩니다.</p>
            <Link href="/exhibitions" className="text-primary hover:underline">자세히 보기</Link>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">신규 작가 모집</h3>
            <p className="text-muted-foreground mb-4">동양서예협회에서 신규 작가를 모집합니다.</p>
            <Link href="/artists" className="text-primary hover:underline">자세히 보기</Link>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">서예 교육 프로그램</h3>
            <p className="text-muted-foreground mb-4">초보자를 위한 서예 교육 프로그램을 운영합니다.</p>
            <Link href="/events" className="text-primary hover:underline">자세히 보기</Link>
          </div>
        </div>
      </section>
    </div>
  )
}