'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FAQ_ITEMS } from './fundraising-data'

export function FundraisingFaq() {
  return (
    <section id='faq' className='scroll-mt-24'>
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-bold mb-2'>자주 문의하시는 질문</h2>
        <p className='text-sm text-muted-foreground'>
          모금, 연회비, 출품료, 회원 혜택 등 자주 묻는 질문을 모았습니다.
        </p>
        <div className='flex items-center justify-center gap-3 mt-4'>
          <a
            href='https://orientalcalligraphy.channel.io'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-lg bg-scholar-red px-4 py-2 text-sm font-medium text-white hover:bg-scholar-red/90 transition-colors'
          >
            상담 문의
          </a>
          <a
            href='https://cal.com/orientalcalligraphy'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors'
          >
            상담 예약
          </a>
        </div>
      </div>

      <div className='max-w-4xl mx-auto'>
        <Accordion type='single' collapsible className='space-y-3'>
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className='rounded-lg border bg-card px-4 md:px-6'
            >
              <AccordionTrigger className='text-left text-sm md:text-base font-medium py-4 hover:no-underline'>
                {item.q}
              </AccordionTrigger>
              <AccordionContent className='text-sm text-muted-foreground pb-4 whitespace-pre-line leading-relaxed'>
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
