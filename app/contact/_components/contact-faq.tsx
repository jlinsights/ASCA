import { SiteFaqList } from '@/components/faq/site-faq-list'

export function ContactFaq() {
  return (
    <section className='container mx-auto px-4 py-12 md:py-16'>
      <div className='text-center mb-10'>
        <h2 className='text-2xl md:text-3xl font-bold mb-4'>자주 문의하시는 질문</h2>
        <div className='flex items-center justify-center gap-3 mt-6'>
          <a
            href='https://orientalcalligraphy.channel.io'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center rounded-md bg-scholar-red px-5 py-2.5 text-sm font-medium text-white hover:bg-scholar-red/90 transition-colors'
          >
            상담 문의
          </a>
          <a
            href='https://cal.com/orientalcalligraphy'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors'
          >
            상담 예약
          </a>
        </div>
      </div>

      <div className='max-w-4xl mx-auto'>
        <SiteFaqList />
      </div>
    </section>
  )
}
