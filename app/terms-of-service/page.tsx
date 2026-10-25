import type { Metadata } from 'next'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent } from '@/components/ui/card'
import { PageHero, HeroFacts } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { EMAIL, HEADQUARTERS, PHONE, formatAddress } from '@/lib/content/contact-info'
import {
  TERMS_EFFECTIVE,
  TERMS_ENACTED,
  termsAddenda,
  termsArticles,
  type TermsArticle,
} from './_data/terms-articles'

const DESCRIPTION =
  '사단법인 동양서예협회(동양서협) 웹사이트 이용약관. 회원 가입·탈퇴, 서비스 제공과 중단, 이용자의 의무, 개인정보 보호, 저작권, 약관 개정 절차를 안내합니다.'

export const metadata: Metadata = {
  title: '이용약관 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '이용약관 | 동양서예협회', description: DESCRIPTION },
}

const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩'

function ArticleCard({ article, no }: { article: TermsArticle; no: number }) {
  const numbered = article.clauses.length > 1
  return (
    <Card id={`article-${no}`} className='scroll-mt-24'>
      <CardContent className='p-6 md:p-8'>
        <h2 className='text-xl md:text-2xl font-bold mb-4'>
          제{no}조 {article.title}
        </h2>
        <div className='space-y-4 text-sm md:text-base text-muted-foreground'>
          {article.clauses.map((clause, index) => (
            <div key={index} className='space-y-3'>
              <p>
                {numbered && `${CIRCLED[index]} `}
                {clause.text}
              </p>
              {clause.items && (
                <ol className='bg-muted p-4 rounded-lg space-y-2'>
                  {clause.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      {itemIndex + 1}. {item}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
          {article.link && (
            <p>
              <Link
                href={article.link.href}
                className='font-medium text-scholar-red underline-offset-4 hover:underline'
              >
                {article.link.label} →
              </Link>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function TermsOfServicePage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <PageHero
        {...PAGE_HERO_MARKS.terms}
        title='이용약관'
        lede='사단법인 동양서예협회 웹사이트 이용약관'
      >
        <HeroFacts
          facts={[
            { label: '시행일', value: TERMS_EFFECTIVE },
            { label: '제정', value: TERMS_ENACTED },
          ]}
        />
      </PageHero>

      <section className='container py-10 md:py-16'>
        <div className='max-w-4xl mx-auto space-y-8'>
          <nav aria-label='조항 목차' className='rounded-lg border p-4 md:p-6'>
            <ol className='grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2'>
              {termsArticles.map((article, index) => (
                <li key={article.title}>
                  <a
                    href={`#article-${index + 1}`}
                    className='text-muted-foreground hover:text-foreground'
                  >
                    제{index + 1}조 {article.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {termsArticles.map((article, index) => (
            <ArticleCard key={article.title} article={article} no={index + 1} />
          ))}

          <Card className='bg-muted'>
            <CardContent className='p-6 md:p-8'>
              <h2 className='text-xl md:text-2xl font-bold mb-4'>부칙</h2>
              <div className='space-y-2 text-sm md:text-base text-muted-foreground'>
                {termsAddenda.map((line, index) => (
                  <p key={line}>
                    {CIRCLED[index]} {line}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-r from-scholar-red/5 to-scholar-red/10 border-scholar-red/20'>
            <CardContent className='p-6 md:p-8 text-center'>
              <h2 className='text-lg md:text-xl font-bold mb-4'>문의</h2>
              <p className='text-sm md:text-base text-muted-foreground mb-4'>
                이용약관에 대해 궁금한 점은 아래로 문의해 주세요.
              </p>
              <div className='space-y-2 text-sm text-muted-foreground'>
                <p>
                  ✉︎ <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </p>
                <p>
                  ☎︎ <a href={PHONE.href}>{PHONE.display}</a>
                </p>
                <p>{formatAddress(HEADQUARTERS)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
