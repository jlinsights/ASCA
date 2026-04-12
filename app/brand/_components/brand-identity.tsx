import { Card, CardContent } from '@/components/ui/card'
import { BRAND_IDENTITY_ITEMS } from './brand-data'

export function BrandIdentity() {
  return (
    <section id='brand-identity' className='scroll-mt-24'>
      <h2 className='text-2xl font-bold mb-3'>브랜드 아이덴티티</h2>
      <p className='text-muted-foreground mb-8 leading-relaxed'>
        동양서예협회의 브랜드 아이덴티티는 수천 년의 서예 전통과 현대적 감각이 조화롭게 어우러진
        철학을 담고 있습니다. 붓과 먹의 정신을 이어받아 현대 사회에서 동양 서예의 아름다움과 깊이를
        전달합니다.
      </p>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {BRAND_IDENTITY_ITEMS.map(item => (
          <Card
            key={item.title}
            className='group transition-all hover:shadow-lg hover:-translate-y-1 border-l-4 border-l-transparent hover:border-l-scholar-red'
          >
            <CardContent className='p-5'>
              <h3 className='font-bold text-base mb-2 text-scholar-red group-hover:text-scholar-red/80 transition-colors'>
                {item.title}
              </h3>
              <p className='text-sm text-muted-foreground leading-relaxed'>{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
